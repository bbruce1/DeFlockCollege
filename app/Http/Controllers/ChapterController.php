<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\ChapterRepository;
use App\Chapters\StateCoverageRepository;
use App\Chapters\States;
use App\Site\PageMeta;
use App\Chapters\Chapter;
use App\Officials\Official;
use App\Officials\OfficialsDirectory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * The chapter page, and the index of chapters.
 *
 * A page view touches no network: the counts were fetched when the chapter was
 * built and are refreshed on a schedule, so this is two small file reads.
 */
final class ChapterController extends Controller
{
    public function __construct(
        private readonly ChapterRepository $chapters,
        private readonly OfficialsDirectory $officials,
        private readonly StateCoverageRepository $coverage,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Chapters/Index', [
            'chapters' => array_map(
                static fn ($chapter): array => $chapter->toPublicArray(),
                $this->chapters->all(),
            ),
            'meta' => PageMeta::make(
                title: 'Chapters · '.PageMeta::SITE_NAME,
                description: 'Every campus chapter organising against automated licence plate '
                    .'readers, and how many are mapped around each one.',
                path: '/chapters',
            )->toArray(),
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $chapter = $this->chapters->findBySlugString($slug);

        if ($chapter === null) {
            throw new NotFoundHttpException("No chapter at \"{$slug}\".");
        }

        return Inertia::render('Chapters/Show', [
            'chapter' => $chapter->toPublicArray(),
            'stateName' => States::name($chapter->state),
            // Resolved per request rather than baked into the file, so loading a
            // new state fixes every existing chapter in it at once.
            'officials' => $this->officialsFor($chapter, States::name($chapter->state)),
            'lookupUrl' => $this->officials->lookupUrl($chapter->state),
            // Only where to fetch the field and where this campus sits in it.
            // The points themselves are far too large to inline in every page.
            'coverage' => $this->coverageFor($chapter),
            'canonical' => $this->canonicalUrl($chapter->slug),
            'meta' => $this->metaFor($chapter)->toArray(),
        ]);
    }

    /**
     * Every office on this page.
     *
     * The letters themselves are fetched when a button is pressed, so the page
     * carries none of them and looking at it does not consume one.
     *
     * @return list<array<string, mixed>>
     */
    private function officialsFor(Chapter $chapter, string $stateName): array
    {
        $officials = [
            ...array_map(
                static fn (array $o): Official => Official::fromArray($o),
                $chapter->officials,
            ),
            ...$this->officials->forState($chapter->state),
        ];

        return array_values(array_map(
            static fn (Official $official): array => $official->toArray(),
            $officials,
        ));
    }

    /** @return array{url: string, markers: list<array>}|null */
    private function coverageFor($chapter): ?array
    {
        $coverage = $this->coverage->find($chapter->state);

        if ($coverage === null || $coverage->readerCount() === 0) {
            return null;
        }

        $campus = $coverage->locate($chapter->survey->point);

        return [
            // Fingerprinted with the build date. The field is cached for a day,
            // so without this a rebuild — or a change to the payload's shape —
            // reaches returning readers a day late, or not at all.
            'url' => route('coverage.show', [
                'state' => $chapter->state,
                'v' => $coverage->generatedAt,
            ]),
            'markers' => $campus === null ? [] : [$campus],
        ];
    }

    /**
     * What a shared chapter link looks like in a message.
     *
     * This is the page students actually paste into group chats, so it carries
     * its own school and its own count rather than the site's boilerplate. It
     * never states a figure the chapter does not have: a preview reading "0
     * plate readers" would argue against the person sharing it.
     */
    private function metaFor(Chapter $chapter): PageMeta
    {
        $stateName = States::name($chapter->state);
        $nearby = $chapter->survey->readersWithinMile;

        $description = $nearby === null
            ? "Students at {$chapter->schoolName} organising against automated licence plate "
                .'readers. Sign the petition, follow along, and write to the offices that can '
                .'have them removed.'
            : ($nearby > 0
                ? "{$nearby} automated plate readers are mapped within a mile of "
                    ."{$chapter->shortName}. Write to the offices that can have them removed — "
                    .'every letter is different.'
                : "No plate readers are mapped within a mile of {$chapter->shortName} yet, and "
                    ."campuses across {$stateName} are where they go next. Write to the offices "
                    .'that decide.');

        return PageMeta::make(
            title: "{$chapter->shortName} · ".PageMeta::SITE_NAME,
            description: $description,
            url: $this->canonicalUrl($chapter->slug),
            type: 'article',
        );
    }

    /**
     * The subdomain is canonical because it is the form students share. Both
     * shapes answer, and this stops search engines splitting them.
     */
    private function canonicalUrl(string $slug): string
    {
        $apex = config('app.domain');

        return $apex
            ? 'https://'.$slug.'.'.$apex
            : url('/'.$slug);
    }
}
