<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\EditKey;
use App\Mail\EditKeyIssued;
use App\Chapters\EditPass;
use App\Chapters\Ownership;
use App\Chapters\SchoolColours;
use App\Chapters\SocialHandle;
use App\Chapters\States;
use App\Chapters\VerificationTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;
use App\Officials\OfficialInput;
use App\Officials\OfficialRole;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Editing a chapter after it exists.
 *
 * Ownership can be proved two ways, and both prove the same thing.
 *
 * The edit key is the everyday route: shown once at creation, held only as a
 * bcrypt hash, and entered from the button in the page's footer. Losing it does
 * not lose the chapter, because re-verifying the school address that created it
 * still works — that address is the original proof and the check is against the
 * stored HMAC, so one person at a school cannot take over another's chapter.
 */
final class ChapterEditController extends Controller
{
    public function __construct(private readonly ChapterRepository $chapters) {}

    /*
     * The key is 100 bits, so guessing is not the threat these limits address.
     * Verifying one costs a deliberate ~250ms of bcrypt, which makes an open
     * unlock endpoint a cheap way to burn the server's CPU. Both limits are
     * therefore about work done, not about guesses allowed.
     */

    /** Attempts against one chapter. A creator typing carefully needs very few. */
    private const MAX_UNLOCK_ATTEMPTS_PER_CHAPTER = 5;

    /** Attempts from one client across every chapter, so spraying is bounded too. */
    private const MAX_UNLOCK_ATTEMPTS_PER_CLIENT = 8;

    private const UNLOCK_WINDOW_SECONDS = 3600;

    /** One replacement key an hour, per client and per address. */
    private const MAX_RECOVERIES_PER_WINDOW = 1;

    private const RECOVERY_WINDOW_SECONDS = 3600;

    public function edit(Request $request, string $slug): Response|RedirectResponse
    {
        $chapter = $this->requireChapter($slug);
        $token = (string) $request->query('ticket', '');
        $pass = (string) $request->query('pass', '');

        // Arriving from the footer button carries neither proof, so ask for the
        // key rather than turning somebody away.
        if ($token === '' && $pass === '') {
            return Inertia::render('Chapters/Unlock', [
            // Reached only by a signed link; never indexed or previewed.
            'meta' => \App\Site\PageMeta::private('Unlock')->toArray(),
                'chapter' => [
                    'slug' => $chapter->slug,
                    'shortName' => $chapter->shortName,
                ],
            ]);
        }

        if ($pass !== '') {
            try {
                $proof = EditPass::fromToken($pass, $chapter->slug);
            } catch (RuntimeException $e) {
                return redirect()->route('chapters.edit', $chapter->slug)
                    ->withErrors(['key' => $e->getMessage()]);
            }

            return $this->editor($chapter, '', $pass, $proof->minutesRemaining());
        }

        try {
            $ticket = VerificationTicket::fromToken($token, 'edit');
        } catch (RuntimeException $e) {
            return redirect()->route('chapters.show', $chapter->slug)
                ->withErrors(['email' => $e->getMessage()]);
        }

        if (! $chapter->isOwnedBy($ticket->email)) {
            return redirect()->route('chapters.show', $chapter->slug)->withErrors([
                'email' => 'That address did not start this chapter, so it cannot edit it.',
            ]);
        }

        return $this->editor($chapter, $token, '', $ticket->minutesRemaining());
    }

    /**
     * Exchanges the edit key for a short-lived ticket.
     *
     * The ticket is the same one the email route issues, so everything past
     * this point is identical however ownership was proved.
     */
    public function unlock(Request $request, string $slug): RedirectResponse
    {
        $chapter = $this->requireChapter($slug);

        $validated = $request->validate([
            'key' => ['required', 'string', 'max:60'],
        ]);

        $chapterKey = 'chapter-unlock:'.$chapter->slug;
        // The client is identified by a keyed digest rather than a stored address.
        $clientKey = 'chapter-unlock-client:'.hash_hmac('sha256', (string) $request->ip(), config('app.key'));

        foreach ([
            [$chapterKey, self::MAX_UNLOCK_ATTEMPTS_PER_CHAPTER],
            [$clientKey, self::MAX_UNLOCK_ATTEMPTS_PER_CLIENT],
        ] as [$limiter, $allowed]) {
            if (RateLimiter::tooManyAttempts($limiter, $allowed)) {
                $minutes = max(1, (int) ceil(RateLimiter::availableIn($limiter) / 60));

                return back()->withErrors([
                    'key' => "Too many attempts. Try again in {$minutes} minutes, or request "
                        .'an edit link at the school address that created this chapter.',
                ]);
            }
        }

        // Counted before the hash is checked, so a failed attempt always costs
        // an attempt even if the request is abandoned mid-flight.
        RateLimiter::hit($chapterKey, self::UNLOCK_WINDOW_SECONDS);
        RateLimiter::hit($clientKey, self::UNLOCK_WINDOW_SECONDS);

        if (! EditKey::matches($chapter->editKeyHash, $validated['key'])) {
            $remaining = RateLimiter::remaining($chapterKey, self::MAX_UNLOCK_ATTEMPTS_PER_CHAPTER);

            return back()->withErrors([
                'key' => 'That key does not match this chapter.'
                    .($remaining > 0 ? " {$remaining} attempts left before this locks for an hour." : ''),
            ]);
        }

        // Only a correct key clears the counters, so a run of failures still
        // costs an attacker their whole allowance.
        RateLimiter::clear($chapterKey);
        RateLimiter::clear($clientKey);

        return redirect()->route('chapters.edit', [
            'slug' => $chapter->slug,
            'pass' => EditPass::issue($chapter->slug)->toToken(),
        ]);
    }

    /**
     * Sends a replacement edit key to the address that created the chapter.
     *
     * Nothing here needs the creator's address on file: they supply it, it is
     * checked against the stored HMAC, and the mail goes to the address that
     * check just proved. So a lost key is recoverable without this application
     * ever holding a list of who created what.
     *
     * The answer is the same whether or not the address matched. Which student
     * started a chapter is not public the way the chapter itself is, and this
     * endpoint must not be a way to find out.
     */
    public function recoverKey(Request $request, string $slug): RedirectResponse
    {
        $chapter = $this->requireChapter($slug);

        $validated = $request->validate([
            'email' => ['required', 'email:rfc', 'max:180'],
        ]);

        $clientKey = 'key-recovery-client:'.hash_hmac('sha256', (string) $request->ip(), config('app.key'));
        // Keyed by the same HMAC the chapter stores, so the limiter never holds
        // an address either.
        $addressKey = 'key-recovery-address:'.Ownership::record($validated['email']);

        $uniform = back()->with(
            'status',
            'If that address created this chapter, a new key is on its way to it. '
                .'Only one can be sent per hour.'
        );

        foreach ([$clientKey, $addressKey] as $limiter) {
            if (RateLimiter::tooManyAttempts($limiter, self::MAX_RECOVERIES_PER_WINDOW)) {
                return $uniform;
            }
        }

        // Counted before the ownership check, so probing addresses costs the
        // same as asking legitimately.
        RateLimiter::hit($clientKey, self::RECOVERY_WINDOW_SECONDS);
        RateLimiter::hit($addressKey, self::RECOVERY_WINDOW_SECONDS);

        if (! $chapter->isOwnedBy($validated['email'])) {
            return $uniform;
        }

        $key = EditKey::generate();

        $this->chapters->save($chapter->withEditKeyHash(EditKey::hash($key)));

        Mail::to($validated['email'])->send(new EditKeyIssued(
            editKey: $key,
            schoolName: $chapter->shortName,
            chapterUrl: route('chapters.show', $chapter->slug),
        ));

        return $uniform;
    }

    private function editor(Chapter $chapter, string $token, string $pass, int $minutes): Response
    {
        return Inertia::render('Chapters/Edit', [
            'chapter' => $chapter->toPublicArray(),
            'ticket' => $token,
            'pass' => $pass,
            'minutesRemaining' => $minutes,
            'roles' => OfficialRole::options(),
            'stateName' => States::name($chapter->state),
        ]);
    }

    public function update(Request $request, string $slug): RedirectResponse
    {
        $chapter = $this->requireChapter($slug);

        $validated = $request->validate([
            'ticket' => ['nullable', 'string'],
            'pass' => ['nullable', 'string'],
            'instagram' => ['required', 'string', 'max:120'],
            'tiktok' => ['nullable', 'string', 'max:120'],
            // A creator-supplied link leaves the site, so the scheme is allowlisted
            // rather than trusted, and the page marks it as not ours.
            'petitionUrl' => ['nullable', 'url:https', 'max:300'],
            'primaryColour' => ['nullable', 'string', 'max:9'],
            'secondaryColour' => ['nullable', 'string', 'max:9'],
            'officials' => ['nullable', 'array', 'max:6'],
            'officials.*.name' => ['nullable', 'string', 'max:120'],
            'officials.*.title' => ['nullable', 'string', 'max:140'],
            'officials.*.email' => ['nullable', 'string', 'max:180'],
            'officials.*.url' => ['nullable', 'string', 'max:300'],
            'officials.*.role' => ['nullable', 'string', 'max:40'],
        ]);

        try {
            $this->requireProof($chapter, $validated);
        } catch (RuntimeException $e) {
            return redirect()->route('chapters.edit', $chapter->slug)
                ->withErrors(['key' => $e->getMessage()]);
        }

        /*
         * A PATCH carries the fields being changed, not the whole chapter, and
         * the file is rewritten whole on every save. A field the form did not
         * send is therefore left as it was: reading absence as "clear this"
         * deletes work the creator never touched, silently and with no error.
         * Sending the field empty still clears it, which is how a creator
         * removes one.
         */
        try {
            $instagram = SocialHandle::normalise($validated['instagram'] ?? null, 'instagram');

            $tiktok = $request->exists('tiktok')
                ? SocialHandle::normalise($validated['tiktok'] ?? null, 'tiktok')
                : $chapter->tiktok;

            $petitionUrl = $request->exists('petitionUrl')
                ? ($validated['petitionUrl'] ?? null)
                : $chapter->petitionUrl;

            $officials = $request->exists('officials')
                ? OfficialInput::sanitiseAll($validated['officials'] ?? [])
                : $chapter->officials;

            $colours = $request->exists('primaryColour') || $request->exists('secondaryColour')
                ? SchoolColours::fromInput(
                    $validated['primaryColour'] ?? null,
                    $validated['secondaryColour'] ?? null,
                )
                : $chapter->colours;
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['officials' => $e->getMessage()])->withInput();
        }

        $this->chapters->save(new Chapter(
            slug: $chapter->slug,
            schoolName: $chapter->schoolName,
            shortName: $chapter->shortName,
            state: $chapter->state,
            city: $chapter->city,
            ownerDomain: $chapter->ownerDomain,
            ownerRecord: $chapter->ownerRecord,
            survey: $chapter->survey,
            instagram: $instagram,
            tiktok: $tiktok,
            petitionUrl: $petitionUrl,
            officials: $officials,
            editKeyHash: $chapter->editKeyHash,
            acknowledgedAt: $chapter->acknowledgedAt,
            colours: $colours,
            createdAt: $chapter->createdAt,
            updatedAt: now()->toIso8601String(),
        ));

        return redirect()->route('chapters.show', $chapter->slug)
            ->with('status', 'Saved.');
    }

    /**
     * Either proof is enough, and both are checked against this chapter.
     *
     * @param  array<string, mixed>  $validated
     *
     * @throws RuntimeException when neither proof holds
     */
    private function requireProof(Chapter $chapter, array $validated): void
    {
        $pass = (string) ($validated['pass'] ?? '');

        if ($pass !== '') {
            EditPass::fromToken($pass, $chapter->slug);

            return;
        }

        $token = (string) ($validated['ticket'] ?? '');

        if ($token === '') {
            throw new RuntimeException('That editing session has ended. Enter your key again.');
        }

        $ticket = VerificationTicket::fromToken($token, 'edit');

        if (! $chapter->isOwnedBy($ticket->email)) {
            throw new RuntimeException(
                'That address did not start this chapter, so it cannot edit it.'
            );
        }
    }

    private function requireChapter(string $slug): Chapter
    {
        $chapter = $this->chapters->findBySlugString($slug);

        if ($chapter === null) {
            throw new NotFoundHttpException("No chapter exists at \"{$slug}\".");
        }

        return $chapter;
    }
}
