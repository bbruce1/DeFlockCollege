<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The posts, for anybody running a chapter.
 *
 * Built in the browser from two colours and a name, so this holds no images and
 * needs no storage: the same generator the create flow previews with is the one
 * that draws them here.
 *
 * A chapter can be named in the query so a creator arriving from their own page
 * lands on their own colours rather than having to type them again.
 */
final class SocialController extends Controller
{
    public function __construct(private readonly ChapterRepository $chapters) {}

    public function index(Request $request): Response
    {
        $chapter = $this->requested($request);

        return Inertia::render('Social', [
            'chapter' => $chapter ? self::summarise($chapter) : null,
            // Every chapter, so somebody who arrived without a link can pick
            // their own and have it fill itself in.
            'chapters' => array_map(self::summarise(...), $this->chapters->all()),
        ]);
    }

    /**
     * One post, on its own page, ready to be taken away.
     *
     * The post itself is built in the browser exactly as it is on the catalogue,
     * so this passes only which one was asked for. An unknown id is not an error
     * worth a 404 from here — the page says so and offers the catalogue.
     */
    public function post(Request $request, string $post): Response
    {
        $chapter = $this->requested($request);

        return Inertia::render('CopyPost', [
            'postId' => $post,
            'chapter' => $chapter ? self::summarise($chapter) : null,
            'chapters' => array_map(self::summarise(...), $this->chapters->all()),
        ]);
    }

    /** @return array<string, mixed> */
    private static function summarise(Chapter $chapter): array
    {
        return [
            'slug' => $chapter->slug,
            'schoolName' => $chapter->schoolName,
            'shortName' => $chapter->shortName,
            'instagram' => $chapter->instagram,
            'primaryColour' => $chapter->colours->primary,
            'secondaryColour' => $chapter->colours->secondary,
            'readersWithinMile' => $chapter->survey->readersWithinMile,
        ];
    }

    /**
     * The chapter named in ?chapter=, when it is one that exists.
     *
     * Takes the request rather than reaching for the global helper: the helper
     * resolves whatever the container holds, which is not always the request
     * being handled, and that is a bug that only shows up somewhere awkward.
     */
    private function requested(Request $request): ?Chapter
    {
        $slug = (string) $request->query('chapter', '');

        return $slug === '' ? null : $this->chapters->findBySlugString($slug);
    }
}
