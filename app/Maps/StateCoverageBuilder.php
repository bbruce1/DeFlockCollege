<?php

declare(strict_types=1);

namespace App\Maps;

use App\Chapters\StateCoverage;
use App\Chapters\StateCoverageRepository;
use InvalidArgumentException;

/**
 * Fetches every mapped plate reader in a state, once.
 *
 * The result is cached per state and shared by every chapter in it, so a state
 * is queried once however many campuses it holds. `out skel qt` returns bare
 * coordinates rather than tags, which keeps a query that can return tens of
 * thousands of nodes as small as it can be.
 *
 * The statewide count is the number of points returned, so the figure a page
 * prints and the field it draws can never disagree.
 */
final class StateCoverageBuilder
{
    /** Resolution of the drawn field. Finer than a screen shows is wasted bytes. */
    private const GRID = 500;

    /** Border points closer together than this add no visible detail. */
    private const OUTLINE_TOLERANCE = 0.7;

    public function __construct(
        private readonly OverpassClient $overpass,
        private readonly StateCoverageRepository $store,
        private readonly StateBorders $borders,
    ) {}

    public function for(string $stateCode, bool $refresh = false): StateCoverage
    {
        $code = $this->requireStateCode($stateCode);

        if (! $refresh && $cached = $this->store->find($code)) {
            return $cached;
        }

        $coverage = $this->fetch($code);
        $this->store->save($coverage);

        return $coverage;
    }

    private function fetch(string $code): StateCoverage
    {
        $border = $this->borders->ringsFor($code);

        $query = '[out:json][timeout:180];'
            ."area[\"ISO3166-2\"=\"US-{$code}\"][\"admin_level\"=\"4\"]->.st;"
            .'node(area.st)["man_made"="surveillance"]["surveillance:type"="ALPR"];'
            .'out skel qt;';

        $elements = $this->overpass->run($query)['elements'] ?? [];

        $latitudes = [];
        $longitudes = [];

        foreach ($elements as $node) {
            if (isset($node['lat'], $node['lon'])) {
                $latitudes[] = (float) $node['lat'];
                $longitudes[] = (float) $node['lon'];
            }
        }

        if ($latitudes === [] && $border === []) {
            // A state with nothing mapped is a real answer, not a failure.
            return new StateCoverage($code, 0, [], [], 0, 0, 0, 0, 0, 0, now()->toDateString());
        }

        $frameLats = $latitudes;
        $frameLons = $longitudes;

        foreach ($border as $ring) {
            foreach ($ring as [$lat, $lon]) {
                $frameLats[] = $lat;
                $frameLons[] = $lon;
            }
        }

        $south = min($frameLats);
        $north = max($frameLats);
        $west = min($frameLons);
        $east = max($frameLons);

        /*
         * Equirectangular projection with a latitude correction.
         *
         * A degree of longitude is shorter than a degree of latitude everywhere
         * but the equator, by the cosine of the latitude, so projecting raw
         * degrees stretches a state sideways. Fitting the result to a square
         * then distorts it again by whatever its real proportions were: Georgia
         * is nearly square and survived that, Massachusetts is about three times
         * wider than it is tall and did not.
         */
        $midLatitude = deg2rad(($north + $south) / 2);
        $spanX = max(($east - $west) * cos($midLatitude), 1e-9);
        $spanY = max($north - $south, 1e-9);

        // One scale for both axes, so the shape keeps its proportions. The
        // longer side fills the grid and the shorter side is whatever it is.
        $scale = self::GRID / max($spanX, $spanY);
        $width = (int) round($spanX * $scale);
        $height = (int) round($spanY * $scale);

        // Snapped to a coarse grid and deduplicated. Readers on the same corner
        // are one dot at any screen size, and a state is wider than any display,
        // so a finer grid would cost payload for detail nobody can see. The true
        // count is kept separately, so nothing the page prints is affected.
        $seen = [];

        foreach ($latitudes as $i => $lat) {
            $x = (int) round(($longitudes[$i] - $west) * cos($midLatitude) * $scale);
            $y = (int) round(($north - $lat) * $scale);
            $seen[$x * (self::GRID + 1) + $y] = [$x, $y];
        }

        $points = [];

        foreach ($seen as [$x, $y]) {
            $points[] = $x;
            $points[] = $y;
        }

        $outline = [];

        foreach ($border as $ring) {
            $flat = [];

            foreach ($ring as [$lat, $lon]) {
                $flat[] = (int) round(($lon - $west) * cos($midLatitude) * $scale);
                $flat[] = (int) round(($north - $lat) * $scale);
            }

            $thinned = self::thin($flat);

            // Each member way is one stretch of the border, not a closed shape.
            // They are kept as separate open paths and drawn as such: together
            // they trace the state, and dropping the short ones would punch
            // holes in it.
            if (count($thinned) >= 4) {
                $outline[] = $thinned;
            }
        }

        return new StateCoverage(
            $code,
            count($latitudes),
            $points,
            $outline,
            $width,
            $height,
            $south,
            $west,
            $north,
            $east,
            now()->toDateString(),
        );
    }

    /**
     * The state's border, as rings of [lat, lon].
     *
     * A boundary relation is thousands of points at full fidelity, so this is a
     * best effort: if it cannot be fetched the field still draws, just without
     * the shape around it.
     *
     * @return list<list<array{0: float, 1: float}>>
     */

    /**
     * Drops points that sit close to the one before them.
     *
     * Crude next to Douglas-Peucker, but the border is drawn a few hundred
     * pixels wide and this is indistinguishable at that size.
     *
     * @param  list<int>  $flat
     * @return list<int>
     */
    private static function thin(array $flat): array
    {
        $kept = [];
        $lastX = null;
        $lastY = null;

        for ($i = 0; $i < count($flat); $i += 2) {
            $x = $flat[$i];
            $y = $flat[$i + 1];

            if ($lastX !== null && abs($x - $lastX) + abs($y - $lastY) < self::OUTLINE_TOLERANCE) {
                continue;
            }

            $kept[] = $x;
            $kept[] = $y;
            $lastX = $x;
            $lastY = $y;
        }

        return $kept;
    }

    private function requireStateCode(string $stateCode): string
    {
        $code = strtoupper(trim($stateCode));

        if (preg_match('/\A[A-Z]{2}\z/', $code) !== 1) {
            throw new InvalidArgumentException("A state code must be two letters, got: {$stateCode}");
        }

        return $code;
    }
}
