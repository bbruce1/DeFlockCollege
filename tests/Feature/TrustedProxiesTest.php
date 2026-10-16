<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Who the visitor is, behind a load balancer or Cloudflare.
 *
 * Every per-IP rate limit depends on this. Without trusted proxies every
 * request appears to come from the proxy, so one limit is shared by everybody;
 * with too many, anybody can name their own address and skip the limits.
 */
final class TrustedProxiesTest extends TestCase
{
    private const PROXY = '10.0.0.1';

    private const VISITOR = '203.0.113.9';

    protected function setUp(): void
    {
        parent::setUp();

        Route::get('/__client-ip', static fn (Request $request): string => (string) $request->ip());
    }

    public function test_a_trusted_proxy_passes_the_visitors_address_through(): void
    {
        config(['trustedproxy.proxies' => self::PROXY]);

        $this->fromProxy(self::PROXY)->assertSeeText(self::VISITOR);
    }

    public function test_a_proxy_in_a_comma_separated_list_is_trusted(): void
    {
        config(['trustedproxy.proxies' => '10.9.9.9, '.self::PROXY]);

        $this->fromProxy(self::PROXY)->assertSeeText(self::VISITOR);
    }

    public function test_an_untrusted_sender_cannot_name_its_own_address(): void
    {
        config(['trustedproxy.proxies' => self::PROXY]);

        $this->fromProxy('198.51.100.7')->assertSeeText('198.51.100.7');
    }

    public function test_nothing_is_trusted_by_default(): void
    {
        config(['trustedproxy.proxies' => null]);

        $this->fromProxy(self::PROXY)->assertSeeText(self::PROXY);
    }

    public function test_the_setting_comes_from_trusted_proxies_in_the_environment(): void
    {
        $this->assertSame('10.0.0.0/8,'.self::PROXY, $this->configWithEnv('10.0.0.0/8,'.self::PROXY));
        $this->assertSame('*', $this->configWithEnv('*'));
        $this->assertNull($this->configWithEnv(''), 'An empty value must trust nobody.');
    }

    private function fromProxy(string $remoteAddress): \Illuminate\Testing\TestResponse
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $remoteAddress])
            ->withHeader('X-Forwarded-For', self::VISITOR)
            ->get('/__client-ip')
            ->assertOk();
    }

    /** Loads the config file as the framework would, with the variable set. */
    private function configWithEnv(string $value): mixed
    {
        $previous = $_SERVER['TRUSTED_PROXIES'] ?? null;
        $_SERVER['TRUSTED_PROXIES'] = $value;

        try {
            return (require config_path('trustedproxy.php'))['proxies'];
        } finally {
            if ($previous === null) {
                unset($_SERVER['TRUSTED_PROXIES']);
            } else {
                $_SERVER['TRUSTED_PROXIES'] = $previous;
            }
        }
    }
}
