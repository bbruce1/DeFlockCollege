<?php

declare(strict_types=1);

namespace App\Maps;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use RuntimeException;

/**
 * The only server-initiated network call in the application.
 *
 * The endpoint is a constant: a user can never influence the host. The only
 * * user-supplied input that reaches a query is a campus point, which has already
 * been range-checked by its constructor.
 *
 * Overpass is a free community service with a small number of slots. Being rate
 * limited is our fault rather than theirs, so this backs off rather than
 * hammering, and identifies itself so they can contact us if we misbehave.
 *
 * Two budgets, because two very different callers wait on it. The nightly
 * refresh has nobody watching and can afford to be patient. Chapter creation
 * runs inside a visitor's request, behind proxies that give up after a minute
 * or two; waiting out the patient policy there took up to nine minutes and the
 * proxy dropped the request before the chapter was ever saved. See quick().
 */
final class OverpassClient
{
    private const ENDPOINT = 'https://overpass-api.de/api/interpreter';

    private const USER_AGENT = 'deflock-campus/1.0 (chapter map generator; contact via deflock.school)';

    private const TIMEOUT_SECONDS = 120;

    private const MAX_ATTEMPTS = 4;

    private const BACKOFF_BASE_MS = 8000;

    /**
     * Per query, inside a visitor's request. Creation runs at most two queries,
     * so the worst case stays well inside a proxy's timeout.
     */
    private const QUICK_TIMEOUT_SECONDS = 20;

    /** @var callable(string): void */
    private $logger;

    private readonly int $backoffBaseMs;

    /**
     * @param  int|null  $backoffBaseMs  Overrides the wait between retries.
     *                                   Only a test exercising the failure path
     *                                   has reason to shorten it.
     */
    public function __construct(
        ?callable $logger = null,
        ?int $backoffBaseMs = null,
        private readonly int $timeoutSeconds = self::TIMEOUT_SECONDS,
        private readonly int $maxAttempts = self::MAX_ATTEMPTS,
    ) {
        if ($maxAttempts < 1) {
            throw new InvalidArgumentException("Overpass needs at least one attempt, got: {$maxAttempts}");
        }

        $this->logger = $logger ?? static fn (string $line) => null;
        $this->backoffBaseMs = $backoffBaseMs ?? self::BACKOFF_BASE_MS;
    }

    /**
     * One short attempt and no backoff, for a caller somebody is waiting on.
     *
     * Giving up early costs nothing that matters: a count that could not be
     * fetched is saved as unknown rather than as nought, and the nightly
     * refresh, which keeps the patient policy, fills it in.
     */
    public static function quick(): self
    {
        return new self(
            backoffBaseMs: 0,
            timeoutSeconds: self::QUICK_TIMEOUT_SECONDS,
            maxAttempts: 1,
        );
    }

    /**
     * Runs a query, retrying on the failures that are worth retrying.
     *
     * @throws RuntimeException when Overpass cannot be reached or keeps refusing
     */
    public function run(string $query): array
    {
        $lastError = 'unknown';

        for ($attempt = 1; $attempt <= $this->maxAttempts; $attempt++) {
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

            if ($attempt === $this->maxAttempts) {
                break;
            }

            $delayMs = $this->backoffBaseMs * (2 ** ($attempt - 1));
            if ($delayMs > 0) {
                ($this->logger)("Overpass busy ({$lastError}); waiting ".($delayMs / 1000)."s");
                usleep($delayMs * 1000);
            }
        }

        throw new RuntimeException(
            "Could not reach OpenStreetMap after {$this->maxAttempts} attempt(s) ({$lastError}). "
            .'It is usually busy rather than broken, so this is worth retrying shortly.'
        );
    }

    private function send(string $query): Response
    {
        return Http::asForm()
            ->withHeaders(['User-Agent' => self::USER_AGENT])
            ->timeout($this->timeoutSeconds)
            ->post(self::ENDPOINT, ['data' => $query]);
    }
}
