<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Maps\NationalMap;
use Inertia\Inertia;
use Inertia\Response;

final class HomeController extends Controller
{
    public function __construct(
        private readonly ChapterRepository $chapters,
        private readonly NationalMap $national,
    ) {}

    public function index(): Response
    {
        $chapters = $this->chapters->all();

        $rows = array_map(
            static fn (Chapter $chapter) => [
                'slug' => $chapter->slug,
                'schoolName' => $chapter->schoolName,
                'shortName' => $chapter->shortName,
                'state' => $chapter->state,
                'status' => $chapter->status(),
                'readersWithinMile' => $chapter->survey->readersWithinMile,
            ],
            $chapters,
        );

        return Inertia::render('Home', [
            'chapters' => $rows,
            'liveCount' => count(array_filter($rows, fn ($c) => $c['status'] === 'live')),
            'coverage' => $this->coverage($chapters),
        ]);
    }

    /**
     * A map of the country with every chapter marked on it.
     *
     * Drawn from the committed Census boundaries, so it needs no build step and
     * is never absent. The front page marks campuses, not cameras.
     *
     * @param  list<Chapter>  $chapters
     * @return array{url: string, markers: list<array{x: float, y: float}>, readersNearby: int}
     */
    private function coverage(array $chapters): array
    {
        $markers = [];
        $readersNearby = 0;

        foreach ($chapters as $chapter) {
            $placed = $this->national->locate($chapter->state, $chapter->survey->point);

            if ($placed !== null) {
                $markers[] = $placed;
            }

            // Only what is actually known is added up; a chapter nobody could
            // survey contributes nothing rather than a nought.
            $readersNearby += $chapter->survey->readersWithinMile ?? 0;
        }

        return [
            // Fingerprinted with the border data, so a redrawn map reaches a
            // reader still holding a day-old copy of the old one.
            'url' => route('coverage.nation', ['v' => $this->national->revision()]),
            'markers' => $markers,
            // Counted from the chapters themselves, so the figure the page
            // prints and the marks it draws can never disagree.
            'readersNearby' => $readersNearby,
        ];
    }
}
