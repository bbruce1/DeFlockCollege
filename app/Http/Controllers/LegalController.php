<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * About, contact, terms, and privacy.
 *
 * Static pages with no data behind them, which is itself the point of the
 * privacy one: there is nothing to describe holding because almost nothing is
 * held.
 */
final class LegalController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('Legal/About');
    }

    public function contact(): Response
    {
        return Inertia::render('Legal/Contact', [
            'email' => self::contactAddress(),
        ]);
    }

    public function terms(): Response
    {
        return Inertia::render('Legal/Terms', [
            'updated' => self::UPDATED,
            'contact' => self::contactAddress(),
            'operator' => self::operator(),
            'jurisdiction' => self::jurisdiction(),
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('Legal/Privacy', [
            'updated' => self::UPDATED,
            'contact' => self::contactAddress(),
            'operator' => self::operator(),
        ]);
    }

    /** Every page here names a reachable address; an unreachable one is worse than none. */
    private static function contactAddress(): string
    {
        return (string) (config('mail.reply_to.address')
            ?: config('mail.from.address')
            ?: 'the address on the about page');
    }

    private static function operator(): string
    {
        return (string) config('legal.operator');
    }

    private static function jurisdiction(): string
    {
        return (string) config('legal.jurisdiction');
    }

    /** Bumped by hand when either document changes materially. */
    private const UPDATED = '9 September 2026';
}
