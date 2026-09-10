<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Downloads every state border once, from the Census.
 *
 * These used to come from Overpass, one heavy `out geom` query per state, which
 * was half of every sweep and the slow half. State borders do not move, so they
 * are fetched once and committed. The result is a data file like the legislator
 * lists, not a cache: the repository carries it and a build never asks for it.
 *
 * Boundaries (c) US Census Bureau, TIGER/Line, public domain.
 */
final class FetchStateBorders extends Command
{
    protected $signature = 'borders:fetch';

    protected $description = 'Download the state boundaries used to draw the reader fields';

    private const ENDPOINT = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/0/query';

    /**
     * Server-side generalisation, in degrees. Roughly a third of a pixel at the
     * largest size a field is ever drawn, so the border is smooth on screen
     * without carrying survey-grade detail nobody can see.
     */
    private const TOLERANCE_DEGREES = 0.002;

    private const TIMEOUT_SECONDS = 180;

    public function handle(): int
    {
        $this->line('Asking the Census for every state boundary.');

        $response = Http::withHeaders(['Accept' => 'application/json'])
            ->timeout(self::TIMEOUT_SECONDS)
            ->get(self::ENDPOINT, [
                // The obvious "1=1" is refused by the Census firewall.
                'where' => "GEOID LIKE '%'",
                'outFields' => 'STUSAB,NAME',
                'returnGeometry' => 'true',
                'outSR' => '4326',
                'maxAllowableOffset' => (string) self::TOLERANCE_DEGREES,
                'f' => 'geojson',
            ]);

        if (! $response->successful()) {
            throw new RuntimeException("The Census refused the request: HTTP {$response->status()}.");
        }

        $features = $response->json('features');

        if (! is_array($features) || $features === []) {
            throw new RuntimeException('The Census returned no boundaries.');
        }

        $borders = [];

        foreach ($features as $feature) {
            $code = strtoupper((string) ($feature['properties']['STUSAB'] ?? ''));

            if (preg_match('/\A[A-Z]{2}\z/', $code) !== 1) {
                continue;
            }

            $rings = $this->ringsOf($feature['geometry'] ?? []);

            if ($rings !== []) {
                $borders[$code] = $rings;
            }
        }

        ksort($borders);

        File::ensureDirectoryExists(dirname($this->path()));
        File::put($this->path(), json_encode([
            'source' => 'US Census Bureau TIGERweb, generalised to '.self::TOLERANCE_DEGREES.' degrees',
            'fetchedAt' => now()->toDateString(),
            'borders' => $borders,
        ], JSON_UNESCAPED_SLASHES));

        $points = array_sum(array_map(
            static fn (array $rings): int => array_sum(array_map('count', $rings)),
            $borders,
        ));

        $this->info(sprintf(
            '%d boundaries, %s points, %d KB.',
            count($borders),
            number_format($points),
            intdiv((int) File::size($this->path()), 1024),
        ));

        return self::SUCCESS;
    }

    /**
     * GeoJSON orders a coordinate longitude first; the projection here takes
     * latitude first, like every other point in this application.
     *
     * @param  array<string, mixed>  $geometry
     * @return list<list<array{0: float, 1: float}>>
     */
    private function ringsOf(array $geometry): array
    {
        $type = $geometry['type'] ?? '';
        $coordinates = $geometry['coordinates'] ?? [];

        // A Polygon is one ring list; a MultiPolygon is a list of those. Only
        // the first ring of each polygon is an outline — the rest are holes,
        // and a hole in a state border is a lake we do not draw.
        $polygons = $type === 'MultiPolygon' ? $coordinates : [$coordinates];

        $rings = [];

        foreach ($polygons as $polygon) {
            $outer = $polygon[0] ?? [];
            $ring = [];

            foreach ($outer as $pair) {
                if (isset($pair[0], $pair[1])) {
                    $ring[] = [(float) $pair[1], (float) $pair[0]];
                }
            }

            if (count($ring) > 1) {
                $rings[] = $ring;
            }
        }

        return $rings;
    }

    private function path(): string
    {
        return resource_path('data/borders/us-states.json');
    }
}
