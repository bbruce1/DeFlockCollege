<?php

declare(strict_types=1);

namespace App\Officials;

use App\Chapters\Chapter;
use RuntimeException;

/**
 * The library of outreach letters, and which one each office receives.
 *
 * An office that hears from thirty students at one campus should read thirty
 * different letters, not the same paragraph thirty times, because identical
 * mail is the easiest thing in the world for a staffer to discount. Templates
 * are therefore rotated rather than picked once.
 *
 * Selection advances every time a page is rendered, so the next reader of a
 * chapter is handed a different letter than the last one. The chapter slug
 * offsets the whole sequence, so two campuses writing to the same county office
 * do not march through the library in step.
 *
 * Templates contain no campus detail of their own. Everything local arrives
 * through the placeholders below, which is what keeps a thousand letters honest:
 * there is nothing in them that could be false about a particular school.
 */
final class OutreachLibrary
{
    private const LIBRARY = 'emails/library.json';

    /** @var list<array{subject: string, body: string}>|null */
    private ?array $templates = null;

    /** The placeholders that can be unavailable at the time of writing. */
    private const NEARBY_COUNT_PLACEHOLDER = '{{readersWithinMile}}';

    private const STATE_COUNT_PLACEHOLDER = '{{readersInState}}';

    public function __construct(private readonly string $dataPath) {}

    /**
     * The letter this office gets, with placeholders filled in.
     *
     * @return array{subject: string, body: string}
     */
    public function letterFor(
        Chapter $chapter,
        Official $official,
        int $index,
        string $stateName,
        int $rotation = 0,
    ): array {
        // A chapter missing a figure is handed one of the letters that never
        // cites it. Filling the placeholder with a nought would put a made-up
        // number in a letter to a legislator, which is the one thing this
        // library must never do. Most of the library cites neither, so losing
        // both still leaves the great majority of it in rotation.
        $missing = [];

        if (! $chapter->survey->hasNearbyCount()) {
            $missing[] = self::NEARBY_COUNT_PLACEHOLDER;
        }

        if (! $chapter->survey->hasStateCount()) {
            $missing[] = self::STATE_COUNT_PLACEHOLDER;
        }

        $templates = $missing === [] ? $this->load() : $this->without($missing);

        if ($templates === []) {
            return $this->fallback($chapter, $official, $stateName);
        }

        $template = $templates[$this->indexFor($chapter->slug, $index, count($templates), $rotation)];

        return [
            'subject' => $this->fill($template['subject'], $chapter, $official, $stateName),
            'body' => $this->fill($template['body'], $chapter, $official, $stateName),
        ];
    }

    public function count(): int
    {
        return count($this->load());
    }

    /**
     * The letters that cite none of the given placeholders.
     *
     * @param  list<string>  $placeholders
     * @return list<array{subject: string, body: string}>
     */
    private function without(array $placeholders): array
    {
        return array_values(array_filter(
            $this->load(),
            static function (array $template) use ($placeholders): bool {
                $text = $template['subject'].$template['body'];

                foreach ($placeholders as $placeholder) {
                    if (str_contains($text, $placeholder)) {
                        return false;
                    }
                }

                return true;
            },
        ));
    }

    /**
     * FNV-1a over the slug, offset by the office's position.
     *
     * Stable for a given page, and spread across the library so two campuses
     * writing to the same office rarely collide.
     */
    private function indexFor(string $slug, int $position, int $total, int $rotation = 0): int
    {
        $hash = 0x811c9dc5;

        foreach (str_split($slug) as $character) {
            $hash ^= ord($character);
            $hash = ($hash * 0x01000193) & 0xffffffff;
        }

        // The rotation advances on every page render, so consecutive readers of
        // the same chapter are handed different letters. The slug still shifts
        // the whole sequence, so two campuses writing to one shared office do
        // not march through the library in step.
        return (int) (($hash + $position * 2_654_435_761 + $rotation * 7_919) % $total);
    }

    /** @param  array<string, mixed>  $template */
    private function fill(string $text, Chapter $chapter, Official $official, string $stateName): string
    {
        return strtr($text, [
            '{{officialName}}' => $official->name !== '' ? $official->name : 'Councilmember',
            '{{officialTitle}}' => $official->title,
            '{{role}}' => OfficialRole::label($official->role),
            '{{school}}' => $chapter->schoolName,
            '{{shortName}}' => $chapter->shortName,
            '{{city}}' => $chapter->city,
            '{{state}}' => $stateName,
            self::NEARBY_COUNT_PLACEHOLDER => $chapter->survey->hasNearbyCount()
                ? number_format((int) $chapter->survey->readersWithinMile)
                : '',
            self::STATE_COUNT_PLACEHOLDER => $chapter->survey->hasStateCount()
                ? number_format((int) $chapter->survey->readersInState)
                : '',
        ]);
    }

    /**
     * Used only when the library is absent, which means a broken deployment
     * rather than an empty dataset. Still a real letter, so a page is never
     * left with a button that opens nothing.
     *
     * @return array{subject: string, body: string}
     */
    private function fallback(Chapter $chapter, Official $official, string $stateName): array
    {
        $name = $official->name !== '' ? $official->name : 'Councilmember';

        // Each clause appears only if its figure is known. With neither, the
        // letter makes the argument without citing a count, which is still the
        // argument — a student writing about cameras on their own campus does
        // not need a survey to have standing.
        $statewide = $chapter->survey->hasStateCount()
            ? ', and '.number_format((int) $chapter->survey->readersInState)." across {$stateName}"
            : '';

        $evidence = $chapter->survey->hasNearbyCount()
            ? 'There are '.number_format((int) $chapter->survey->readersWithinMile)
                ." automated license plate readers mapped within a mile of campus{$statewide}. "
            : 'Automated license plate readers are being installed around campus. ';

        return [
            'subject' => "Automated license plate readers around {$chapter->shortName}",
            'body' => "Dear {$name},\n\n"
                ."I am a student at {$chapter->schoolName}. {$evidence}"
                ."They photograph every passing vehicle and keep that record whether or not anyone "
                ."is suspected of anything.\n\n"
                ."I am asking you to have the readers around campus removed, and to oppose new "
                ."installations.\n\n"
                .'Would you tell me where you stand on this?',
        ];
    }

    /** @return list<array{subject: string, body: string}> */
    private function load(): array
    {
        if ($this->templates !== null) {
            return $this->templates;
        }

        $file = rtrim($this->dataPath, '/').'/'.self::LIBRARY;

        if (! is_file($file)) {
            return $this->templates = [];
        }

        $decoded = json_decode((string) file_get_contents($file), true);

        if (! is_array($decoded)) {
            throw new RuntimeException("The outreach library at {$file} is not valid JSON.");
        }

        return $this->templates = array_values(array_filter(
            $decoded,
            static fn ($entry): bool => is_array($entry)
                && isset($entry['subject'], $entry['body'])
                && is_string($entry['subject'])
                && is_string($entry['body']),
        ));
    }
}
