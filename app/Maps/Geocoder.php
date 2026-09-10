<?php

declare(strict_types=1);

namespace App\Maps;

use App\Chapters\CampusPoint;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Turns "Georgia Tech, Atlanta" into a point.
 *
 * This is what replaced the map picker. Framing a box on a map was the most
 * fiddly step in creation and the easiest to get subtly wrong; a place name the
 * creator recognises in a list is faster and self-checking.
 *
 * The creator always confirms a named result, so a wrong match is visible
 * before it is saved rather than after the page is built.
 */
final class Geocoder
{
    private const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

    private const USER_AGENT = 'deflock-campus/1.0 (campus lookup; contact via deflock.school)';

    private const TIMEOUT_SECONDS = 15;

    private const MAX_RESULTS = 6;

    private const MAX_QUERY_LENGTH = 120;

    /**
     * @return list<array{label: string, latitude: float, longitude: float}>
     *
     * @throws RuntimeException when the lookup service cannot be reached
     */
    public function search(string $term): array
    {
        $term = trim(preg_replace('/[[:cntrl:]]+/u', ' ', $term) ?? '');

        if (mb_strlen($term) < 3) {
            return [];
        }

        $response = Http::withHeaders(['User-Agent' => self::USER_AGENT])
            ->timeout(self::TIMEOUT_SECONDS)
            ->get(self::ENDPOINT, [
                'q' => mb_substr($term, 0, self::MAX_QUERY_LENGTH),
                'format' => 'jsonv2',
                'limit' => self::MAX_RESULTS,
                'countrycodes' => 'us',
                'addressdetails' => 1,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException(
                'The place lookup service is unavailable right now. It is usually busy '
                .'rather than broken, so this is worth trying again shortly.'
            );
        }

        $results = [];

        foreach ((array) $response->json() as $place) {
            if (! isset($place['lat'], $place['lon'], $place['display_name'])) {
                continue;
            }

            try {
                $point = new CampusPoint((float) $place['lat'], (float) $place['lon']);
            } catch (\InvalidArgumentException) {
                continue;
            }

            $results[] = [
                'label' => (string) $place['display_name'],
                'latitude' => $point->latitude,
                'longitude' => $point->longitude,
                'state' => $this->stateCode($place['address'] ?? []),
                'city' => $this->city($place['address'] ?? []),
            ];
        }

        return $results;
    }

    /**
     * The town this place sits in.
     *
     * Taken from the structured address rather than the display name. That
     * string runs from the most specific part outwards, so the second element
     * of it is usually the street, and reading a town out of it produces
     * "10th Street Northeast" for a campus on 10th Street.
     *
     * Nominatim files settlements under different keys depending on how the
     * place is classified, so the first one present wins.
     *
     * @param  array<string, mixed>  $address
     */
    private function city(array $address): ?string
    {
        foreach (['city', 'town', 'village', 'municipality', 'suburb', 'county'] as $key) {
            $value = trim((string) ($address[$key] ?? ''));

            if ($value !== '') {
                return $value;
            }
        }

        return null;
    }

    /**
     * Nominatim reports the state by name, and the survey needs the postal code.
     *
     * @param  array<string, mixed>  $address
     */
    private function stateCode(array $address): ?string
    {
        $state = (string) ($address['state'] ?? '');

        return $state === '' ? null : \App\Chapters\States::code($state);
    }
}
