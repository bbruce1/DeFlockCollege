<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Route;
use RuntimeException;
use Tests\TestCase;

/**
 * The pages a visitor lands on when something is wrong.
 *
 * Worth testing because they are reached by accident rather than on purpose,
 * which means nobody notices when they break.
 */
final class ErrorPageTest extends TestCase
{
    public function test_an_unknown_address_gets_the_sites_own_page(): void
    {
        $this->get('/no-such-page')
            ->assertNotFound()
            ->assertInertia(fn ($page) => $page
                ->component('Error')
                ->where('status', 404));
    }

    public function test_an_unknown_chapter_gets_the_same_page(): void
    {
        // The common case: a mistyped or stale chapter address.
        $this->get('/this-chapter-does-not-exist')
            ->assertNotFound()
            ->assertInertia(fn ($page) => $page->component('Error'));
    }

    public function test_a_json_client_still_gets_json(): void
    {
        $response = $this->getJson('/no-such-page');

        $response->assertNotFound();
        $this->assertStringContainsString('application/json', (string) $response->headers->get('content-type'));
    }

    public function test_the_status_code_is_preserved_not_flattened_to_200(): void
    {
        // An error page served as 200 tells search engines the address is real.
        $this->get('/no-such-page')->assertStatus(404);
    }

    public function test_an_error_page_is_kept_out_of_search(): void
    {
        $this->get('/no-such-page')
            ->assertInertia(fn ($page) => $page->where('meta.noindex', true))
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false);
    }

    /**
     * A crash in production gets the site's own page, built without Inertia or
     * the compiled assets, because either may be what broke.
     */
    public function test_a_crash_with_debug_off_gets_the_standalone_page(): void
    {
        Exceptions::fake();
        config(['app.debug' => false]);
        Route::get('/__crash', static fn () => throw new RuntimeException('secret internal detail'));

        $response = $this->get('/__crash');

        $response->assertStatus(500)
            ->assertSeeText('Something went wrong')
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false)
            ->assertDontSeeText('secret internal detail');

        $html = (string) $response->getContent();

        $this->assertStringNotContainsString('<script', $html, 'The 500 page must not need a script.');
        $this->assertStringNotContainsString('/build/', $html, 'The 500 page must not need the built assets.');
        $this->assertStringNotContainsString('<link rel="stylesheet"', $html);

        // Still reported: a tidy page is not a reason to lose the error.
        Exceptions::assertReported(RuntimeException::class);
    }

    public function test_the_maintenance_page_stands_alone_too(): void
    {
        $html = view('errors.503')->render();

        $this->assertStringContainsString('Down for a moment', $html);
        $this->assertStringNotContainsString('<script', $html);
    }
}
