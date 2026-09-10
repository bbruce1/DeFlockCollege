<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\SchoolDomain;
use App\Chapters\VerificationTicket;
use App\Mail\VerificationLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use InvalidArgumentException;

/**
 * Sends the link that proves somebody controls a school address.
 *
 * A domain that already has a chapter is told so immediately and sent to it,
 * rather than being mailed a link that would only end at the same message. That
 * reveals nothing: chapters are public, listed, and indexed, so their existence
 * was never the secret. What stays hidden is which addresses exist, and this
 * endpoint still answers identically on that.
 */
final class VerificationController extends Controller
{
    /** Per address, so one mailbox cannot be flooded. */
    private const MAX_PER_EMAIL_PER_HOUR = 5;

    /** Per client, so we cannot be used as a relay to many addresses. */
    private const MAX_PER_IP_PER_HOUR = 10;

    public function __construct(private readonly ChapterRepository $chapters) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email:rfc', 'max:254'],
            'purpose' => ['nullable', 'string', 'in:create,edit'],
        ]);

        $email = Ownership::normalise($validated['email']);
        $purpose = $validated['purpose'] ?? 'create';

        try {
            $domain = SchoolDomain::fromEmail($email);
        } catch (InvalidArgumentException $e) {
            // The domain rule is a stated requirement, not a secret, so saying why
            // costs nothing and saves the person a guess.
            return back()->withErrors(['email' => $e->getMessage()])->withInput();
        }

        // One school, one chapter. Sending a link here would waste the person's
        // time and a mail, and end at exactly this message.
        //
        // Only when they are trying to create one. Somebody asking for an edit
        // link is asking about the chapter that already exists, so short
        // circuiting on the same condition would make re-verifying the school
        // address — the documented way back into a chapter — impossible.
        if ($purpose === 'create' && $chapter = $this->chapters->findByDomain($domain)) {
            return back()->with('existing', [
                'slug' => $chapter->slug,
                'shortName' => $chapter->shortName,
            ]);
        }

        if ($limit = $this->exceededLimit($request, $email)) {
            return back()->withErrors(['email' => $limit])->withInput();
        }

        $ticket = VerificationTicket::issue($email, $purpose);
        $schoolName = $domain->known()[0] ?? $domain->registrable;
        $url = $this->destinationFor($purpose, $domain, $ticket);

        Mail::to($email)->send(new VerificationLink(
            url: $url,
            schoolName: $schoolName,
            minutesValid: VerificationTicket::LIFETIME_MINUTES,
            isEdit: $purpose === 'edit',
        ));

        // On a developer's own machine the link is also written to the log, so
        // testing does not depend on whether a spam filter let the mail through.
        // Local only, and to the log rather than the response: putting a
        // verification link on a page would defeat the gate it exists to be.
        if (app()->isLocal()) {
            Log::info('Verification link issued', ['email' => $email, 'url' => $url]);
        }

        // Identical wording regardless of what exists at that domain.
        return back()->with('status', "Check {$email}. The link works for "
            .VerificationTicket::LIFETIME_MINUTES.' minutes.');
    }

    /**
     * An edit link has to land on the chapter being edited, not on the create
     * page. A domain with nothing to edit falls back to creating, which is what
     * the person almost certainly wanted.
     */
    private function destinationFor(
        string $purpose,
        SchoolDomain $domain,
        VerificationTicket $ticket,
    ): string {
        $token = $ticket->toToken();

        if ($purpose === 'edit' && $chapter = $this->chapters->findByDomain($domain)) {
            return route('chapters.edit', ['slug' => $chapter->slug, 'ticket' => $token]);
        }

        return route('chapters.start', ['ticket' => $token]);
    }

    private function exceededLimit(Request $request, string $email): ?string
    {
        // Keyed on the HMAC rather than the address, so the rate limiter's own
        // store never holds an email in the clear. The client digest is keyed
        // for the same reason: IPv4 is small enough to enumerate, so a bare
        // hash of an address is a reversible record of who asked for a link.
        $emailKey = 'verify-email:'.Ownership::record($email);
        $ipKey = 'verify-ip:'.hash_hmac('sha256', (string) $request->ip(), (string) config('app.key'));

        if (RateLimiter::tooManyAttempts($emailKey, self::MAX_PER_EMAIL_PER_HOUR)) {
            $minutes = (int) ceil(RateLimiter::availableIn($emailKey) / 60);

            return "That address has been sent several links already. Try again in {$minutes} minutes.";
        }

        if (RateLimiter::tooManyAttempts($ipKey, self::MAX_PER_IP_PER_HOUR)) {
            $minutes = (int) ceil(RateLimiter::availableIn($ipKey) / 60);

            return "Too many requests from this connection. Try again in {$minutes} minutes.";
        }

        RateLimiter::hit($emailKey, 3600);
        RateLimiter::hit($ipKey, 3600);

        return null;
    }
}
