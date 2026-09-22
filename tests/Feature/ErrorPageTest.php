<?php

declare(strict_types=1);

namespace Tests\Feature;

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
}
