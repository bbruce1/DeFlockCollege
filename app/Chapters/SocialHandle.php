<?php

declare(strict_types=1);

namespace App\Chapters;

use InvalidArgumentException;

/**
 * A social account handle, as typed by a creator.
 *
 * Accepts what people actually paste (a full profile URL, a leading @) and
 * reduces it to a bare handle on a per-platform character allowlist. Rendered as
 * text, never as markup, so it cannot carry anything into the page.
 */
final class SocialHandle
{
    /**
     * `\A` and `\z` rather than `^` and `$`. The value is trimmed on the way in
     * but the transformations below run afterwards, so stripping a trailing
     * slash or a query string can re-expose a newline at the end — and `$` would
     * treat that as the end of the subject and let it through the allowlist.
     */
    private const PATTERNS = [
        'instagram' => '/\A[A-Za-z0-9._]{1,30}\z/',
        'tiktok' => '/\A[A-Za-z0-9._]{1,24}\z/',
    ];

    public static function normalise(?string $raw, string $platform): ?string
    {
        $value = trim((string) $raw);

        if ($value === '') {
            return null;
        }

        // Strip what people paste: a profile URL, a leading @, a trailing slash.
        $value = preg_replace('#^https?://(www\.)?(instagram|tiktok)\.com/#i', '', $value) ?? $value;
        $value = ltrim($value, '@');
        $value = rtrim($value, '/');
        $value = explode('?', $value)[0];

        $pattern = self::PATTERNS[$platform] ?? null;

        if ($pattern === null) {
            throw new InvalidArgumentException("Unknown platform: {$platform}");
        }

        if (! preg_match($pattern, $value)) {
            throw new InvalidArgumentException(
                ucfirst($platform).' handles are letters, numbers, dots and underscores only.'
            );
        }

        return $value;
    }
}
