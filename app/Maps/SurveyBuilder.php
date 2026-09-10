<?php

declare(strict_types=1);

namespace App\Maps;

use App\Chapters\CampusPoint;
use App\Chapters\ReaderSurvey;
use RuntimeException;
use InvalidArgumentException;

/**
 * Turns a campus point into the counts a chapter page reports.
 *
 * Two queries: what stands within a mile of the point, and what stands in the
 * state. Neither result is ever adjusted, rounded up, or filled in — a campus
 * with nothing mapped gets zero, and the page says so in its own words.
 */
final class SurveyBuilder
{
    private const MILE_IN_METRES = 1609.34;

    /** Tags that identify the vendor. Any of them may carry the name. */
    private const VENDOR_TAGS = ['manufacturer', 'maker', 'operator', 'brand'];

    public function __construct(
        private readonly OverpassClient $overpass,
        private readonly StateCoverageBuilder $coverage,
    ) {}

    public function build(CampusPoint $point, string $stateCode): ReaderSurvey
    {
        // Validated before anything leaves the machine, so a malformed code costs
        // a free service nothing.
        $code = $this->requireStateCode($stateCode);

        // Neither count blocks a chapter. A page with no figures on it still
        // carries the Instagram, the petition and the letters to send, which is
        // what a student actually came to set up; the nightly refresh fills the
        // numbers in once OpenStreetMap can be reached again.
        $nearby = $this->nearbyReaders($point);

        return new ReaderSurvey(
            point: $point,
            readersWithinMile: $nearby === null ? null : $nearby['total'],
            flockCount: $nearby === null ? null : $nearby['flock'],
            readersInState: $this->stateCount($code),
            generatedAt: now()->toDateString(),
        );
    }

    /**
     * Every reader in the state, or null when that could not be fetched.
     *
     * The statewide query walks a whole state and is the first thing to time
     * out when OpenStreetMap is busy. It supports a supporting sentence and a
     * backdrop, so a chapter is made without it and the nightly refresh fills
     * it in. Blocking creation on it left students unable to start a chapter at
     * all for as long as the service was unreachable.
     */
    private function stateCount(string $code): ?int
    {
        try {
            return $this->coverage->for($code)->readerCount();
        } catch (RuntimeException) {
            return null;
        }
    }

    /**
     * Readers within a mile, and how many of them are Flock.
     *
     * Null when OpenStreetMap could not be reached, which the page reports as
     * not yet surveyed rather than as none found.
     *
     * @return array{total: int, flock: int}|null
     */
    private function nearbyReaders(CampusPoint $point): ?array
    {
        $radius = self::MILE_IN_METRES;

        // Coordinates are floats by construction, so they cannot carry syntax.
        $query = '[out:json][timeout:90];'
            .'node["man_made"="surveillance"]["surveillance:type"="ALPR"]'
            .sprintf('(around:%.2f,%.6f,%.6f);', $radius, $point->latitude, $point->longitude)
            .'out tags;';

        try {
            $elements = $this->overpass->run($query)['elements'] ?? [];
        } catch (RuntimeException) {
            return null;
        }

        $flock = 0;

        foreach ($elements as $node) {
            if ($this->isFlock($node['tags'] ?? [])) {
                $flock++;
            }
        }

        return ['total' => count($elements), 'flock' => $flock];
    }

    /** Interpolated into a query, so it is allowlisted rather than escaped. */
    private function requireStateCode(string $stateCode): string
    {
        $code = strtoupper(trim($stateCode));

        if (preg_match('/\A[A-Z]{2}\z/', $code) !== 1) {
            throw new InvalidArgumentException(
                "A state code must be two letters, got: {$stateCode}"
            );
        }

        return $code;
    }

    /** @param  array<string, string>  $tags */
    private function isFlock(array $tags): bool
    {
        foreach (self::VENDOR_TAGS as $tag) {
            if (stripos((string) ($tags[$tag] ?? ''), 'flock') !== false) {
                return true;
            }
        }

        return false;
    }
}
