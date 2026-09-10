<?php

declare(strict_types=1);

namespace App\Maps;

use App\Chapters\CampusPoint;
use App\Chapters\States;

/**
 * A map of the country, drawn to show where the chapters are.
 *
 * Nothing is fetched and nothing is aggregated: the outline comes straight from
 * the committed Census boundaries, so a fresh checkout draws the whole country
 * with no network and no build step. The front page is about campuses, not
 * cameras — a chapter page still draws its own state's readers.
 *
 * Alaska and Hawaii are placed in insets rather than left out. A map whose job
 * is showing where the chapters are cannot silently drop two states' worth of
 * them, and putting them in true position would shrink the lower forty-eight
 * until nothing could be picked out.
 *
 * Boundaries (c) US Census Bureau, TIGER/Line, public domain.
 */
final class NationalMap
{
    /** Resolution of the drawn map. Finer than a screen shows is wasted bytes. */
    private const GRID = 1000;

    /** The contiguous states, plus enough margin to hold their coasts. */
    private const SOUTH = 24.4;

    private const NORTH = 49.4;

    private const WEST = -125.0;

    private const EAST = -66.9;

    /**
     * Where the two out-of-frame states sit, as fractions of the map.
     *
     * Each is fitted into its box preserving its own proportions, which is why
     * Alaska's box is the wider one.
     *
     * @var array<string, array{0: float, 1: float, 2: float, 3: float}>
     */
    private const INSETS = [
        // The Pacific off Baja and the Gulf of California: the only sizeable
        // emptiness inside a frame cropped to the lower forty-eight, and where
        // a printed US map puts these two anyway. Carrying the frame south to
        // make room instead left a dead band that pushed the country upwards.
        'AK' => [0.0, 0.697, 0.165, 1.0],
        'HI' => [0.19, 0.845, 0.265, 1.0],
    ];

    /**
     * Border extents, per state.
     *
     * Recomputed per point this would walk Alaska's five thousand border points
     * once for each of them.
     *
     * @var array<string, array{0: float, 1: float, 2: float, 3: float}|null>
     */
    private array $bounds = [];

    public function __construct(private readonly StateBorders $borders) {}

    /**
     * A token that changes when the drawn map would.
     *
     * The map is a pure function of the border data and the code that projects
     * it, so the token covers both files. Listing the frame constants by hand
     * was not enough: a fix to the projection itself left the token unchanged
     * and every browser holding a day-old copy kept drawing the old map from
     * the same URL, which is a slow and quiet way to fail.
     */
    public function revision(): string
    {
        $projection = (string) @filemtime(__FILE__);

        return substr(md5($this->borders->revision().':'.$projection), 0, 12);
    }

    /**
     * The whole country as flat [x0, y0, x1, y1, ...] rings.
     *
     * @return array{width: int, height: int, outline: list<list<float>>, states: int}
     */
    public function field(): array
    {
        $outline = [];
        $drawn = 0;

        foreach (States::codes() as $code) {
            $rings = $this->borders->ringsFor($code);

            if ($rings === []) {
                continue;
            }

            $drawn++;

            foreach ($rings as $ring) {
                $flat = [];

                foreach ($ring as [$latitude, $longitude]) {
                    $placed = $this->place($code, $latitude, $longitude);

                    if ($placed !== null) {
                        $flat[] = $placed['x'];
                        $flat[] = $placed['y'];
                    }
                }

                // Two points is a line, not a shape; anything less is nothing.
                if (count($flat) >= 6) {
                    $outline[] = $flat;
                }
            }
        }

        return [
            'width' => $this->width(),
            'height' => $this->height(),
            'outline' => $outline,
            'states' => $drawn,
        ];
    }

    /**
     * Places a campus on the map, so a chapter can be marked on it.
     *
     * The state is needed because Alaska and Hawaii are drawn in insets, and a
     * campus has to land on the same drawing its state did.
     *
     * @return array{x: float, y: float}|null
     */
    public function locate(string $state, CampusPoint $point): ?array
    {
        return $this->place(strtoupper(trim($state)), $point->latitude, $point->longitude);
    }

    /** @return array{x: float, y: float}|null */
    private function place(string $state, float $latitude, float $longitude): ?array
    {
        // A point has to be inside the state it claims. The frame is a box that
        // reaches past the coast to make room for the insets, so without this a
        // campus with the wrong state would be drawn out at sea rather than
        // reported as not placeable.
        if (! $this->within($state, $latitude, $longitude)) {
            return null;
        }

        $inset = self::INSETS[$state] ?? null;

        return $inset === null
            ? $this->onMainland($latitude, $longitude)
            : $this->inInset($state, $inset, $latitude, $longitude);
    }

    /** Generous by a tenth of a degree, because the borders are generalised. */
    private function within(string $state, float $latitude, float $longitude): bool
    {
        $bounds = $this->boundsOf($state);

        if ($bounds === null) {
            return false;
        }

        [$south, $west, $north, $east] = $bounds;
        $slack = 0.1;
        $shifted = $longitude > 0.0 ? $longitude - 360.0 : $longitude;

        return $latitude >= $south - $slack
            && $latitude <= $north + $slack
            && $shifted >= $west - $slack
            && $shifted <= $east + $slack;
    }

    /** A point outside the frame is dropped, never clamped to an edge. */
    private function onMainland(float $latitude, float $longitude): ?array
    {
        $scale = $this->mainlandScale();

        $x = ($longitude - self::WEST) * cos($this->midLatitude()) * $scale;
        $y = (self::NORTH - $latitude) * $scale;

        if ($x < 0.0 || $x > $this->width() || $y < 0.0 || $y > $this->height()) {
            return null;
        }

        return ['x' => round($x, 1), 'y' => round($y, 1)];
    }

    /**
     * @param  array{0: float, 1: float, 2: float, 3: float}  $box
     * @return array{x: float, y: float}|null
     */
    private function inInset(string $state, array $box, float $latitude, float $longitude): ?array
    {
        $bounds = $this->boundsOf($state);

        if ($bounds === null) {
            return null;
        }

        [$south, $west, $north, $east] = $bounds;
        $mid = deg2rad(($north + $south) / 2);

        $spanX = ($east - $west) * cos($mid);
        $spanY = $north - $south;

        if ($spanX <= 0.0 || $spanY <= 0.0) {
            return null;
        }

        $left = $box[0] * $this->width();
        $top = $box[1] * $this->height();
        $boxWidth = ($box[2] - $box[0]) * $this->width();
        $boxHeight = ($box[3] - $box[1]) * $this->height();

        // One scale for both axes, so the state keeps its own proportions.
        $scale = min($boxWidth / $spanX, $boxHeight / $spanY);

        // The same shift the bounds were measured with. Alaska's Aleutians run
        // past the antimeridian into positive longitude, and projecting those
        // raw put them three hundred degrees east of the state they belong to.
        $shifted = $longitude > 0.0 ? $longitude - 360.0 : $longitude;

        return [
            'x' => round($left + ($shifted - $west) * cos($mid) * $scale, 1),
            'y' => round($top + ($north - $latitude) * $scale, 1),
        ];
    }

    /**
     * The state's own extent, from its border.
     *
     * Alaska crosses the antimeridian, so its longitudes run from about -179 to
     * +179 and a plain min and max would span the entire globe. The eastern
     * scraps are shifted west of the dateline instead, which keeps the state in
     * one piece.
     *
     * @return array{0: float, 1: float, 2: float, 3: float}|null
     */
    private function boundsOf(string $state): ?array
    {
        if (array_key_exists($state, $this->bounds)) {
            return $this->bounds[$state];
        }

        return $this->bounds[$state] = $this->measure($state);
    }

    /** @return array{0: float, 1: float, 2: float, 3: float}|null */
    private function measure(string $state): ?array
    {
        $rings = $this->borders->ringsFor($state);

        if ($rings === []) {
            return null;
        }

        $latitudes = [];
        $longitudes = [];

        foreach ($rings as $ring) {
            foreach ($ring as [$latitude, $longitude]) {
                $latitudes[] = $latitude;
                $longitudes[] = $longitude > 0.0 ? $longitude - 360.0 : $longitude;
            }
        }

        return [min($latitudes), min($longitudes), max($latitudes), max($longitudes)];
    }

    private function midLatitude(): float
    {
        return deg2rad((self::NORTH + self::SOUTH) / 2);
    }

    private function mainlandScale(): float
    {
        return self::GRID / max($this->spanX(), $this->spanY());
    }

    private function spanX(): float
    {
        return (self::EAST - self::WEST) * cos($this->midLatitude());
    }

    private function spanY(): float
    {
        return self::NORTH - self::SOUTH;
    }

    private function width(): int
    {
        return (int) round($this->spanX() * $this->mainlandScale());
    }

    private function height(): int
    {
        return (int) round($this->spanY() * $this->mainlandScale());
    }
}
