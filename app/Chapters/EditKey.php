<?php

declare(strict_types=1);

namespace App\Chapters;

use Illuminate\Support\Facades\Hash;
use Random\RandomException;

/**
 * The key a creator uses to edit their chapter.
 *
 * Generated for them rather than chosen, so it is high entropy by construction
 * and there is no weak password to guess. It is shown exactly once, at
 * creation, and only its hash is ever written down.
 *
 * Hashed with bcrypt rather than a bare SHA. A plain digest of a credential is
 * verified in microseconds, which is precisely what an attacker with the file
 * wants; bcrypt is deliberately slow and costs us nothing at one check per
 * edit.
 */
final class EditKey
{
    /** No I, O, 0 or 1: these get written on paper and typed back in. */
    private const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    private const GROUPS = 4;

    private const GROUP_LENGTH = 5;

    /**
     * A fresh key, in the form ABCDE-FGHJK-LMNPQ-RSTUV.
     *
     * Twenty characters from a 32-symbol alphabet is 100 bits, which is far
     * past anything that can be guessed against a rate-limited endpoint.
     *
     * @throws RandomException when the system has no secure randomness
     */
    public static function generate(): string
    {
        $groups = [];

        for ($group = 0; $group < self::GROUPS; $group++) {
            $chars = '';

            for ($i = 0; $i < self::GROUP_LENGTH; $i++) {
                $chars .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }

            $groups[] = $chars;
        }

        return implode('-', $groups);
    }

    public static function hash(string $key): string
    {
        return Hash::make(self::normalise($key));
    }

    /** Constant-time by way of bcrypt's own comparison. */
    public static function matches(string $storedHash, string $candidate): bool
    {
        if ($storedHash === '' || $candidate === '') {
            return false;
        }

        return Hash::check(self::normalise($candidate), $storedHash);
    }

    /**
     * Typed keys arrive with stray spaces, lowercase, and missing hyphens.
     * None of that should cost somebody their chapter.
     */
    private static function normalise(string $key): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $key) ?? '');
    }
}
