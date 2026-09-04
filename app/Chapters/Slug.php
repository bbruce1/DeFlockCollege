<?php

declare(strict_types=1);

namespace App\Chapters;

use InvalidArgumentException;

/**
 * A chapter's identifier, which becomes both a URL segment and a filename.
 *
 * Path traversal is the sharp edge here, so this is an allowlist rather than an
 * escape: a value either matches [a-z0-9-] within the length bounds or it is
 * rejected. Separators, dots, and absolute paths are impossible by construction.
 * See security.md.
 */
final readonly class Slug
{
    /** 2 to 32 characters, alphanumeric at both ends, hyphens allowed inside. */
    private const PATTERN = '/^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$/';

    /**
     * Names that would collide with a route, a subdomain, or infrastructure.
     * Adding a route means adding it here.
     */
    private const RESERVED = [
        'www', 'api', 'admin', 'mail', 'email', 'smtp', 'mx', 'ns', 'ns1', 'ns2',
        'static', 'assets', 'cdn', 'img', 'images', 'media', 'files', 'download',
        'app', 'dev', 'staging', 'test', 'preview', 'beta', 'demo', 'docs', 'blog',
        'help', 'support', 'status', 'about', 'legal', 'privacy', 'terms', 'press',
        'chapters', 'chapter', 'start', 'new', 'create', 'edit', 'verify', 'claim',
        'map', 'maps', 'sitemap', 'robots', 'feed', 'rss', 'schools', 'school',
        'login', 'signin', 'signup', 'account', 'auth', 'oauth', 'deflock', 'storage',
    ];

    private function __construct(public string $value) {}

    public static function fromString(string $raw): self
    {
        $value = strtolower(trim($raw));

        if (! preg_match(self::PATTERN, $value)) {
            throw new InvalidArgumentException(
                'An address may only use lowercase letters, numbers and hyphens, must '
                .'start and end with a letter or number, and must be between 2 and 32 '
                ."characters. Received: {$raw}"
            );
        }

        if (in_array($value, self::RESERVED, true)) {
            throw new InvalidArgumentException("\"{$value}\" is reserved and cannot be used.");
        }

        return new self($value);
    }

    /** True when the value is usable, without throwing. */
    public static function isValid(string $raw): bool
    {
        try {
            self::fromString($raw);

            return true;
        } catch (InvalidArgumentException) {
            return false;
        }
    }

    /**
     * Suggests a slug from a school name or domain. The result still has to pass
     * fromString, so a suggestion is never trusted on its own.
     */
    public static function suggestFrom(string $source): string
    {
        $base = strtolower($source);
        $base = preg_replace('/\.(edu|org|ac\.uk|com|net)$/', '', $base) ?? $base;
        $base = preg_replace('/[^a-z0-9]+/', '-', $base) ?? $base;
        $base = trim($base, '-');

        return substr($base, 0, 32);
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
