<?php

declare(strict_types=1);

namespace App\Chapters;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Best-effort check that an Instagram handle exists.
 *
 * Instagram serves the same login-walled shell to a server whether a profile
 * exists or not, and its profile API answers `require_login` to unauthenticated
 * callers. There is therefore no reliable way to prove a handle exists from the
 * server, and this reports UNKNOWN rather than guessing.
 *
 * Because of that, UNKNOWN is the normal answer and must never block creation:
 * refusing every chapter because Instagram will not talk to us would stop the
 * product working. A definite MISSING is worth surfacing as a warning; anything
 * else is worth nothing.
 */
final class InstagramProbe
{
    public const EXISTS = 'exists';

    public const MISSING = 'missing';

    public const UNKNOWN = 'unknown';

    private const ENDPOINT = 'https://www.instagram.com/';

    private const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        .'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

    private const TIMEOUT_SECONDS = 8;

    public function check(string $handle): string
    {
        $handle = trim($handle, " \t\n\r\0\x0B@/");

        // Allowlisted again here because this builds a URL, even though
        // SocialHandle has usually already validated it.
        if (preg_match('/\A[A-Za-z0-9._]{1,30}\z/', $handle) !== 1) {
            return self::MISSING;
        }

        try {
            $response = Http::withHeaders(['User-Agent' => self::USER_AGENT])
                ->timeout(self::TIMEOUT_SECONDS)
                ->withoutRedirecting()
                ->get(self::ENDPOINT.$handle.'/');
        } catch (Throwable) {
            return self::UNKNOWN;
        }

        if ($response->status() === 404) {
            return self::MISSING;
        }

        // A 200 here is the login wall, served for real and invented handles
        // alike. It proves nothing, so it is not treated as proof.
        return self::UNKNOWN;
    }
}
