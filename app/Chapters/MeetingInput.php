<?php

declare(strict_types=1);

namespace App\Chapters;

use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Validates the meetings a creator types in.
 *
 * A meeting is the one thing on a chapter page that goes stale on its own, so
 * the date is parsed rather than stored as typed: a page that still advertises
 * last month's meeting is worse than one that advertises none.
 */
final class MeetingInput
{
    private const MAX_PER_CHAPTER = 8;

    private const MAX_PLACE = 140;

    private const MAX_NOTE = 200;

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return list<array{date: string, time: string|null, place: string, note: string}>
     */
    public static function sanitiseAll(array $rows): array
    {
        $clean = [];

        foreach (array_slice($rows, 0, self::MAX_PER_CHAPTER) as $row) {
            $meeting = self::sanitise(is_array($row) ? $row : []);

            if ($meeting !== null) {
                $clean[] = $meeting;
            }
        }

        // Soonest first, so the page never has to sort them itself.
        usort($clean, static fn (array $a, array $b): int => strcmp(
            $a['date'].($a['time'] ?? ''),
            $b['date'].($b['time'] ?? ''),
        ));

        return $clean;
    }

    /** @param  array<string, mixed>  $row */
    private static function sanitise(array $row): ?array
    {
        $date = trim((string) ($row['date'] ?? ''));

        // An empty row is a blank slot in the form, not an error.
        if ($date === '') {
            return null;
        }

        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);

        if ($parsed === false || $parsed->format('Y-m-d') !== $date) {
            throw new InvalidArgumentException(
                "\"{$date}\" is not a date this understands. Use the date picker."
            );
        }

        return [
            'date' => $date,
            'time' => self::time($row['time'] ?? null),
            'place' => self::text($row['place'] ?? '', self::MAX_PLACE),
            'note' => self::text($row['note'] ?? '', self::MAX_NOTE),
        ];
    }

    private static function time(mixed $value): ?string
    {
        $time = trim((string) $value);

        if ($time === '') {
            return null;
        }

        if (preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $time) !== 1) {
            throw new InvalidArgumentException(
                "\"{$time}\" is not a time this understands. Use 24-hour HH:MM."
            );
        }

        return $time;
    }

    private static function text(mixed $value, int $max): string
    {
        // Control characters are stripped rather than escaped: none of them
        // belong in a room number, and they are rendered straight onto a page.
        $text = preg_replace('/[[:cntrl:]]+/u', ' ', (string) $value) ?? '';

        return mb_substr(trim(preg_replace('/\s+/u', ' ', $text) ?? ''), 0, $max);
    }
}
