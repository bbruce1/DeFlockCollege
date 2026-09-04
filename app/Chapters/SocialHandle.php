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
    private const PATTERNS = [
        'instagram' => '/^[A-Za-z0-9._]{1,30}$/',
        'tiktok' => '/^[A-Za-z0-9._]{1,24}$/',
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
