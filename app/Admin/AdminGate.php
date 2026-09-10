<?php

declare(strict_types=1);

namespace App\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

/**
 * The only privileged door in the application.
 *
 * There are no accounts anywhere else, so this is deliberately the smallest
 * thing that can work: one passphrase, held as a bcrypt hash in the
 * environment, checked in constant time, behind a rate limit.
 *
 * The passphrase itself is never in the repository and never in a file the
 * application serves. If ADMIN_PASSWORD_HASH is unset the door does not exist:
 * every attempt fails, rather than the dashboard falling open on a default.
 */
final class AdminGate
{
    /** Attempts per window. Guessing is not a supported workflow. */
    private const MAX_ATTEMPTS = 1;

    private const WINDOW_SECONDS = 30;

    private const SESSION_KEY = 'admin.unlocked_at';

    /** How long one unlock lasts before the passphrase is asked for again. */
    private const SESSION_SECONDS = 3600;

    public function isConfigured(): bool
    {
        $hash = config('admin.password_hash');

        return is_string($hash) && $hash !== '';
    }

    public function isUnlocked(Request $request): bool
    {
        $at = $request->session()->get(self::SESSION_KEY);

        return is_int($at) && (time() - $at) < self::SESSION_SECONDS;
    }

    /** Seconds until this client may try again, or zero if it may try now. */
    public function secondsUntilRetry(Request $request): int
    {
        $key = $this->limiterKey($request);

        return RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)
            ? RateLimiter::availableIn($key)
            : 0;
    }

    /**
     * Checks a passphrase, consuming an attempt whether or not it is right.
     *
     * A correct passphrase does not refund the attempt: getting one right
     * should not earn a faster second guess.
     */
    public function attempt(Request $request, string $passphrase): bool
    {
        RateLimiter::hit($this->limiterKey($request), self::WINDOW_SECONDS);

        if (! $this->isConfigured() || $passphrase === '') {
            return false;
        }

        if (! Hash::check($passphrase, (string) config('admin.password_hash'))) {
            return false;
        }

        // A new session id on privilege change, so a token captured before the
        // unlock cannot be replayed after it.
        $request->session()->regenerate();
        $request->session()->put(self::SESSION_KEY, time());

        return true;
    }

    public function lock(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
        $request->session()->regenerate();
    }

    /** Keyed by a digest of the client, so no address is stored to rate limit it. */
    private function limiterKey(Request $request): string
    {
        return 'admin-gate:'.hash_hmac('sha256', (string) $request->ip(), (string) config('app.key'));
    }
}
