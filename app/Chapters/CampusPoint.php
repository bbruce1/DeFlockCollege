<?php

declare(strict_types=1);

namespace App\Chapters;

use InvalidArgumentException;

/**
 * Where a campus is, as a single point.
 *
 * This replaces the drawn bounding box. The page speaks in "within a mile", so
 * the radius is fixed and a chapter only needs to remember a centre.
 */
final readonly class CampusPoint
{
    /** No campus is near the poles, and this keeps the value obviously sane. */
    private const MAX_LATITUDE = 85.0;

    public function __construct(public float $latitude, public float $longitude)
    {
        if (! is_finite($latitude) || ! is_finite($longitude)) {
            throw new InvalidArgumentException('Campus coordinates must be finite numbers.');
        }

        if (abs($latitude) > self::MAX_LATITUDE) {
            throw new InvalidArgumentException(
                "Latitude must be between -85 and 85, got {$latitude}."
            );
        }

        if (abs($longitude) > 180.0) {
            throw new InvalidArgumentException(
                "Longitude must be between -180 and 180, got {$longitude}."
            );
        }
    }

    public static function parse(string $value): self
    {
        $parts = explode(',', trim($value));

        if (count($parts) !== 2) {
            throw new InvalidArgumentException(
                'A campus point must be two comma-separated numbers: latitude,longitude.'
            );
        }

        foreach ($parts as $part) {
            if (! is_numeric(trim($part))) {
                throw new InvalidArgumentException(
                    "Campus coordinates must be numbers, got: {$part}"
                );
            }
        }

        return new self((float) $parts[0], (float) $parts[1]);
    }

    /**
     * Great-circle distance to another point, in metres.
     *
     * Haversine rather than a flat approximation: the numbers here are small
     * enough that either would do, but this one is right everywhere and costs
     * nothing at the rate it is called.
     */
    public function metresTo(self $other): float
    {
        $earthRadius = 6_371_008.8;

        $lat1 = deg2rad($this->latitude);
        $lat2 = deg2rad($other->latitude);
        $deltaLat = $lat2 - $lat1;
        $deltaLon = deg2rad($other->longitude - $this->longitude);

        $a = sin($deltaLat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($deltaLon / 2) ** 2;

        return 2 * $earthRadius * asin(min(1.0, sqrt($a)));
    }

    public function toString(): string
    {
        return sprintf('%.5f,%.5f', $this->latitude, $this->longitude);
    }

    public function __toString(): string
    {
        return $this->toString();
    }
}
