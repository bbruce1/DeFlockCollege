<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\SocialHandle;
use App\Chapters\VerificationTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Editing a chapter after it exists.
 *
 * Ownership is proved the same way it was established: a link sent to the
 * address that created it. There is no password to lose and no account to
 * compromise, and the check is against the stored HMAC rather than the domain,
 * so one person at a school cannot quietly take over another's chapter.
 */
final class ChapterEditController extends Controller
{
    public function __construct(private readonly ChapterRepository $chapters) {}

    public function edit(Request $request, string $slug): Response|RedirectResponse
    {
        $chapter = $this->requireChapter($slug);

        try {
            $ticket = VerificationTicket::fromToken((string) $request->query('ticket', ''), 'edit');
        } catch (RuntimeException $e) {
            return redirect()->route('chapters.show', $chapter->slug)
                ->withErrors(['email' => $e->getMessage()]);
        }

        if (! $chapter->isOwnedBy($ticket->email)) {
            return redirect()->route('chapters.show', $chapter->slug)->withErrors([
                'email' => 'That address did not start this chapter, so it cannot edit it.',
            ]);
        }

        return Inertia::render('Chapters/Edit', [
            'chapter' => $chapter->toPublicArray(),
            'ticket' => (string) $request->query('ticket'),
            'minutesRemaining' => $ticket->minutesRemaining(),
        ]);
    }

    public function update(Request $request, string $slug): RedirectResponse
    {
        $chapter = $this->requireChapter($slug);

        $validated = $request->validate([
            'ticket' => ['required', 'string'],
            'instagram' => ['nullable', 'string', 'max:120'],
            'tiktok' => ['nullable', 'string', 'max:120'],
        ]);

        try {
            $ticket = VerificationTicket::fromToken($validated['ticket'], 'edit');
        } catch (RuntimeException $e) {
            return redirect()->route('chapters.show', $chapter->slug)
                ->withErrors(['email' => $e->getMessage()]);
        }

        if (! $chapter->isOwnedBy($ticket->email)) {
            return redirect()->route('chapters.show', $chapter->slug)->withErrors([
                'email' => 'That address did not start this chapter, so it cannot edit it.',
            ]);
        }

        try {
            $instagram = SocialHandle::normalise($validated['instagram'] ?? null, 'instagram');
            $tiktok = SocialHandle::normalise($validated['tiktok'] ?? null, 'tiktok');
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['instagram' => $e->getMessage()])->withInput();
        }

        $this->chapters->save(new Chapter(
            slug: $chapter->slug,
            schoolName: $chapter->schoolName,
            shortName: $chapter->shortName,
            state: $chapter->state,
            ownerDomain: $chapter->ownerDomain,
            ownerRecord: $chapter->ownerRecord,
            map: $chapter->map,
            instagram: $instagram,
            tiktok: $tiktok,
            createdAt: $chapter->createdAt,
            updatedAt: now()->toIso8601String(),
        ));

        return redirect()->route('chapters.show', $chapter->slug)
            ->with('status', 'Saved.');
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
