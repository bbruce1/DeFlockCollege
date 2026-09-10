<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * The one screen where a creator sees their edit key.
 *
 * It arrives flashed from the create request, so a reload loses it and there is
 * no URL carrying it. That is the point: the key exists in one place after this
 * screen, which is wherever the creator wrote it down.
 *
 * They must confirm they have saved it and know where the edit button lives
 * before this screen will let them past, and that confirmation is recorded on
 * the chapter so it is answerable later.
 */
final class ChapterWelcomeController extends Controller
{
    public function __construct(private readonly ChapterRepository $chapters) {}

    public function show(Request $request, string $slug): Response|RedirectResponse
    {
        $chapter = $this->requireChapter($slug);
        $key = $request->session()->get('editKey');

        // Without the flashed key there is nothing to show, and it cannot be
        // regenerated, so send them to the chapter itself.
        if (! is_string($key) || $key === '') {
            return redirect()->route('chapters.show', $chapter->slug);
        }

        // Kept for the acknowledgement round trip, then dropped.
        $request->session()->keep('editKey');

        return Inertia::render('Chapters/Welcome', [
            'chapter' => [
                'slug' => $chapter->slug,
                'shortName' => $chapter->shortName,
                'schoolName' => $chapter->schoolName,
            ],
            'editKey' => $key,
        ]);
    }

    public function acknowledge(Request $request, string $slug): RedirectResponse
    {
        $chapter = $this->requireChapter($slug);

        // The flashed key is the only thing that says this request came from the
        // person who just created the chapter. Without it this is a write to
        // somebody else's chapter by anyone who knows its address.
        if (! $this->holdsFlashedKey($request)) {
            return redirect()->route('chapters.show', $chapter->slug);
        }

        $request->validate([
            'savedKey' => ['accepted'],
            'knowsEditButton' => ['accepted'],
        ], [
            'savedKey.accepted' => 'Confirm you have saved the key. It cannot be shown again.',
            'knowsEditButton.accepted' => 'Confirm you know where the edit button is.',
        ]);

        $request->session()->forget('editKey');

        // Every field, not the subset this screen happens to care about. The
        // chapter file is rewritten whole, so anything omitted here is deleted.
        $this->chapters->save(new Chapter(
            slug: $chapter->slug,
            schoolName: $chapter->schoolName,
            shortName: $chapter->shortName,
            state: $chapter->state,
            city: $chapter->city,
            ownerDomain: $chapter->ownerDomain,
            ownerRecord: $chapter->ownerRecord,
            survey: $chapter->survey,
            instagram: $chapter->instagram,
            tiktok: $chapter->tiktok,
            petitionUrl: $chapter->petitionUrl,
            officials: $chapter->officials,
            editKeyHash: $chapter->editKeyHash,
            acknowledgedAt: now()->toIso8601String(),
            colours: $chapter->colours,
            createdAt: $chapter->createdAt,
            updatedAt: now()->toIso8601String(),
        ));

        return redirect()->route('chapters.show', $chapter->slug)
            ->with('status', 'Your chapter is live.');
    }

    /** The one-time key flashed by the create request, still in this session. */
    private function holdsFlashedKey(Request $request): bool
    {
        $key = $request->session()->get('editKey');

        return is_string($key) && $key !== '';
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
