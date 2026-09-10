<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\ChapterRepository;
use App\Chapters\States;
use App\Officials\Official;
use App\Officials\OfficialsDirectory;
use App\Officials\OutreachLibrary;
use App\Officials\RotationCounter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Hands a reader the letter they are about to send.
 *
 * The rotation advances here rather than on page render. Rendering a page is
 * something crawlers, refreshes and link previews do; pressing the button is
 * something a person does, and only the second is worth counting.
 *
 * Within the hold window a reader is handed back the same letter, so a second
 * press, a slow mail client or a double click does not silently swap the text
 * under them. Once the window passes, the next press draws a fresh letter and
 * moves the chapter's counter on.
 */
final class OutreachController extends Controller
{
    /** How long one assignment is held before a fresh letter is drawn. */
    private const HOLD_SECONDS = 60;

    public function __construct(
        private readonly ChapterRepository $chapters,
        private readonly OfficialsDirectory $directory,
        private readonly OutreachLibrary $letters,
        private readonly RotationCounter $rotation,
    ) {}

    public function show(Request $request, string $slug): JsonResponse
    {
        $chapter = $this->chapters->findBySlugString($slug);

        if ($chapter === null) {
            throw new NotFoundHttpException("No chapter at \"{$slug}\".");
        }

        $validated = $request->validate([
            'official' => ['required', 'integer', 'min:0', 'max:50'],
        ]);

        $officials = [
            ...array_map(static fn (array $o): Official => Official::fromArray($o), $chapter->officials),
            ...$this->directory->forState($chapter->state),
        ];

        $index = (int) $validated['official'];

        if (! isset($officials[$index])) {
            throw new NotFoundHttpException('No such office on this chapter.');
        }

        $held = $this->heldAssignment($request, $chapter->slug, $index);

        if ($held !== null) {
            $rotation = $held;
            $fresh = false;
        } else {
            $rotation = $this->rotation->next($chapter->slug);
            $this->hold($request, $chapter->slug, $index, $rotation);
            $fresh = true;
        }

        $letter = $this->letters->letterFor(
            $chapter,
            $officials[$index],
            $index,
            States::name($chapter->state),
            $rotation,
        );

        return response()->json([
            'subject' => $letter['subject'],
            'body' => $letter['body'],
            'email' => $officials[$index]->email,
            'url' => $officials[$index]->url,
            'fresh' => $fresh,
            'sent' => $this->rotation->current($chapter->slug),
        ]);
    }

    /** The offset already given to this reader, if the hold has not lapsed. */
    private function heldAssignment(Request $request, string $slug, int $index): ?int
    {
        $held = $request->session()->get($this->key($slug, $index));

        if (! is_array($held) || ! isset($held['rotation'], $held['at'])) {
            return null;
        }

        return (time() - (int) $held['at']) < self::HOLD_SECONDS
            ? (int) $held['rotation']
            : null;
    }

    private function hold(Request $request, string $slug, int $index, int $rotation): void
    {
        $request->session()->put($this->key($slug, $index), [
            'rotation' => $rotation,
            'at' => time(),
        ]);
    }

    private function key(string $slug, int $index): string
    {
        return "outreach:{$slug}:{$index}";
    }
}
