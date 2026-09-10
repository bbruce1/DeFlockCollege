<?php

declare(strict_types=1);

namespace App\Chapters;

/**
 * Every mapped plate reader in one state.
 *
 * Shared by every chapter in that state rather than copied into each chapter
 * file, because the data is identical for all of them and there are thousands
 * of points.
 *
 * The points are stored projected into a flat 0-1000 space: it keeps the file
 * small, and nothing downstream needs real coordinates back. The extent they
 * were projected from is kept so a campus can be placed in the same space.
 *
 * Map data (c) OpenStreetMap contributors, ODbL.
 */
final readonly class StateCoverage
{
    /** Must match the grid the builder projected onto. */
    public const GRID = 500;

    public function __construct(
        public string $state,
        /**
         * The true number of mapped readers. Held separately from the points
         * because those are deduplicated for drawing: readers at one
         * intersection are one dot but remain several readers, and the figure
         * the page prints must stay exact.
         */
        public int $readerCount,
        /** Flat [x0, y0, x1, y1, ...] on a coarse integer grid, deduplicated. */
        public array $points,
        /**
         * The state's own border as flat [x0, y0, ...] rings, in the same space.
         * Without it a cloud of readers is just a cloud; with it the shape is
         * the state, which is the whole point of showing it.
         */
        public array $outline,
        /**
         * The projected extent. Both axes share one scale, so these carry the
         * state's real proportions and the drawing must use them rather than
         * assuming a square.
         */
        public int $width,
        public int $height,
        public float $south,
        public float $west,
        public float $north,
        public float $east,
        public string $generatedAt,
    ) {}

    public function readerCount(): int
    {
        return $this->readerCount;
    }

    /** How many dots the background actually draws. */
    public function dotCount(): int
    {
        return intdiv(count($this->points), 2);
    }

    /**
     * Places a campus in the same 0-1000 space as the points.
     *
     * Returns null when the campus falls outside the reader extent, which
     * happens in a state whose readers are all clustered elsewhere. The
     * background then simply carries no marker rather than an invented one.
     */
    public function locate(CampusPoint $point): ?array
    {
        // Must match the builder's projection exactly, or the campus marker
        // lands somewhere the map does not agree with.
        $midLatitude = deg2rad(($this->north + $this->south) / 2);
        $spanX = ($this->east - $this->west) * cos($midLatitude);
        $spanY = $this->north - $this->south;

        if ($spanX <= 0.0 || $spanY <= 0.0) {
            return null;
        }

        $scale = self::GRID / max($spanX, $spanY);
        $x = ($point->longitude - $this->west) * cos($midLatitude) * $scale;
        $y = ($this->north - $point->latitude) * $scale;

        if ($x < 0.0 || $x > $this->width || $y < 0.0 || $y > $this->height) {
            return null;
        }

        return ['x' => round($x, 1), 'y' => round($y, 1)];
    }

    public function toArray(): array
    {
        return [
            'state' => $this->state,
            'readerCount' => $this->readerCount,
            'points' => $this->points,
            'outline' => $this->outline,
            'width' => $this->width,
            'height' => $this->height,
            'south' => $this->south,
            'west' => $this->west,
            'north' => $this->north,
            'east' => $this->east,
            'generatedAt' => $this->generatedAt,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            state: (string) ($data['state'] ?? ''),
            readerCount: (int) ($data['readerCount'] ?? 0),
            points: array_map('intval', $data['points'] ?? []),
            outline: $data['outline'] ?? [],
            width: (int) ($data['width'] ?? 0),
            height: (int) ($data['height'] ?? 0),
            south: (float) ($data['south'] ?? 0),
            west: (float) ($data['west'] ?? 0),
            north: (float) ($data['north'] ?? 0),
            east: (float) ($data['east'] ?? 0),
            generatedAt: (string) ($data['generatedAt'] ?? ''),
        );
    }
}
