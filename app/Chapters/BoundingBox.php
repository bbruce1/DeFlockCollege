<?php

declare(strict_types=1);

namespace App\Chapters;

use InvalidArgumentException;

/**
 * A campus frame: the only user-supplied value that reaches an outbound request.
 *
 * Every field is range-checked and the total area is capped, so a chapter cannot
 * ask us to fetch a continent from a free community API. See security.md.
 */
final readonly class BoundingBox
{
    /** Degrees. Web Mercator cannot represent the poles. */
    private const MAX_LATITUDE = 85.05112878;

    /** A campus frame is a few square miles; anything larger is a mistake or abuse. */
    public const MAX_AREA_SQ_MILES = 120.0;

    /** Smaller than this cannot contain a campus and yields an empty page. */
    public const MIN_AREA_SQ_MILES = 0.05;

    private const MILES_PER_DEGREE_LATITUDE = 69.0;

    public function __construct(
        public float $south,
        public float $west,
        public float $north,
        public float $east,
    ) {
        foreach (['south' => $south, 'north' => $north] as $name => $value) {
            if (! is_finite($value) || abs($value) > self::MAX_LATITUDE) {
                throw new InvalidArgumentException(
                    "Latitude {$name} must be a number between -85.05 and 85.05, got: {$value}"
                );
            }
        }

        foreach (['west' => $west, 'east' => $east] as $name => $value) {
            if (! is_finite($value) || abs($value) > 180.0) {
                throw new InvalidArgumentException(
                    "Longitude {$name} must be a number between -180 and 180, got: {$value}"
                );
            }
        }

        if ($south >= $north) {
            throw new InvalidArgumentException(
                "South ({$south}) must be less than north ({$north})."
            );
        }

        if ($west >= $east) {
            throw new InvalidArgumentException(
                "West ({$west}) must be less than east ({$east}). Frames crossing the "
                .'date line are not supported.'
            );
        }

        $area = $this->areaInSquareMiles();

        if ($area > self::MAX_AREA_SQ_MILES) {
            throw new InvalidArgumentException(sprintf(
                'That area is %.0f square miles, larger than the %.0f limit. Zoom in '
                .'until the box covers the campus and its immediate surroundings.',
                $area,
                self::MAX_AREA_SQ_MILES,
            ));
        }

        if ($area < self::MIN_AREA_SQ_MILES) {
            throw new InvalidArgumentException(
                'That area is too small to contain a campus. Draw a wider box.'
            );
        }
    }

    /**
     * Parses "south,west,north,east". Rejects anything that is not four numbers,
     * before the value is ever interpolated into a query.
     */
    public static function parse(string $value): self
    {
        $parts = explode(',', trim($value));

        if (count($parts) !== 4) {
            throw new InvalidArgumentException(
                'A bounding box must be four comma-separated numbers: south,west,north,east.'
            );
        }

        foreach ($parts as $part) {
            if (! is_numeric(trim($part))) {
                throw new InvalidArgumentException(
                    "Bounding box values must be numbers, got: {$part}"
                );
            }
        }

        return new self(
            (float) $parts[0],
            (float) $parts[1],
            (float) $parts[2],
            (float) $parts[3],
        );
    }

    public function areaInSquareMiles(): float
    {
        $midLatitude = deg2rad(($this->south + $this->north) / 2);
        $height = ($this->north - $this->south) * self::MILES_PER_DEGREE_LATITUDE;
        $width = ($this->east - $this->west) * self::MILES_PER_DEGREE_LATITUDE * cos($midLatitude);

        return abs($width * $height);
    }

    /** Real-world width over height, used to fit the rendered map. */
    public function aspect(): float
    {
        $midLatitude = deg2rad(($this->south + $this->north) / 2);
        $width = ($this->east - $this->west) * cos($midLatitude);
        $height = $this->north - $this->south;

        return round($width / $height, 3);
    }

    public function centre(): array
    {
        return [($this->south + $this->north) / 2, ($this->west + $this->east) / 2];
    }

    /** Grown by a margin, so narrow viewports have map to fill their edges with. */
    public function padded(float $factor): self
    {
        $latitudePad = ($this->north - $this->south) * $factor;
        $longitudePad = ($this->east - $this->west) * $factor;

        return new self(
            max($this->south - $latitudePad, -self::MAX_LATITUDE),
            max($this->west - $longitudePad, -180.0),
            min($this->north + $latitudePad, self::MAX_LATITUDE),
            min($this->east + $longitudePad, 180.0),
        );
    }

    public function toString(): string
    {
        return sprintf('%.5f,%.5f,%.5f,%.5f', $this->south, $this->west, $this->north, $this->east);
    }
}
