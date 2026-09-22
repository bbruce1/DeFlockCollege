<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\ChapterRepository;
use App\Chapters\VerificationTicket;
use App\Site\PageMeta;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

/**
 * Which school, when one address covers many of them.
 *
 * A university email names one institution, so a verified address is enough to
 * know which chapter it belongs to. A district email is not: every high school
 * in a county shares it. So before a district address starts anything, it is
 * shown what already exists under that domain, and picks.
 *
 * Serves both purposes from one screen. Somebody creating sees the chapters
 * their district already has and can start one for a school that is missing;
 * somebody who asked for an edit link picks the chapter they meant, because
 * their domain alone cannot say.
 */
final class DistrictChoiceController extends Controller
{
    public function __construct(private readonly ChapterRepository $chapters) {}

    public function show(Request $request): Response|RedirectResponse
    {
        $token = (string) $request->query('ticket');
        $purpose = $request->query('purpose') === 'edit' ? 'edit' : 'create';

        try {
            $ticket = VerificationTicket::fromToken($token, $purpose);
        } catch (RuntimeException $e) {
            return redirect()->route('home')->withErrors(['email' => $e->getMessage()]);
        }

        $existing = $this->chapters->allByDomain($ticket->domain);

        // Editing is authorised by the exact address, not the domain, so
        // offering a district peer's chapter here would only lead to a refusal.
        // Somebody asking to edit is shown what they can actually edit.
        if ($purpose === 'edit') {
            $existing = array_values(array_filter(
                $existing,
                static fn ($chapter): bool => $chapter->isOwnedBy($ticket->email),
            ));
        }

        // Nothing to choose between: a district with no chapters yet, an address
        // that is not a district at all, or exactly one chapter to edit.
        if (! $ticket->domain->isDistrict() || count($existing) < 2) {
            return $this->onward($purpose, $token, $existing);
        }

        return Inertia::render('Chapters/District', [
            'meta' => PageMeta::private('Your district')->toArray(),
            'ticket' => $token,
            'purpose' => $purpose,
            'domain' => $ticket->domain->registrable,
            'minutesRemaining' => $ticket->minutesRemaining(),
            'chapters' => array_map(
                static fn ($chapter): array => [
                    'slug' => $chapter->slug,
                    'schoolName' => $chapter->schoolName,
                    'shortName' => $chapter->shortName,
                    'city' => $chapter->city,
                    'state' => $chapter->state,
                    'status' => $chapter->status(),
                    'readersWithinMile' => $chapter->survey->readersWithinMile,
                ],
                $existing,
            ),
        ]);
    }

    /**
     * Where somebody goes when there is nothing to pick between.
     *
     * @param  list<\App\Chapters\Chapter>  $existing
     */
    private function onward(string $purpose, string $token, array $existing): RedirectResponse
    {
        if ($purpose === 'edit' && $existing !== []) {
            return redirect()->route('chapters.edit', [
                'slug' => $existing[0]->slug,
                'ticket' => $token,
            ]);
        }

        // Asked to edit, with nothing of theirs to edit. Sending them to start
        // a chapter would be answering a different question, so the page they
        // came from says so instead.
        if ($purpose === 'edit') {
            return redirect()->route('home')->withErrors([
                'email' => 'That address has not started a chapter yet, so there is nothing to edit.',
            ]);
        }

        return redirect()->route('chapters.start', ['ticket' => $token]);
    }
}
