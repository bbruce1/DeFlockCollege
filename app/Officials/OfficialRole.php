<?php

declare(strict_types=1);

namespace App\Officials;

/**
 * What kind of office somebody holds.
 *
 * A letter to a sheriff and a letter to a city councilmember are not the same
 * letter, and a reader deciding who to write to needs to know which is which.
 * The list is closed so a page can group and label them; anything outside it
 * falls back to "other" rather than being rendered as typed.
 */
final class OfficialRole
{
    public const OTHER = 'other';

    private const LABELS = [
        'city-council' => 'City council',
        'mayor' => 'Mayor',
        'sheriff' => 'Sheriff',
        'police-chief' => 'Police chief',
        'campus-police' => 'Campus police',
        'campus-admin' => 'University administration',
        'state-rep' => 'State representative',
        'state-senator' => 'State senator',
        'us-house' => 'US representative',
        'us-senate' => 'US senator',
        'county' => 'County commission',
        self::OTHER => 'Other',
    ];

    public static function isValid(string $role): bool
    {
        return isset(self::LABELS[$role]);
    }

    public static function normalise(string $role): string
    {
        $role = strtolower(trim($role));

        return self::isValid($role) ? $role : self::OTHER;
    }

    public static function label(string $role): string
    {
        return self::LABELS[self::normalise($role)];
    }

    /** @return list<array{value: string, label: string}> for the edit form. */
    public static function options(): array
    {
        $options = [];

        foreach (self::LABELS as $value => $label) {
            $options[] = ['value' => $value, 'label' => $label];
        }

        return $options;
    }
}
