<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Site\PageMeta;
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
        return Inertia::render('Legal/About', [
            'meta' => self::meta(
                'About',
                'Starting a campus chapter against automated plate readers should cost one '
                    .'student and twenty minutes. What this is, and what it deliberately is not.',
                '/about',
            ),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Legal/Contact', [
            'email' => self::contactAddress(),
            'meta' => self::meta(
                'Contact',
                'One address, read by one person. For a chapter that has been abandoned, '
                    .'something wrong in the shipped data, or a page that should come down.',
                '/contact',
            ),
        ]);
    }

    public function terms(): Response
    {
        return Inertia::render('Legal/Terms', [
            'meta' => self::meta('Terms', 'The terms this site is used under.', '/terms'),
            'updated' => self::UPDATED,
            'contact' => self::contactAddress(),
            'operator' => self::operator(),
            'jurisdiction' => self::jurisdiction(),
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('Legal/Privacy', [
            'meta' => self::meta(
                'Privacy',
                'What is kept, which is almost nothing: no accounts, no passwords, and no '
                    .'record of who reads a page.',
                '/privacy',
            ),
            'updated' => self::UPDATED,
            'contact' => self::contactAddress(),
            'operator' => self::operator(),
        ]);
    }

    /** @return array<string, mixed> */
    private static function meta(string $title, string $description, string $path): array
    {
        return PageMeta::make(
            title: $title.' · '.PageMeta::SITE_NAME,
            description: $description,
            path: $path,
        )->toArray();
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
