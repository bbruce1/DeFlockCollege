<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Chapters\CampusPoint;
use App\Chapters\StateCoverage;
use PHPUnit\Framework\TestCase;

/**
 * The projection that draws a state behind a chapter page.
 *
 * Fitting a bounding box to a square distorted every state that is not square,
 * and ignoring the latitude correction stretched all of them sideways. These
 * cases have answers that can be worked out on paper, so they pin the maths
 * rather than a particular dataset.
 */
final class ProjectionTest extends TestCase
{
    /** A degree of longitude is a full degree wide only at the equator. */
    public function test_a_square_of_degrees_at_the_equator_is_square(): void
    {
        $aspect = $this->aspectOf(south: -1.0, north: 1.0, west: -1.0, east: 1.0);

        $this->assertEqualsWithDelta(1.0, $aspect, 0.01);
    }

    /** At sixty degrees north, cos(60) is a half, so two degrees of longitude
     *  cover the same ground as one of latitude. */
    public function test_longitude_is_narrowed_by_latitude(): void
    {
        $aspect = $this->aspectOf(south: 59.5, north: 60.5, west: -1.0, east: 1.0);

        $this->assertEqualsWithDelta(1.0, $aspect, 0.02);
    }

    public function test_a_wide_box_stays_wide(): void
    {
        // Three degrees of longitude by one of latitude, on the equator.
        $aspect = $this->aspectOf(south: -0.5, north: 0.5, west: -1.5, east: 1.5);

        $this->assertEqualsWithDelta(3.0, $aspect, 0.02);
    }

    public function test_a_tall_box_stays_tall(): void
    {
        $aspect = $this->aspectOf(south: -1.5, north: 1.5, west: -0.5, east: 0.5);

        $this->assertEqualsWithDelta(1 / 3, $aspect, 0.01);
    }

    /** The longer axis fills the grid; nothing is ever drawn larger than it. */
    public function test_the_longer_axis_fills_the_grid(): void
    {
        foreach ([[3.0, 1.0], [1.0, 3.0], [1.0, 1.0]] as [$lon, $lat]) {
            $coverage = $this->coverage(-$lat / 2, $lat / 2, -$lon / 2, $lon / 2);

            $this->assertSame(
                StateCoverage::GRID,
                max($coverage->width, $coverage->height),
                'the longer side should fill the grid exactly',
            );
            $this->assertLessThanOrEqual(StateCoverage::GRID, min($coverage->width, $coverage->height));
        }
    }

    /** A campus at the centre of a state lands at the centre of the drawing. */
    public function test_a_central_campus_lands_in_the_middle(): void
    {
        $coverage = $this->coverage(30.0, 40.0, -100.0, -90.0);
        $located = $coverage->locate(new CampusPoint(35.0, -95.0));

        $this->assertNotNull($located);
        $this->assertEqualsWithDelta($coverage->width / 2, $located['x'], 2.0);
        $this->assertEqualsWithDelta($coverage->height / 2, $located['y'], 2.0);
    }

    public function test_a_campus_outside_the_state_is_not_placed(): void
    {
        $coverage = $this->coverage(30.0, 40.0, -100.0, -90.0);

        $this->assertNull($coverage->locate(new CampusPoint(45.0, -95.0)));
        $this->assertNull($coverage->locate(new CampusPoint(35.0, -80.0)));
    }

    private function aspectOf(float $south, float $north, float $west, float $east): float
    {
        $coverage = $this->coverage($south, $north, $west, $east);

        return $coverage->width / max($coverage->height, 1);
    }

    /** Mirrors the builder's projection, which is what these tests are pinning. */
    private function coverage(float $south, float $north, float $west, float $east): StateCoverage
    {
        $mid = deg2rad(($north + $south) / 2);
        $spanX = max(($east - $west) * cos($mid), 1e-9);
        $spanY = max($north - $south, 1e-9);
        $scale = StateCoverage::GRID / max($spanX, $spanY);

        return new StateCoverage(
            state: 'ZZ',
            readerCount: 0,
            points: [],
            outline: [],
            width: (int) round($spanX * $scale),
            height: (int) round($spanY * $scale),
            south: $south,
            west: $west,
            north: $north,
            east: $east,
            generatedAt: '2026-09-09',
        );
    }
}
