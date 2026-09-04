<?php

declare(strict_types=1);

namespace App\Chapters;

/**
 * Everything the OpenStreetMap pipeline produces for one campus.
 *
 * Regenerated wholesale on refresh, so nothing hand-written may live here.
 * Map data (c) OpenStreetMap contributors, ODbL.
 */
final readonly class ChapterMap
{
    public function __construct(
        /** Real-world width over height, used to fit the render. */
        public float $aspect,
        /** [tier, [x, y, x, y, ...]] in a shared 0-1000 space. Tier 0 is arterial. */
        public array $streets,
        /** [x, y, bearingDegrees or -1, isFlock] in the same space. */
        public array $readers,
        /** Readers within a mile of the frame's centre, which is wider than the frame. */
        public int $readersWithinMile,
        public int $flockCount,
        /** Every mapped reader in the state: what makes this a policy problem. */
        public int $readersInState,
        public string $bbox,
        public string $generatedAt,
        /** Counts at the previous refresh, for showing movement. Null on first build. */
        public ?array $previous = null,
    ) {}

    /** Share of the compass covered by outward-facing readers, 0 to 1. */
    public function horizonCoverage(): float
    {
        $sectors = [];

        foreach ($this->readers as $reader) {
            $bearing = $reader[2] ?? -1;

            if ($bearing < 0) {
                continue;
            }

            $sectors[intdiv((int) (((int) $bearing % 360 + 360) % 360), 15)] = true;
        }

        return count($sectors) / 24;
    }

    public function readersWithBearing(): int
    {
        return count(array_filter($this->readers, static fn (array $r): bool => ($r[2] ?? -1) >= 0));
    }

    public function toArray(): array
    {
        return [
            'aspect' => $this->aspect,
            'streets' => $this->streets,
            'readers' => $this->readers,
            'readersWithinMile' => $this->readersWithinMile,
            'flockCount' => $this->flockCount,
            'readersInState' => $this->readersInState,
            'bbox' => $this->bbox,
            'generatedAt' => $this->generatedAt,
            'previous' => $this->previous,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            aspect: (float) ($data['aspect'] ?? 1.0),
            streets: $data['streets'] ?? [],
            readers: $data['readers'] ?? [],
            readersWithinMile: (int) ($data['readersWithinMile'] ?? 0),
            flockCount: (int) ($data['flockCount'] ?? 0),
            readersInState: (int) ($data['readersInState'] ?? 0),
            bbox: (string) ($data['bbox'] ?? ''),
            generatedAt: (string) ($data['generatedAt'] ?? ''),
            previous: $data['previous'] ?? null,
        );
    }
}
