<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Http\Request;
use Tests\TestCase;

/**
 * The map of the country served to the front page.
 *
 * Two things here are invisible in the source and easy for a later edit to
 * undo: "us" is not a state code, so /coverage/us has to be matched before the
 * per-state route or it would be answered by it and 404 forever; and the map is
 * drawn from committed data, so unlike the old aggregate it must never depend
 * on a build step having been run.
 */
final class NationalCoverageTest extends TestCase
{
    public function test_the_map_is_not_shadowed_by_the_state_route(): void
    {
        $matched = app('router')->getRoutes()->match(Request::create('/coverage/us'));

        $this->assertSame('coverage.nation', $matched->getName());
    }

    public function test_the_map_is_served_without_any_build_step(): void
    {
        $response = $this->getJson('/coverage/us');

        $response->assertOk();
        $response->assertJsonStructure(['points', 'outline', 'width', 'height']);

        $this->assertNotEmpty($response->json('outline'));
        $this->assertGreaterThan(0, $response->json('width'));
        $this->assertGreaterThan(0, $response->json('height'));
    }

    /** The front page shows campuses; cameras belong to a chapter's own state. */
    public function test_the_map_carries_no_readers(): void
    {
        $this->assertSame([], $this->getJson('/coverage/us')->json('points'));
    }

    public function test_the_home_page_always_has_a_map_to_draw(): void
    {
        $this->get('/')->assertInertia(
            fn ($page) => $page->component('Home')
                ->has('coverage.url')
                ->has('coverage.markers')
                ->has('coverage.readersNearby')
        );
    }

    /** A day-long cache needs the URL to change when the border data does. */
    public function test_the_map_url_carries_a_revision(): void
    {
        $this->get('/')->assertInertia(
            fn ($page) => $page->where(
                'coverage.url',
                fn (string $url): bool => (bool) preg_match('/\?v=[0-9a-f]{12}\z/', $url)
            )
        );
    }
}
