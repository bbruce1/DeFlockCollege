<?php

declare(strict_types=1);

namespace App\Officials;

use App\Chapters\CampusPoint;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Which legislative districts a campus sits in.
 *
 * The Census Bureau's geocoder answers this for a coordinate, free and without
 * a key. It is the only authority that maps a point to state upper, state
 * lower, and congressional districts in one call, which is exactly the three
 * a chapter needs.
 *
 * Like the Overpass client, the host is a constant and the only user input is a
 * coordinate that CampusPoint has already range-checked.
 */
final class DistrictLookup
{
    private const ENDPOINT = 'https://geocoding.geo.census.gov/geocoder/geographies/coordinates';

    private const USER_AGENT = 'deflock-campus/1.0 (district lookup; contact via deflock.school)';

    private const TIMEOUT_SECONDS = 20;

    /** The layer names the Census returns, which are versioned by year. */
    private const UPPER = 'State Legislative Districts - Upper';

    private const LOWER = 'State Legislative Districts - Lower';

    private const CONGRESS = 'Congressional Districts';

    /**
     * @return array{state: ?string, upper: ?string, lower: ?string, congress: ?string}
     */
    public function for(CampusPoint $point): array
    {
        try {
            $response = Http::withHeaders(['User-Agent' => self::USER_AGENT])
                ->timeout(self::TIMEOUT_SECONDS)
                ->get(self::ENDPOINT, [
                    'x' => $point->longitude,
                    'y' => $point->latitude,
                    'benchmark' => 'Public_AR_Current',
                    'vintage' => 'Current_Current',
                    'layers' => 'all',
                    'format' => 'json',
                ]);
        } catch (\Throwable) {
            return $this->empty();
        }

        if (! $response->successful()) {
            return $this->empty();
        }

        $geographies = $response->json('result.geographies');

        if (! is_array($geographies)) {
            return $this->empty();
        }

        return [
            'state' => $this->firstValue($geographies, 'States', ['STUSAB']),
            'upper' => $this->district($geographies, self::UPPER, 'SLDUST'),
            'lower' => $this->district($geographies, self::LOWER, 'SLDLST'),
            'congress' => $this->congressional($geographies),
        ];
    }

    /**
     * Layer names carry the year they were drawn, so they are matched by
     * substring rather than exactly. A hardcoded "2024 …" would silently start
     * returning nothing the year the Census reapportions.
     *
     * @param  array<string, mixed>  $geographies
     */
    private function district(array $geographies, string $needle, string $field): ?string
    {
        foreach ($geographies as $layer => $entries) {
            if (! str_contains($layer, $needle) || ! is_array($entries) || $entries === []) {
                continue;
            }

            /*
             * BASENAME is the district as the state itself names it, which is
             * what the legislator files are keyed on. For most states that is a
             * number ("56"); for Massachusetts, Vermont, New Hampshire, Alaska
             * and DC it is a name ("2nd Suffolk", "Middlesex and Suffolk").
             *
             * Reading only the numeric field is why those five states never
             * prefilled: the name was thrown away and nothing matched.
             */
            $code = $this->cleanDistrict((string) ($entries[0]['BASENAME'] ?? ''))
                ?? $this->cleanDistrict((string) ($entries[0][$field] ?? ''));

            if ($code !== null) {
                return $code;
            }
        }

        return null;
    }

    /** @param  array<string, mixed>  $geographies */
    private function congressional(array $geographies): ?string
    {
        foreach ($geographies as $layer => $entries) {
            if (! str_contains($layer, self::CONGRESS) || ! is_array($entries) || $entries === []) {
                continue;
            }

            // Congressional districts are numeric everywhere, so BASENAME is
            // taken first and the numbered CD field second. CDSESSN is the
            // number of the Congress, not a district, and reading it would turn
            // GA-05 into GA-119.
            $basename = $this->cleanDistrict((string) ($entries[0]['BASENAME'] ?? ''));

            if ($basename !== null) {
                return $basename;
            }

            foreach ($entries[0] as $key => $value) {
                if (preg_match('/^CD\d+$/', (string) $key) === 1) {
                    return $this->cleanDistrict((string) $value);
                }
            }
        }

        return null;
    }

    /** @param  array<string, mixed>  $geographies */
    private function firstValue(array $geographies, string $layer, array $fields): ?string
    {
        $entries = $geographies[$layer] ?? null;

        if (! is_array($entries) || $entries === []) {
            return null;
        }

        foreach ($fields as $field) {
            $value = trim((string) ($entries[0][$field] ?? ''));

            if ($value !== '') {
                return $value;
            }
        }

        return null;
    }

    /**
     * Normalises a district label to the form the legislator files use.
     *
     * Numeric districts arrive zero-padded ("005") and are stored unpadded.
     * Named districts are stored verbatim and must survive untouched, spaces
     * and all. The value is only ever used as a lookup key in an already-loaded
     * array, never in a path or a query, so spaces are safe here.
     */
    private function cleanDistrict(string $value): ?string
    {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        // Purely numeric: drop the padding. "005" and "5" are the same district.
        if (preg_match('/\A[0-9]+\z/', $value) === 1) {
            return ltrim($value, '0') ?: '0';
        }

        // Named or mixed. Letters, digits, spaces, hyphens and periods cover
        // every state's naming; anything else is not a district label.
        if (preg_match('/\A[A-Za-z0-9 .\-]{1,60}\z/', $value) !== 1) {
            return null;
        }

        return $value;
    }

    /** @return array{state: null, upper: null, lower: null, congress: null} */
    private function empty(): array
    {
        return ['state' => null, 'upper' => null, 'lower' => null, 'congress' => null];
    }
}
