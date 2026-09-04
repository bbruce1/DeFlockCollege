<?php

declare(strict_types=1);

namespace App\Chapters\Sections;

use App\Chapters\Chapter;

/**
 * Composes a chapter page.
 *
 * FIXED SPINE, which no seed may touch:
 *
 *   1. Hero          identical wording on every chapter in the network
 *   2. Officials     the offices that can remove the readers
 *   3. Instagram     immediately after, always
 *   ...              seeded sections, and only here
 *   4. No vandalism  always
 *   5. Not affiliated always
 *
 * The hero never varies because recognition is the growth mechanism: a student
 * who has seen one chapter should know the next one instantly.
 *
 * Below it, widgets are drawn before prose. A count is abstract; a dial showing
 * that two thirds of the horizon is covered by outward-facing cameras is the
 * same fact made visible. A section is only offered when it is TRUE of that
 * campus, so variation says something real rather than decorating.
 */
final class SectionLibrary
{
    private const WIDGETS_PER_PAGE = 3;

    private const PROSE_PER_PAGE = 2;

    /** Below this share, calling one vendor dominant would be a stretch. */
    private const VENDOR_MAJORITY = 0.4;

    private const DENSE_RING = 25;

    /** @return array<int, array<string, mixed>> */
    public function for(Chapter $chapter): array
    {
        $seed = crc32($chapter->slug);
        $widgets = $this->pick($this->widgets($chapter), $seed, self::WIDGETS_PER_PAGE);
        $prose = $this->pick($this->prose($chapter), $seed ^ 0x5f5f, self::PROSE_PER_PAGE);

        // Interleave, so the page alternates between showing and saying rather
        // than front-loading everything interactive.
        $woven = [];
        $count = max(count($widgets), count($prose));

        for ($i = 0; $i < $count; $i++) {
            if (isset($widgets[$i])) {
                $woven[] = $widgets[$i];
            }

            if (isset($prose[$i])) {
                $woven[] = $prose[$i];
            }
        }

        return $woven;
    }

    /** Data-bearing sections. Each is gated on having the data to say anything. */
    private function widgets(Chapter $chapter): array
    {
        $map = $chapter->map;
        $sections = [];

        if ($map->readersWithBearing() >= 6) {
            $sections[] = [
                'id' => 'coverage-dial',
                'kind' => 'widget',
                'label' => 'Every way out',
                'headline' => 'There is no direction off campus that is not <em>watched</em>.',
                'body' => 'Each reader records the compass bearing it faces. Filled in, they '
                    ."cover this much of the horizon around {$chapter->shortName}.",
                'data' => ['coverage' => round($map->horizonCoverage(), 4)],
            ];
        }

        if ($map->readersInState > $map->readersWithinMile && $map->readersInState > 0) {
            $sections[] = [
                'id' => 'scale-bar',
                'kind' => 'widget',
                'label' => 'Not just here',
                'headline' => 'Your campus is a <em>rounding error</em>.',
                'body' => 'The ring around this campus is the part you can see. It is a '
                    .'fraction of what is already installed across the state, which is why '
                    .'this ends at the legislature rather than at the campus gate.',
                'data' => [
                    'here' => $map->readersWithinMile,
                    'state' => $map->readersInState,
                ],
            ];
        }

        if (count($map->readers) >= 4) {
            $sections[] = [
                'id' => 'reader-map',
                'kind' => 'widget',
                'label' => 'Count them yourself',
                'headline' => 'Every square is a <em>camera</em>.',
                'body' => 'The streets removed, the readers left. Hover one to see which way '
                    .'it points and who made it.',
                'data' => ['readers' => $map->readers, 'aspect' => $map->aspect],
            ];
        }

        $share = $map->readersWithinMile > 0 ? $map->flockCount / $map->readersWithinMile : 0;

        if ($map->flockCount > 0 && $share >= self::VENDOR_MAJORITY) {
            $sections[] = [
                'id' => 'vendor-split',
                'kind' => 'widget',
                'label' => 'One contract',
                'headline' => "{$map->flockCount} of them answer to <em>one company</em>.",
                'body' => 'A single vendor means a single contract, and a contract is a thing '
                    .'a council can decline to renew. That is the most winnable version of this.',
                'data' => [
                    'flock' => $map->flockCount,
                    'other' => max($map->readersWithinMile - $map->flockCount, 0),
                ],
            ];
        }

        $previous = $map->previous;

        if (is_array($previous) && ($previous['readersWithinMile'] ?? null) !== null
            && (int) $previous['readersWithinMile'] !== $map->readersWithinMile) {
            $before = (int) $previous['readersWithinMile'];
            $rising = $map->readersWithinMile > $before;

            $sections[] = [
                'id' => 'delta',
                'kind' => 'widget',
                'label' => 'Since last checked',
                'headline' => $rising
                    ? ($map->readersWithinMile - $before).' more appeared while nobody was <em>counting</em>.'
                    : ($before - $map->readersWithinMile).' came <em>down</em>.',
                'body' => 'Checked against OpenStreetMap. Last count '
                    .($previous['generatedAt'] ?? 'unknown').", this one {$map->generatedAt}.",
                'data' => ['from' => $before, 'to' => $map->readersWithinMile],
            ];
        }

        return $sections;
    }

    /** Connective tissue. Deliberately few: the page shows before it tells. */
    private function prose(Chapter $chapter): array
    {
        $map = $chapter->map;

        $all = [
            [
                'id' => 'watches-everyone',
                'treatment' => 'centered',
                'label' => 'What it does',
                'headline' => 'It does not watch suspects. It watches <em>everyone</em>.',
                'body' => "Every one of the {$map->readersWithinMile} photographs each passing "
                    .'car and logs its plate, time, and location.',
                'applies' => $map->readersWithinMile > 0,
            ],
            [
                'id' => 'no-warrant',
                'treatment' => 'split',
                'label' => 'Nobody asked',
                'headline' => 'No warrant. No suspicion. No <em>notice</em>.',
                'body' => 'Nobody asked whether these should be here, and nobody told you when '
                    .'they arrived.',
                'applies' => true,
            ],
            [
                'id' => 'policy-not-physics',
                'treatment' => 'split',
                'label' => 'Somebody decides',
                'headline' => 'How long it is kept is <em>policy</em>, not physics.',
                'body' => 'Which is another way of saying somebody decides, and that somebody '
                    .'has an email address.',
                'applies' => true,
            ],
            [
                'id' => 'dense-ring',
                'treatment' => 'banner',
                'label' => 'Within one mile',
                'headline' => 'You cannot drive to class without being <em>recorded</em>.',
                'body' => "{$map->readersWithinMile} readers inside one mile is not a perimeter "
                    .'with gaps. It is a net.',
                'applies' => $map->readersWithinMile >= self::DENSE_RING,
            ],
            [
                'id' => 'removal-not-audit',
                'treatment' => 'split',
                'label' => 'The ask',
                'headline' => 'Removal. Not an <em>audit</em>.',
                'body' => 'Retention limits and transparency reports are the terms of being '
                    .'watched. Asking for them concedes that the watching continues.',
                'applies' => true,
            ],
            [
                'id' => 'mission-creep',
                'treatment' => 'centered',
                'label' => 'What it becomes',
                'headline' => 'It was sold for stolen cars. It does not <em>stay</em> there.',
                'body' => 'Every surveillance system arrives narrow and widens, because the data '
                    .'is already collected and somebody always has a new use for it.',
                'applies' => true,
            ],
            [
                'id' => 'constituent',
                'treatment' => 'split',
                'label' => 'Why it counts',
                'headline' => 'An office counts <em>constituents</em>, not signatures.',
                'body' => 'A petition with a thousand names is one item of correspondence. A '
                    .'hundred separate emails are a hundred.',
                'applies' => true,
            ],
            [
                'id' => 'before-you-decide',
                'treatment' => 'centered',
                'label' => 'No commitment',
                'headline' => 'You can act before you decide you are <em>involved</em>.',
                'body' => 'Joining something means deciding you are the kind of person who joins '
                    .'things. Pressing send does not.',
                'applies' => true,
            ],
            [
                'id' => 'sparse-floor',
                'treatment' => 'banner',
                'label' => 'A floor, not a count',
                'headline' => "{$map->readersWithinMile} is what has been <em>mapped</em>, not what exists.",
                'body' => 'OpenStreetMap coverage is volunteer work. If you can see one that is '
                    ."not on the map, adding it improves this page and DeFlock's at once.",
                'applies' => $map->readersWithinMile > 0 && $map->readersWithinMile < 10,
            ],
            [
                'id' => 'state-density',
                'treatment' => 'split',
                'label' => 'Why the next one matters',
                'headline' => 'One campus is a letter. Five in a state is a <em>problem</em>.',
                'body' => 'A representative hearing from students at one school can file it. '
                    .'Hearing from five schools cannot.',
                'applies' => $map->readersInState > 0,
            ],
        ];

        return array_values(array_filter($all, static fn (array $s): bool => $s['applies']));
    }

    /**
     * Deterministic selection, so a chapter looks the same on every load without
     * anything being stored.
     */
    private function pick(array $sections, int $seed, int $limit): array
    {
        if ($sections === []) {
            return [];
        }

        mt_srand($seed);
        shuffle($sections);
        mt_srand();

        return array_slice($sections, 0, $limit);
    }
}
