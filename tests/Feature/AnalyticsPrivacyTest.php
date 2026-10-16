<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Analytics runs on public pages and nowhere that carries a secret.
 *
 * Clarity records the page URL and a replay of the page, so on a sign-in link
 * or the admin screen it would hand a third party the very token that grants
 * access. These tests pin the line between the two.
 */
final class AnalyticsPrivacyTest extends TestCase
{
    private const TAG_HOST = 'clarity.ms/tag/';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.clarity.id' => 'test-clarity-id']);
    }

    public function test_a_public_page_loads_the_analytics_tag(): void
    {
        $this->get('/about')->assertOk()->assertSee(self::TAG_HOST, false);
    }

    public function test_the_admin_page_does_not_load_it(): void
    {
        $this->get('/admin')->assertDontSee(self::TAG_HOST, false);
    }

    public function test_a_url_carrying_a_ticket_does_not_load_it(): void
    {
        // Even on a page that is otherwise public: the token is in the URL.
        $this->get('/about?ticket=anything')->assertDontSee(self::TAG_HOST, false);
    }

    public function test_a_url_carrying_an_edit_pass_does_not_load_it(): void
    {
        $this->get('/about?pass=anything')->assertDontSee(self::TAG_HOST, false);
    }

    public function test_nothing_loads_when_no_id_is_configured(): void
    {
        config(['services.clarity.id' => null]);

        $this->get('/about')->assertOk()->assertDontSee(self::TAG_HOST, false);
    }
}
