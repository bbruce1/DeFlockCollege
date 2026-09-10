<?php

declare(strict_types=1);

namespace App\Chapters;

/**
 * The counts a chapter page is built on, all of them from OpenStreetMap.
 *
 * Regenerated wholesale on refresh, so nothing hand-written may live here. An
 * area with nothing mapped reports zero; it never reports a guess.
 *
 * Map data (c) OpenStreetMap contributors, ODbL.
 */
final readonly class ReaderSurvey
{
    public function __construct(
        public CampusPoint $point,
        /** Readers tagged ALPR within a mile of the campus point. */
        /**
         * Null when OpenStreetMap could not be reached. Distinct from zero,
         * which is a real measurement meaning nobody has mapped this campus.
         */
        public ?int $readersWithinMile,
        /** How many of those carry a Flock Safety tag. */
        public ?int $flockCount,
        /**
         * Every mapped reader in the state: what makes this a policy problem.
         *
         * Null when OpenStreetMap could not be reached for it. The statewide
         * query is far heavier than the one around campus, so it is the one
         * that fails first — and a chapter is worth making without it. Nothing
         * may print a nought in its place: a letter to a legislator saying
         * "0 across Georgia" is a fabrication, not a missing value.
         */
        public ?int $readersInState,
        public string $generatedAt,
        /** Counts at the previous refresh, for showing movement. Null on first build. */
        public ?array $previous = null,
    ) {}

    /** Whether the statewide figure is known, as opposed to known to be zero. */
    public function hasStateCount(): bool
    {
        return $this->readersInState !== null;
    }

    /** Whether the campus was actually counted, as opposed to counted as none. */
    public function hasNearbyCount(): bool
    {
        return $this->readersWithinMile !== null;
    }

    /**
     * True when the campus was counted and nothing was found.
     *
     * Not true when it could not be counted at all: a page saying "none mapped
     * here" on the strength of a failed query asserts something nobody checked.
     */
    public function isEmpty(): bool
    {
        return $this->readersWithinMile === 0;
    }

    /** Share of nearby readers that are Flock, 0 to 1. */
    public function flockShare(): float
    {
        return $this->readersWithinMile > 0 && $this->flockCount !== null
            ? $this->flockCount / $this->readersWithinMile
            : 0.0;
    }

    /** Movement since the last refresh, or null when there is no history yet. */
    public function change(): ?int
    {
        if (! isset($this->previous['readersWithinMile']) || $this->readersWithinMile === null) {
            return null;
        }

        return $this->readersWithinMile - (int) $this->previous['readersWithinMile'];
    }

    public function toArray(): array
    {
        return [
            'point' => $this->point->toString(),
            'readersWithinMile' => $this->readersWithinMile,
            'flockCount' => $this->flockCount,
            'readersInState' => $this->readersInState,
            'generatedAt' => $this->generatedAt,
            'previous' => $this->previous,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            point: CampusPoint::parse((string) ($data['point'] ?? '0,0')),
            readersWithinMile: isset($data['readersWithinMile']) ? (int) $data['readersWithinMile'] : null,
            flockCount: isset($data['flockCount']) ? (int) $data['flockCount'] : null,
            readersInState: isset($data['readersInState']) ? (int) $data['readersInState'] : null,
            generatedAt: (string) ($data['generatedAt'] ?? ''),
            previous: $data['previous'] ?? null,
        );
    }
}
