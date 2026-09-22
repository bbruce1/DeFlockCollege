<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\States;
use App\Maps\NationalMap;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Every chapter in the network, on the same map the front page draws.
 *
 * Nothing is projected here. The national map already places a campus, and the
 * front page already marks every chapter on it, so this asks for exactly that
 * and hangs a card off each mark rather than inventing a second map that could
 * disagree with the first.
 */
final class MapController extends Controller
{
    public function __construct(
        private readonly ChapterRepository $chapters,
        private readonly NationalMap $national,
    ) {}

    public function index(): Response
    {
        $markers = [];
        $readersNearby = 0;

        foreach ($this->chapters->all() as $chapter) {
            $placed = $this->national->locate($chapter->state, $chapter->survey->point);

            if ($placed === null) {
                continue;
            }

            $markers[] = [...$placed, ...$this->card($chapter)];
            $readersNearby += $chapter->survey->readersWithinMile;
        }

        return Inertia::render('MapPage', [
            'coverage' => [
                'url' => route('coverage.nation', ['v' => $this->national->revision()]),
                'markers' => $markers,
                'readersNearby' => $readersNearby,
            ],
        ]);
    }

    /** What a mark says when somebody points at it. */
    private function card(Chapter $chapter): array
    {
        return [
            'slug' => $chapter->slug,
            'shortName' => $chapter->shortName,
            'schoolName' => $chapter->schoolName,
            'city' => $chapter->city,
            'state' => $chapter->state,
            'stateName' => States::name($chapter->state),
            'instagram' => $chapter->instagram,
            'readersWithinMile' => $chapter->survey->readersWithinMile,
            'readersInState' => $chapter->survey->readersInState,
        ];
    }
}
