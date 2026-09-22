<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

/**
 * The preview route, which is a verification bypass on purpose.
 *
 * It mints a ticket without anybody proving they attend a school, so the only
 * thing standing between it and "anyone can make a chapter for any university"
 * is that it does not exist outside debug. That is worth a test rather than a
 * comment.
 */
final class DebugPreviewRouteTest extends TestCase
{
    public function test_it_exists_while_debugging(): void
    {
        config(['app.debug' => true]);

        $this->assertTrue(
            app('router')->has('debug.start'),
            'The preview route should be registered in debug.'
        );

        $this->get('/debug/start')
            ->assertRedirect()
            ->assertRedirectContains('ticket=');
    }

    public function test_it_hands_out_a_ticket_that_actually_opens_the_flow(): void
    {
        $location = $this->get('/debug/start')->headers->get('Location');

        $this->get($location)
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Chapters/Create'));
    }

    /**
     * The one that matters.
     *
     * Run in its own process, because Laravel's environment repository is an
     * immutable singleton: once APP_DEBUG has been read in this process it
     * cannot be changed, so an in-process test of "with debug off" would
     * quietly be testing debug on.
     */
    public function test_it_does_not_exist_with_debug_off(): void
    {
        $routes = $this->routeNamesWith(debug: false);

        $this->assertNotContains(
            'debug.start',
            $routes,
            'The preview route must not be registered outside debug.'
        );

        // Sanity: the same command does find it when debug is on, so an empty
        // result cannot be mistaken for the assertion passing.
        $this->assertContains('debug.start', $this->routeNamesWith(debug: true));
    }

    /** @return list<string> */
    private function routeNamesWith(bool $debug): array
    {
        $flag = $debug ? 'true' : 'false';

        exec(
            sprintf(
                'cd %s && APP_DEBUG=%s php artisan route:list --json 2>/dev/null',
                escapeshellarg(base_path()),
                $flag,
            ),
            $output,
            $status,
        );

        $this->assertSame(0, $status, 'route:list failed.');

        $decoded = json_decode(implode('', $output), true);

        $this->assertIsArray($decoded, 'route:list did not return JSON.');

        return array_values(array_filter(array_column($decoded, 'name')));
    }

    /** A route cache built while debugging must not carry the bypass onward. */
    public function test_the_controller_refuses_on_its_own_even_if_the_route_survives(): void
    {
        config(['app.debug' => false]);

        $this->expectException(\RuntimeException::class);

        app(\App\Http\Controllers\DebugPreviewController::class)->start();
    }

    public function test_debug_cannot_be_claimed_as_a_chapter_address(): void
    {
        $this->assertFalse(\App\Chapters\Slug::isValid('debug'));
    }
}
