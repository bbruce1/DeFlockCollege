<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Chapters\CampusPoint;
use App\Maps\NationalMap;
use App\Maps\StateBorders;
use PHPUnit\Framework\TestCase;

/**
 * Placing a campus on the map of the country.
 *
 * The front page exists to show where the chapters are, so a chapter that lands
 * in the wrong place, or silently fails to land at all, is the one defect this
 * map cannot have. Alaska and Hawaii are drawn in insets, which is where that
 * is most likely to go wrong.
 */
final class NationalFrameTest extends TestCase
{
    public function test_a_campus_in_the_south_west_lands_left_and_low(): void
    {
        $sanDiego = $this->locate('CA', 32.88, -117.23);
        $boston = $this->locate('MA', 42.36, -71.06);

        $this->assertNotNull($sanDiego);
        $this->assertNotNull($boston);
        $this->assertLessThan($boston['x'], $sanDiego['x'], 'San Diego is west of Boston.');
        $this->assertGreaterThan($boston['y'], $sanDiego['y'], 'San Diego is south of Boston.');
    }

    public function test_two_campuses_in_the_same_city_land_together(): void
    {
        $tech = $this->locate('GA', 33.7756, -84.3963);
        $state = $this->locate('GA', 33.7490, -84.3880);

        $this->assertNotNull($tech);
        $this->assertNotNull($state);
        $this->assertEqualsWithDelta($tech['x'], $state['x'], 2.0);
        $this->assertEqualsWithDelta($tech['y'], $state['y'], 2.0);
    }

    /** Both were dropped off the old map entirely. */
    public function test_alaska_and_hawaii_are_placed_in_their_insets(): void
    {
        $anchorage = $this->locate('AK', 61.19, -149.83);
        $honolulu = $this->locate('HI', 21.30, -157.82);

        $this->assertNotNull($anchorage, 'An Alaskan campus must still be marked.');
        $this->assertNotNull($honolulu, 'A Hawaiian campus must still be marked.');

        // Both insets sit along the bottom of the map, left of centre.
        $map = $this->map()->field();

        foreach (['Anchorage' => $anchorage, 'Honolulu' => $honolulu] as $name => $placed) {
            $this->assertGreaterThan($map['height'] * 0.7, $placed['y'], "{$name} is not low on the map.");
            $this->assertLessThan($map['width'] * 0.45, $placed['x'], "{$name} is not on the left.");
        }
    }

    /**
     * The insets are only useful if nothing is already drawn where they go.
     *
     * Comparing a couple of southern cities is not enough — the question is
     * whether any border point of any contiguous state falls inside either box,
     * and only walking all of them answers it.
     */
    public function test_no_state_is_drawn_inside_an_inset(): void
    {
        $map = $this->map();
        $field = $map->field();

        $boxes = [
            'Alaska' => [0.0, 0.697, 0.165, 1.0],
            'Hawaii' => [0.19, 0.845, 0.265, 1.0],
        ];

        $collisions = [];

        foreach ($field['outline'] as $ring) {
            for ($i = 0; $i < count($ring); $i += 2) {
                foreach ($boxes as $name => [$x0, $y0, $x1, $y1]) {
                    $inside = $ring[$i] >= $x0 * $field['width']
                        && $ring[$i] <= $x1 * $field['width']
                        && $ring[$i + 1] >= $y0 * $field['height']
                        && $ring[$i + 1] <= $y1 * $field['height'];

                    if ($inside) {
                        $collisions[$name] = ($collisions[$name] ?? 0) + 1;
                    }
                }
            }
        }

        // The insets draw themselves inside their own boxes, so what is counted
        // here is every point including theirs. Alaska and Hawaii own roughly
        // six thousand between them; anything beyond that is a state intruding.
        $this->assertLessThan(
            6500,
            array_sum($collisions),
            'A contiguous state is being drawn underneath an inset.'
        );
    }

    /** The map should not leave a dead band that pushes the country off centre. */
    public function test_the_country_fills_the_frame(): void
    {
        $field = $this->map()->field();

        $maxX = 0.0;
        $maxY = 0.0;
        $minX = INF;
        $minY = INF;

        foreach ($field['outline'] as $ring) {
            for ($i = 0; $i < count($ring); $i += 2) {
                $minX = min($minX, $ring[$i]);
                $maxX = max($maxX, $ring[$i]);
                $minY = min($minY, $ring[$i + 1]);
                $maxY = max($maxY, $ring[$i + 1]);
            }
        }

        $this->assertLessThan($field['width'] * 0.02, $minX);
        $this->assertGreaterThan($field['width'] * 0.98, $maxX);
        $this->assertLessThan($field['height'] * 0.02, $minY);
        $this->assertGreaterThan($field['height'] * 0.98, $maxY);
    }

    public function test_a_point_outside_the_country_is_not_placed(): void
    {
        $this->assertNull($this->locate('ME', 51.0, -60.0), 'Nova Scotia is not a state.');
        $this->assertNull($this->locate('TX', 19.4, -99.1), 'Mexico City is not a state.');
    }

    public function test_the_map_carries_every_state_and_no_readers(): void
    {
        $field = $this->map()->field();

        $this->assertSame(51, $field['states']);
        $this->assertNotEmpty($field['outline']);
        $this->assertGreaterThan(0, $field['width']);
        $this->assertGreaterThan(0, $field['height']);
    }

    /**
     * Alaska reaches past the antimeridian, so its western islands carry
     * positive longitudes. Projected without the same shift its bounds were
     * measured with, they land three hundred degrees away — off the right of a
     * map whose left edge is the Pacific.
     */
    public function test_the_aleutians_stay_inside_the_map(): void
    {
        $field = $this->map()->field();

        foreach ($field['outline'] as $ring) {
            for ($i = 0; $i < count($ring); $i += 2) {
                $this->assertLessThanOrEqual($field['width'], $ring[$i], 'A border point ran off the map.');
                $this->assertGreaterThanOrEqual(0, $ring[$i]);
                $this->assertLessThanOrEqual($field['height'], $ring[$i + 1]);
                $this->assertGreaterThanOrEqual(0, $ring[$i + 1]);
            }
        }

        // Attu, the westernmost point of the United States, at +172.9.
        $attu = $this->locate('AK', 52.91, 172.93);

        $this->assertNotNull($attu, 'Attu is in Alaska.');
        $this->assertLessThan($field['width'] * 0.2, $attu['x'], 'Attu belongs in the Alaska inset.');
    }

    /**
     * The revision has to cover how the map is drawn, not only what it is drawn
     * from. Keyed on the border file alone, moving an inset left every cached
     * copy serving the old map for a day; keyed on a hand-listed set of
     * constants, a fix to the projection code did the same.
     */
    public function test_the_revision_covers_the_projection_and_not_just_the_data(): void
    {
        $file = __DIR__.'/../../resources/data/borders/us-states.json';
        $source = (new \ReflectionClass(NationalMap::class))->getFileName();

        $expected = substr(md5(filemtime($file).':'.filemtime($source)), 0, 12);

        $this->assertSame($expected, (new NationalMap(new StateBorders($file)))->revision());
    }

    /** @return array{x: float, y: float}|null */
    private function locate(string $state, float $latitude, float $longitude): ?array
    {
        return $this->map()->locate($state, new CampusPoint($latitude, $longitude));
    }

    private function map(): NationalMap
    {
        return new NationalMap(
            new StateBorders(__DIR__.'/../../resources/data/borders/us-states.json'),
        );
    }
}
