<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Maps\StateBorders;
use PHPUnit\Framework\TestCase;
use RuntimeException;

/**
 * The committed border data.
 *
 * Every state must be present, because a missing one is not an error the build
 * would notice: the field would simply draw a cloud of readers with no shape
 * around it, which is the failure this data exists to prevent.
 */
final class StateBordersTest extends TestCase
{
    public function test_every_state_has_an_outline(): void
    {
        $borders = $this->real();

        foreach (\App\Chapters\States::codes() as $code) {
            $rings = $borders->ringsFor($code);

            $this->assertNotEmpty($rings, "{$code} has no border.");
        }
    }

    public function test_a_border_is_latitude_first(): void
    {
        // Georgia sits near 32 N, 83 W. Longitude first would put it in the
        // Indian Ocean, and nothing downstream would complain.
        [$latitude, $longitude] = $this->real()->ringsFor('GA')[0][0];

        $this->assertGreaterThan(30.0, $latitude);
        $this->assertLessThan(36.0, $latitude);
        $this->assertLessThan(-80.0, $longitude);
        $this->assertGreaterThan(-86.0, $longitude);
    }

    public function test_an_island_state_keeps_each_island(): void
    {
        $this->assertGreaterThan(1, count($this->real()->ringsFor('HI')));
    }

    public function test_an_unknown_code_has_no_outline_rather_than_an_error(): void
    {
        $this->assertSame([], $this->real()->ringsFor('ZZ'));
    }

    public function test_missing_data_says_how_to_fetch_it(): void
    {
        $borders = new StateBorders('/nonexistent/us-states.json');

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessageMatches('/borders:fetch/');

        $borders->ringsFor('GA');
    }

    private function real(): StateBorders
    {
        return new StateBorders(__DIR__.'/../../resources/data/borders/us-states.json');
    }
}
