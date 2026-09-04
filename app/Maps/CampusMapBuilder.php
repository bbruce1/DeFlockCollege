<?php

declare(strict_types=1);

namespace App\Maps;

use App\Chapters\BoundingBox;
use App\Chapters\ChapterMap;

/**
 * Turns a bounding box into everything a chapter page renders.
 *
 * Two queries against the frame, one against the state:
 *   - the street network, so the campus is recognisable
 *   - man_made=surveillance + surveillance:type=ALPR, which is the same data
 *     DeFlock maps into, so no separate API is needed
 *   - a statewide reader count via `out count`, which returns a tally rather
 *     than the nodes and so stays cheap even in the thousands
 *
 * Both geometries are projected into one shared 0-1000 space so they overlay
 * exactly at any render size.
 */
final class CampusMapBuilder
{
    /** Roads below this projected length add noise without adding shape. */
    private const MIN_SERVICE_LENGTH = 60.0;

    /** Points closer than this in projected units are dropped. */
    private const MIN_POINT_SPACING = 4.0;

    /** Service roads are dense and low value, so keep one in this many. */
    private const SERVICE_KEEP_EVERY = 4;

    /** Readers are counted within this radius of the frame centre. */
    private const COUNT_RADIUS_MILES = 1.0;

    private const MILES_PER_DEGREE_LATITUDE = 69.0;

    /** The query runs wider than the frame so narrow screens have map at their edges. */
    private const READER_QUERY_PAD = 0.35;

    private const TIER_BY_HIGHWAY = [
        'motorway' => 0, 'motorway_link' => 0, 'trunk' => 0, 'trunk_link' => 0, 'primary' => 0,
        'secondary' => 1, 'tertiary' => 1,
        'residential' => 2, 'unclassified' => 2,
        'service' => 3,
    ];

    public function __construct(private readonly OverpassClient $overpass) {}

    /**
     * @param  string|null  $schoolOperator  matched against the operator tag, so a
     *                                       school running its own cameras can be named
     */
    public function build(
        BoundingBox $box,
        string $state,
        ?string $schoolOperator = null,
        ?array $previous = null,
    ): ChapterMap {
        $streets = $this->fetchStreets($box);
        $readers = $this->fetchReaders($box, $schoolOperator);
        $stateCount = $this->fetchStateCount($state);

        return new ChapterMap(
            aspect: $box->aspect(),
            streets: $streets,
            readers: $readers['inFrame'],
            readersWithinMile: $readers['withinMile'],
            flockCount: $readers['flock'],
            readersInState: $stateCount,
            bbox: $box->toString(),
            generatedAt: now()->toDateString(),
            previous: $previous,
        );
    }

    private function fetchStreets(BoundingBox $box): array
    {
        $kinds = implode('|', array_keys(self::TIER_BY_HIGHWAY));
        $data = $this->overpass->run(
            "[out:json][timeout:90];(way[\"highway\"~\"^({$kinds})$\"]"
            ."({$box->south},{$box->west},{$box->north},{$box->east}););out geom;"
        );

        $ways = [];
        $serviceSeen = 0;

        foreach ($data['elements'] ?? [] as $element) {
            $highway = $element['tags']['highway'] ?? null;
            $tier = self::TIER_BY_HIGHWAY[$highway] ?? null;

            if ($tier === null) {
                continue;
            }

            if ($tier === 3 && $serviceSeen++ % self::SERVICE_KEEP_EVERY !== 0) {
                continue;
            }

            $points = $this->projectGeometry($element['geometry'] ?? [], $box);

            if (count($points) < 2) {
                continue;
            }

            if ($tier === 3 && $this->pathLength($points) < self::MIN_SERVICE_LENGTH) {
                continue;
            }

            $flat = [];

            foreach ($points as $point) {
                $flat[] = $point[0];
                $flat[] = $point[1];
            }

            $ways[] = [$tier, $flat];
        }

        usort($ways, static fn (array $a, array $b): int => $a[0] <=> $b[0]);

        return $ways;
    }

    private function fetchReaders(BoundingBox $box, ?string $schoolOperator): array
    {
        $wide = $box->padded(self::READER_QUERY_PAD);
        $data = $this->overpass->run(
            '[out:json][timeout:90];(node["man_made"="surveillance"]["surveillance:type"="ALPR"]'
            ."({$wide->south},{$wide->west},{$wide->north},{$wide->east}););out body;"
        );

        [$centreLat, $centreLon] = $box->centre();
        $inFrame = [];
        $withinMile = 0;
        $flock = 0;

        foreach ($data['elements'] ?? [] as $node) {
            $lat = (float) ($node['lat'] ?? 0);
            $lon = (float) ($node['lon'] ?? 0);
            $tags = $node['tags'] ?? [];
            $maker = (string) ($tags['manufacturer'] ?? $tags['brand'] ?? '');
            $operator = (string) ($tags['operator'] ?? '');
            $isFlock = stripos($maker, 'flock') !== false || stripos($operator, 'flock') !== false;

            if ($this->milesBetween($lat, $lon, $centreLat, $centreLon) <= self::COUNT_RADIUS_MILES) {
                $withinMile++;

                if ($isFlock) {
                    $flock++;
                }
            }

            $inside = $lat >= $box->south && $lat <= $box->north
                && $lon >= $box->west && $lon <= $box->east;

            if (! $inside) {
                continue;
            }

            [$x, $y] = $this->project($lat, $lon, $box);
            $bearing = isset($tags['direction']) && is_numeric($tags['direction'])
                ? (int) $tags['direction']
                : -1;

            $inFrame[] = [$x, $y, $bearing, $isFlock ? 1 : 0];
        }

        return ['inFrame' => $inFrame, 'withinMile' => $withinMile, 'flock' => $flock];
    }

    /**
     * Every mapped reader in the state. `out count` returns a tally rather than
     * the nodes, so this is cheap even where the answer is five figures.
     */
    private function fetchStateCount(string $state): int
    {
        $code = strtoupper(preg_replace('/[^A-Za-z]/', '', $state) ?? '');

        if (strlen($code) !== 2) {
            return 0;
        }

        $data = $this->overpass->run(
            '[out:json][timeout:90];'
            ."area[\"ISO3166-2\"=\"US-{$code}\"][\"admin_level\"=\"4\"]->.st;"
            .'node(area.st)["man_made"="surveillance"]["surveillance:type"="ALPR"];out count;'
        );

        return (int) ($data['elements'][0]['tags']['nodes'] ?? 0);
    }

    private function projectGeometry(array $geometry, BoundingBox $box): array
    {
        $points = [];
        $last = null;

        foreach ($geometry as $node) {
            $point = $this->project((float) $node['lat'], (float) $node['lon'], $box);

            // Off-frame points break the line rather than dragging it across.
            if ($point[0] < -40 || $point[0] > 1040 || $point[1] < -40 || $point[1] > 1040) {
                $last = null;

                continue;
            }

            if ($last !== null
                && abs($point[0] - $last[0]) + abs($point[1] - $last[1]) < self::MIN_POINT_SPACING) {
                continue;
            }

            $points[] = $point;
            $last = $point;
        }

        return $points;
    }

    /** Into the shared 0-1000 space, y flipped so north is up. */
    private function project(float $lat, float $lon, BoundingBox $box): array
    {
        $kx = cos(deg2rad(($box->south + $box->north) / 2));
        $worldWidth = ($box->east - $box->west) * $kx;
        $worldHeight = $box->north - $box->south;

        return [
            (int) round((($lon - $box->west) * $kx) / $worldWidth * 1000),
            (int) round(1000 - (($lat - $box->south) / $worldHeight) * 1000),
        ];
    }

    private function pathLength(array $points): float
    {
        $length = 0.0;

        for ($i = 1; $i < count($points); $i++) {
            $length += hypot(
                $points[$i][0] - $points[$i - 1][0],
                $points[$i][1] - $points[$i - 1][1],
            );
        }

        return $length;
    }

    private function milesBetween(float $lat, float $lon, float $centreLat, float $centreLon): float
    {
        $dy = ($lat - $centreLat) * self::MILES_PER_DEGREE_LATITUDE;
        $dx = ($lon - $centreLon) * self::MILES_PER_DEGREE_LATITUDE * cos(deg2rad($centreLat));

        return hypot($dx, $dy);
    }
}
