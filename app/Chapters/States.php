<?php

declare(strict_types=1);

namespace App\Chapters;

/**
 * US states, in both directions.
 *
 * Pages say "9,772 in Georgia" rather than "in GA", the creation form needs a
 * list to choose from, and the geocoder hands back a name where the survey
 * needs a code.
 */
final class States
{
    private const NAMES = [
        'AL' => 'Alabama', 'AK' => 'Alaska', 'AZ' => 'Arizona', 'AR' => 'Arkansas',
        'CA' => 'California', 'CO' => 'Colorado', 'CT' => 'Connecticut', 'DE' => 'Delaware',
        'DC' => 'District of Columbia', 'FL' => 'Florida', 'GA' => 'Georgia', 'HI' => 'Hawaii',
        'ID' => 'Idaho', 'IL' => 'Illinois', 'IN' => 'Indiana', 'IA' => 'Iowa',
        'KS' => 'Kansas', 'KY' => 'Kentucky', 'LA' => 'Louisiana', 'ME' => 'Maine',
        'MD' => 'Maryland', 'MA' => 'Massachusetts', 'MI' => 'Michigan', 'MN' => 'Minnesota',
        'MS' => 'Mississippi', 'MO' => 'Missouri', 'MT' => 'Montana', 'NE' => 'Nebraska',
        'NV' => 'Nevada', 'NH' => 'New Hampshire', 'NJ' => 'New Jersey', 'NM' => 'New Mexico',
        'NY' => 'New York', 'NC' => 'North Carolina', 'ND' => 'North Dakota', 'OH' => 'Ohio',
        'OK' => 'Oklahoma', 'OR' => 'Oregon', 'PA' => 'Pennsylvania', 'RI' => 'Rhode Island',
        'SC' => 'South Carolina', 'SD' => 'South Dakota', 'TN' => 'Tennessee', 'TX' => 'Texas',
        'UT' => 'Utah', 'VT' => 'Vermont', 'VA' => 'Virginia', 'WA' => 'Washington',
        'WV' => 'West Virginia', 'WI' => 'Wisconsin', 'WY' => 'Wyoming',
    ];

    public static function name(string $code): string
    {
        return self::NAMES[strtoupper($code)] ?? $code;
    }

    /** Null rather than a guess: an unrecognised name must not become a wrong state. */
    public static function code(string $name): ?string
    {
        $found = array_search(trim($name), self::NAMES, true);

        return $found === false ? null : $found;
    }

    public static function exists(string $code): bool
    {
        return isset(self::NAMES[strtoupper($code)]);
    }

    /** @return list<string> every state code we recognise. */
    public static function codes(): array
    {
        return array_keys(self::NAMES);
    }

    /** @return list<array{code: string, name: string}> for the creation form. */
    public static function options(): array
    {
        $options = [];

        foreach (self::NAMES as $code => $name) {
            $options[] = ['code' => $code, 'name' => $name];
        }

        return $options;
    }
}
