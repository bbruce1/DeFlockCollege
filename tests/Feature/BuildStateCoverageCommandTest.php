<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\StateCoverage;
use App\Chapters\StateCoverageRepository;
use App\Maps\StateCoverageBuilder;
use App\Maps\OverpassClient;
use App\Maps\StateBorders;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Resuming a half-finished sweep.
 *
 * Overpass blocks an address that queries it too hard, and it has blocked this
 * one, so a sweep is expected to stop part-way and be picked up later. A resume
 * that re-queried the states it already held would be blocked again before it
 * ever reached a new one.
 */
final class BuildStateCoverageCommandTest extends TestCase
{
    private string $directory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->directory = sys_get_temp_dir().'/deflock-sweep-'.bin2hex(random_bytes(6));

        $repository = new StateCoverageRepository($this->directory);

        $this->app->instance(StateCoverageRepository::class, $repository);
        $this->app->instance(
            StateCoverageBuilder::class,
            new StateCoverageBuilder(
                new OverpassClient,
                $repository,
                $this->app->make(StateBorders::class),
            ),
        );
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->directory);

        parent::tearDown();
    }

    public function test_a_state_already_on_disk_is_not_fetched_again(): void
    {
        Http::fake();
        $this->hold('GA');

        $this->artisan('coverage:build', ['state' => ['GA'], '--pause' => 0])->assertExitCode(0);

        Http::assertNothingSent();
    }

    public function test_a_state_we_do_not_hold_is_fetched(): void
    {
        Http::fake(['*' => Http::response(['elements' => []])]);

        $this->artisan('coverage:build', ['state' => ['GA'], '--pause' => 0])->assertExitCode(0);

        Http::assertSent(fn ($request) => str_contains($request->url(), 'overpass'));
    }

    public function test_a_lowercase_argument_still_names_a_state(): void
    {
        Http::fake();
        $this->hold('GA');

        $this->artisan('coverage:build', ['state' => ['ga'], '--pause' => 0])->assertExitCode(0);

        Http::assertNothingSent();
    }

    public function test_an_unknown_state_code_is_reported_not_written(): void
    {
        Http::fake();

        $this->artisan('coverage:build', ['state' => ['ZZ'], '--pause' => 0])
            ->expectsOutputToContain('ZZ  failed')
            ->assertExitCode(1);

        $this->assertFalse(File::isDirectory($this->directory), 'Nothing was written for ZZ.');
    }

    /** The border must come from the data file, not from a query. */
    public function test_a_built_state_is_drawn_inside_its_census_border(): void
    {
        Http::fake(['*' => Http::response(['elements' => [
            ['type' => 'node', 'lat' => 33.7756, 'lon' => -84.3963],
            ['type' => 'node', 'lat' => 32.0809, 'lon' => -81.0912],
        ]])]);

        $this->artisan('coverage:build', ['state' => ['GA'], '--pause' => 0])->assertExitCode(0);

        $coverage = app(StateCoverageRepository::class)->find('GA');

        $this->assertNotNull($coverage);
        $this->assertSame(2, $coverage->readerCount);
        $this->assertNotEmpty($coverage->outline, 'Georgia was drawn with no border.');
        $this->assertGreaterThan(0, $coverage->width);
        $this->assertGreaterThan(0, $coverage->height);

        // Exactly one request: the readers. The border cost nothing.
        Http::assertSentCount(1);
    }

    private function hold(string $code): void
    {
        app(StateCoverageRepository::class)->save(new StateCoverage(
            $code, 12, [1, 2, 3, 4], [[0, 0, 1, 1]], 440, 500,
            30.0, -85.0, 35.0, -80.0, '2026-09-09',
        ));
    }
}
