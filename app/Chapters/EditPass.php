<?php

declare(strict_types=1);

namespace App\Chapters;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use RuntimeException;

/**
 * Proof that somebody holds a chapter's edit key, carried in the request.
 *
 * The sibling of VerificationTicket, for the other way of proving ownership.
 * That one binds to an email address; this one binds to a single chapter, since
 * holding the key says nothing about who you are — only which chapter you can
 * edit.
 *
 * Encrypted and authenticated under APP_KEY, with an expiry inside, so it
 * cannot be forged, cannot be edited to name a different chapter, and stops
 * working on its own. Nothing is stored: there is still no session.
 */
final readonly class EditPass
{
    /** Short: it exists only to carry one editing sitting. */
    public const LIFETIME_MINUTES = 60;

    private const PURPOSE = 'edit-key';

    private function __construct(
        public string $slug,
        public int $expiresAt,
    ) {}

    public static function issue(string $slug): self
    {
        // Validated here too, so a pass can never name a path-shaped chapter.
        return new self(Slug::fromString($slug)->value, time() + self::LIFETIME_MINUTES * 60);
    }

    public function toToken(): string
    {
        return Crypt::encryptString(json_encode([
            's' => $this->slug,
            'x' => $this->expiresAt,
            'p' => self::PURPOSE,
        ], JSON_THROW_ON_ERROR));
    }

    /**
     * @throws RuntimeException when the token is forged, corrupt, expired, or
     *                          names a chapter other than the one being edited
     */
    public static function fromToken(string $token, string $expectedSlug): self
    {
        try {
            $decoded = json_decode(Crypt::decryptString($token), true, 512, JSON_THROW_ON_ERROR);
        } catch (DecryptException|\JsonException) {
            throw new RuntimeException('That editing session is not valid. Enter your key again.');
        }

        if (! is_array($decoded) || ! isset($decoded['s'], $decoded['x'], $decoded['p'])) {
            throw new RuntimeException('That editing session is not valid. Enter your key again.');
        }

        if (! hash_equals((string) $decoded['p'], self::PURPOSE)) {
            throw new RuntimeException('That token cannot be used here.');
        }

        if ((int) $decoded['x'] < time()) {
            throw new RuntimeException('That editing session has expired. Enter your key again.');
        }

        // A pass for one chapter must never edit another.
        if (! hash_equals((string) $decoded['s'], $expectedSlug)) {
            throw new RuntimeException('That editing session belongs to a different chapter.');
        }

        return new self((string) $decoded['s'], (int) $decoded['x']);
    }

    public function minutesRemaining(): int
    {
        return max(0, (int) ceil(($this->expiresAt - time()) / 60));
    }
}
