<?php

declare(strict_types=1);

namespace App\Officials;

use InvalidArgumentException;

/**
 * Validates an office a creator typed in.
 *
 * The address ends up in a mailto link on a public page, so it is checked as an
 * email and rejected outright if it carries anything that could break out of
 * the header it lands in. Names and titles are rendered as text by React and
 * never as markup.
 */
final class OfficialInput
{
    private const MAX_NAME = 120;

    private const MAX_TITLE = 140;

    private const MAX_PER_CHAPTER = 6;

    /**
     * The address is interpolated into `mailto:{address}?subject=...&body=...`
     * on the page, so being a valid email is not enough on its own: `?`, `&`,
     * `#`, `%` and `/` all change where that URL's query begins, and
     * `rep?bcc=harvest@example.com` is an address PHP accepts that would append
     * a Bcc to a letter the reader thinks is going to one office. Characters
     * that only appear inside a quoted local part (`"`, `<`, `>`, `,`, `;`,
     * space) are excluded for the same reason.
     *
     * `\A` and `\z` rather than `^` and `$`: the latter would accept a trailing
     * newline.
     */
    private const MAILTO_SAFE = '/\A[A-Za-z0-9!$\'*+=^_`{|}~.-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+\z/';

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return list<array{name: string, title: string, email: string|null, url: string|null, scope: string}>
     */
    public static function sanitiseAll(array $rows): array
    {
        $clean = [];

        foreach (array_slice($rows, 0, self::MAX_PER_CHAPTER) as $row) {
            $official = self::sanitise(is_array($row) ? $row : []);

            if ($official !== null) {
                $clean[] = $official;
            }
        }

        return $clean;
    }

    /** @param  array<string, mixed>  $row */
    private static function sanitise(array $row): ?array
    {
        $name = self::text($row['name'] ?? '', self::MAX_NAME);
        $title = self::text($row['title'] ?? '', self::MAX_TITLE);

        // A row with no name is an empty slot in the form, not an error.
        if ($name === '') {
            return null;
        }

        $email = self::email($row['email'] ?? null);
        $url = self::url($row['url'] ?? null);

        /*
         * Somebody listed here must be reachable, or their button opens an
         * empty draft and the reader gives up on the page.
         *
         * A form URL counts, because members of Congress publish no address at
         * all and take mail through a web form. Everyone else needs an email.
         */
        if ($email === null && $url === null) {
            throw new InvalidArgumentException(
                "{$name} needs an email address. Without one there is nothing for a "
                .'reader to send, and the button on your page would open an empty message.'
            );
        }

        return [
            'name' => $name,
            'title' => $title,
            'email' => $email,
            'url' => $url,
            // Closed list, so an unknown value becomes "other" rather than
            // reaching a page as typed.
            'role' => OfficialRole::normalise((string) ($row['role'] ?? '')),
            'scope' => 'chapter',
        ];
    }

    private static function text(mixed $value, int $max): string
    {
        // Control characters are stripped rather than escaped: none of them
        // belong in a person's name, and a newline in one reaches a mail header.
        $text = preg_replace('/[[:cntrl:]]+/u', ' ', (string) $value) ?? '';

        return mb_substr(trim(preg_replace('/\s+/u', ' ', $text) ?? ''), 0, $max);
    }

    private static function email(mixed $value): ?string
    {
        $email = trim((string) $value);

        if ($email === '') {
            return null;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)
            || preg_match('/[[:cntrl:]]/', $email)
            || preg_match(self::MAILTO_SAFE, $email) !== 1
        ) {
            throw new InvalidArgumentException(
                "\"{$email}\" is not a usable email address for an official."
            );
        }

        return mb_strtolower($email);
    }

    private static function url(mixed $value): ?string
    {
        $url = trim((string) $value);

        if ($url === '') {
            return null;
        }

        if (! filter_var($url, FILTER_VALIDATE_URL) || ! str_starts_with($url, 'https://')) {
            throw new InvalidArgumentException(
                'An official\'s link must be a full https:// address.'
            );
        }

        return $url;
    }
}
