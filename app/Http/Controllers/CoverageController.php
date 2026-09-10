<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\StateCoverageRepository;
use App\Chapters\States;
use App\Maps\NationalMap;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * The statewide reader field, served on its own.
 *
 * Embedding tens of thousands of coordinates in the page cost more than the
 * rest of the response put together, and every chapter in a state serves the
 * identical file — so it is fetched separately and cached by the browser, which
 * makes the second chapter in a state free.
 *
 * The field is decoration. If this never arrives the page is unchanged in every
 * respect that matters.
 */
final class CoverageController extends Controller
{
    private const CACHE_SECONDS = 86400;

    public function __construct(
        private readonly StateCoverageRepository $coverage,
        private readonly NationalMap $national,
    ) {}

    /**
     * The whole country, for the network's own front page.
     *
     * Drawn from the committed boundaries, so this needs no build step and
     * cannot 404 on a fresh checkout. It carries no readers: the front page
     * marks where the chapters are, and a chapter page draws its own state.
     *
     * Projecting thirty-four thousand border points is quick but not free, and
     * the answer only changes when the border file does, so it is remembered
     * against that file's timestamp.
     */
    public function nation(): JsonResponse
    {
        $field = Cache::remember(
            'national-map:'.$this->national->revision(),
            now()->addDay(),
            fn (): array => $this->national->field(),
        );

        return response()
            ->json([
                'points' => [],
                'outline' => $field['outline'],
                'width' => $field['width'],
                'height' => $field['height'],
            ])
            ->header('Cache-Control', 'public, max-age='.self::CACHE_SECONDS);
    }

    public function show(string $state): JsonResponse
    {
        if (! States::exists($state)) {
            throw new NotFoundHttpException("No such state: {$state}");
        }

        $coverage = $this->coverage->find($state);

        if ($coverage === null) {
            throw new NotFoundHttpException("No coverage held for {$state}.");
        }

        return response()
            ->json([
                'points' => $coverage->points,
                'outline' => $coverage->outline,
                // The projected extent, carrying the state's real proportions.
                'width' => $coverage->width,
                'height' => $coverage->height,
            ])
            ->header('Cache-Control', 'public, max-age='.self::CACHE_SECONDS);
    }
}
