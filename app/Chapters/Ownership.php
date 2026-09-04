<?php

declare(strict_types=1);

namespace App\Chapters;

use Illuminate\Support\Facades\Config;
use RuntimeException;

/**
 * Who owns a chapter, in a form that cannot be reversed.
 *
 * NOT a bare hash. Email addresses are low entropy and enumerable, so
 * sha256("bob@gatech.edu") in a public file would leak exactly what it was meant
 * to protect: anyone could test a guess in microseconds. The record is an HMAC
 * keyed with the application secret, so without the key a guess cannot even be
 * checked. See security.md.
 *
 * Rotating APP_KEY invalidates every ownership record, which is why that is a
 * deliberate operation and not routine hygiene.
 */
final class Ownership
{
    /**
     * Derives the stored record for an address.
     *
     * Normalised first so "Baker@GaTech.edu" and "baker@gatech.edu" are the same
     * owner. Only case and surrounding space are normalised: the local part is
     * otherwise left alone, because provider-specific rules like dot-folding are
     * not ours to assume.
     */
    public static function record(string $email): string
    {
        return hash_hmac('sha256', self::normalise($email), self::key());
    }

    /** Constant time, so a wrong address cannot be narrowed by measuring. */
    public static function matches(string $stored, string $email): bool
    {
        return hash_equals($stored, self::record($email));
    }

    public static function normalise(string $email): string
    {
        return strtolower(trim($email));
    }

    private static function key(): string
    {
        $key = Config::string('app.key');

        if ($key === '') {
            throw new RuntimeException(
                'APP_KEY is not set, so ownership records cannot be derived. Run '
                .'php artisan key:generate.'
            );
        }

        return $key;
    }
}
