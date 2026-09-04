<?php

declare(strict_types=1);

namespace App\Maps;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * The only server-initiated network call in the application.
 *
 * The endpoint is a constant: a user can never influence the host. The only
 * user-supplied input that reaches a query is a BoundingBox, which has already
 * been range-checked and area-capped by its constructor.
 *
 * Overpass is a free community service with a small number of slots. Being rate
 * limited is our fault rather than theirs, so this backs off rather than
 * hammering, and identifies itself so they can contact us if we misbehave.
 */
final class OverpassClient
{
    private const ENDPOINT = 'https://overpass-api.de/api/interpreter';

    private const USER_AGENT = 'deflock-campus/1.0 (chapter map generator; contact via deflock.school)';

    private const TIMEOUT_SECONDS = 120;

    private const MAX_ATTEMPTS = 4;

    private const BACKOFF_BASE_MS = 8000;

    /** @var callable(string): void */
    private $logger;

    public function __construct(?callable $logger = null)
    {
        $this->logger = $logger ?? static fn (string $line) => null;
    }

    /**
     * Runs a query, retrying on the failures that are worth retrying.
     *
     * @throws RuntimeException when Overpass cannot be reached or keeps refusing
     */
    public function run(string $query): array
    {
        $lastError = 'unknown';

        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; $attempt++) {
            try {
                $response = $this->send($query);

                if ($response->successful()) {
                    $decoded = $response->json();

                    if (! is_array($decoded)) {
                        throw new RuntimeException('Overpass returned a body that was not JSON.');
                    }

                    return $decoded;
                }

                $lastError = "HTTP {$response->status()}";

                // 429 is rate limiting and 504 is a busy slot: both clear on their own.
                if (! in_array($response->status(), [429, 502, 503, 504], true)) {
                    throw new RuntimeException(
                        "Overpass refused the query with HTTP {$response->status()}."
                    );
                }
            } catch (RuntimeException $e) {
                throw $e;
            } catch (\Throwable $e) {
                $lastError = $e->getMessage();
            }

            if ($attempt === self::MAX_ATTEMPTS) {
                break;
            }

            $delayMs = self::BACKOFF_BASE_MS * (2 ** ($attempt - 1));
            ($this->logger)("Overpass busy ({$lastError}); waiting ".($delayMs / 1000)."s");
            usleep($delayMs * 1000);
        }

        throw new RuntimeException(
            "Could not reach OpenStreetMap after ".self::MAX_ATTEMPTS." attempts ({$lastError}). "
            .'It is usually busy rather than broken, so this is worth retrying shortly.'
        );
    }

    private function send(string $query): Response
    {
        return Http::asForm()
            ->withHeaders(['User-Agent' => self::USER_AGENT])
            ->timeout(self::TIMEOUT_SECONDS)
            ->post(self::ENDPOINT, ['data' => $query]);
    }
}
