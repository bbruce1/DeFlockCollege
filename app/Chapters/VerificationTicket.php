<?php

declare(strict_types=1);

namespace App\Chapters;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use RuntimeException;

/**
 * Proof that somebody controls a school email address, carried in the request
 * rather than stored.
 *
 * There is no session and no token table. The ticket is an encrypted,
 * authenticated payload (AES-GCM under APP_KEY) holding the address, its domain,
 * and an expiry. It rides the verification link into the create flow and is
 * re-checked on every step that writes anything, so the proof travels with the
 * user instead of being looked up.
 *
 * Encrypted rather than merely signed because the payload contains an email
 * address, and a signed-but-readable token would put that address in a URL, in
 * browser history, and in any referrer header the page leaks.
 */
final readonly class VerificationTicket
{
    /** Long enough to finish framing a campus, short enough to limit replay. */
    public const LIFETIME_MINUTES = 60;

    private function __construct(
        public string $email,
        public SchoolDomain $domain,
        public int $expiresAt,
        public string $purpose,
    ) {}

    /**
     * @param  string  $purpose  'create' or 'edit'. A ticket minted to edit one
     *                           chapter cannot be replayed to create another.
     */
    public static function issue(string $email, string $purpose = 'create'): self
    {
        return new self(
            email: Ownership::normalise($email),
            domain: SchoolDomain::fromEmail($email),
            expiresAt: time() + self::LIFETIME_MINUTES * 60,
            purpose: $purpose,
        );
    }

    public function toToken(): string
    {
        return Crypt::encryptString(json_encode([
            'e' => $this->email,
            'd' => $this->domain->registrable,
            'x' => $this->expiresAt,
            'p' => $this->purpose,
        ], JSON_THROW_ON_ERROR));
    }

    /**
     * @throws RuntimeException when the token is forged, corrupt, or expired
     */
    public static function fromToken(string $token, string $expectedPurpose = 'create'): self
    {
        try {
            $decoded = json_decode(Crypt::decryptString($token), true, 512, JSON_THROW_ON_ERROR);
        } catch (DecryptException|\JsonException) {
            // Deliberately vague: distinguishing "forged" from "corrupt" tells an
            // attacker which half of the token to keep working on.
            throw new RuntimeException('That link is not valid. Ask for a new one.');
        }

        if (! is_array($decoded) || ! isset($decoded['e'], $decoded['d'], $decoded['x'], $decoded['p'])) {
            throw new RuntimeException('That link is not valid. Ask for a new one.');
        }

        if ((int) $decoded['x'] < time()) {
            throw new RuntimeException(
                'That link has expired. They last an hour, so ask for a fresh one.'
            );
        }

        if (! hash_equals((string) $decoded['p'], $expectedPurpose)) {
            throw new RuntimeException('That link cannot be used here. Ask for a new one.');
        }

        $ticket = new self(
            email: (string) $decoded['e'],
            domain: SchoolDomain::fromEmail((string) $decoded['e']),
            expiresAt: (int) $decoded['x'],
            purpose: (string) $decoded['p'],
        );

        // The domain is recomputed from the address rather than trusted from the
        // payload, so a tampered pairing cannot survive even if encryption failed.
        if (! hash_equals($ticket->domain->registrable, (string) $decoded['d'])) {
            throw new RuntimeException('That link is not valid. Ask for a new one.');
        }

        return $ticket;
    }

    public function minutesRemaining(): int
    {
        return max(0, (int) ceil(($this->expiresAt - time()) / 60));
    }
}
