<?php

declare(strict_types=1);

namespace App\Officials;

use App\Chapters\CampusPoint;
use App\Chapters\States;
use RuntimeException;

/**
 * The legislators who represent a particular campus.
 *
 * Two datasets, both published and both citable: state legislators from the
 * Open States bulk export, and the congressional delegation from the
 * unitedstates/congress-legislators project. Every record keeps the source it
 * came from, so any address on a chapter page can be traced back.
 *
 * Nothing here is inferred. A member with no published address is returned with
 * a null email rather than a guess at the chamber's usual pattern, because a
 * plausible wrong address wastes the one message a student sends.
 *
 * Members of Congress do not publish mailboxes at all; they take mail through a
 * web form, so those records carry a form URL instead and the page has to offer
 * them differently.
 */
final class LegislatorDirectory
{
    public function __construct(
        private readonly string $dataPath,
        private readonly DistrictLookup $districts,
    ) {}

    /**
     * Everyone who represents this point, ready to drop into the officials form.
     *
     * @return list<array<string, mixed>>
     */
    public function suggestFor(CampusPoint $point, string $stateCode): array
    {
        $found = $this->districts->for($point);

        // The Census knows which state a coordinate is in; trust it over the
        // form, since a creator can pick a campus just across a state line.
        $state = $found['state'] ?? strtoupper($stateCode);
        $file = $this->load($state);

        if ($file === null) {
            return [];
        }

        $suggestions = [];

        foreach ([
            ['upper', $found['upper'], $file['upperTitle'] ?? 'State senator', 'state-senator'],
            ['lower', $found['lower'], $file['lowerTitle'] ?? 'State representative', 'state-rep'],
        ] as [$chamber, $district, $title, $role]) {
            if ($district === null) {
                continue;
            }

            foreach ($this->membersFor($file, $chamber, $district) as $member) {
                // A named district reads badly as "District 2nd Suffolk".
                $label = ctype_digit($district) ? "{$title}, District {$district}" : "{$title}, {$district}";
                $suggestions[] = $this->row($member, $label, $role);
            }
        }

        // Everyone elected at large represents this campus too, and in a
        // council like the District's they are most of the body.
        foreach (['At-Large', 'Chairman'] as $seat) {
            foreach ($file['upper'][$seat] ?? [] as $member) {
                $suggestions[] = $this->row($member, $seat, 'city-council');
            }
        }

        foreach ($file['federalSenate'] ?? [] as $member) {
            $suggestions[] = $this->row($member, 'United States Senator for '.States::name($state), 'us-senate');
        }

        if ($found['congress'] !== null) {
            foreach ($file['federalHouse'][$found['congress']] ?? [] as $member) {
                $suggestions[] = $this->row(
                    $member,
                    "United States Representative, {$state}-".str_pad($found['congress'], 2, '0', STR_PAD_LEFT),
                    'us-house',
                );
            }
        }

        return $suggestions;
    }

    /**
     * The members sitting for one district.
     *
     * The District of Columbia numbers its council seats as wards, and the
     * Census reports the ward number bare, so "2" has to find "Ward 2".
     *
     * @param  array<string, mixed>  $file
     * @return array<int, array<string, mixed>>
     */
    private function membersFor(array $file, string $chamber, string $district): array
    {
        foreach ([$district, "Ward {$district}", "District {$district}"] as $key) {
            if (isset($file[$chamber][$key])) {
                return $file[$chamber][$key];
            }
        }

        return [];
    }

    /**
     * @param  array<string, mixed>  $member
     * @return array<string, mixed>
     */
    private function row(array $member, string $title, string $role): array
    {
        return [
            'name' => (string) ($member['name'] ?? ''),
            'title' => $title,
            'email' => $member['email'] ?? null,
            // Only ever a published official page or contact form.
            'url' => $member['contactForm'] ?? $member['url'] ?? null,
            'role' => $role,
            'party' => $member['party'] ?? null,
        ];
    }

    /** @return array<string, mixed>|null */
    private function load(string $stateCode): ?array
    {
        $code = strtoupper(trim($stateCode));

        // Allowlisted before it becomes a filename, like every other path here.
        if (preg_match('/\A[A-Z]{2}\z/', $code) !== 1) {
            return null;
        }

        $file = rtrim($this->dataPath, '/').'/legislators/'.$code.'.json';

        if (! is_file($file)) {
            return null;
        }

        $decoded = json_decode((string) file_get_contents($file), true);

        if (! is_array($decoded)) {
            throw new RuntimeException("The legislator file for {$code} is not valid JSON.");
        }

        return $decoded;
    }
}
