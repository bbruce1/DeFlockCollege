<?php

declare(strict_types=1);

namespace App\Admin;

use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\States;
use App\Officials\RotationCounter;

/**
 * What the operator can see about the network.
 *
 * Everything here is derived from the chapter files and the rotation counters
 * already on disk. Nothing new is recorded to make this page possible, and
 * nothing about any individual reader exists to report.
 *
 * The email figure counts letters handed out, which is a close proxy for
 * letters sent and not the same thing: a reader can open a draft and never
 * press send. It is labelled that way on the page rather than dressed up.
 */
final class Analytics
{
    public function __construct(
        private readonly ChapterRepository $chapters,
        private readonly RotationCounter $rotation,
    ) {}

    /** @return array<string, mixed> */
    public function summary(): array
    {
        $chapters = $this->chapters->all();

        $rows = array_map(function (Chapter $chapter): array {
            $drawn = $this->rotation->current($chapter->slug);

            return [
                'slug' => $chapter->slug,
                'shortName' => $chapter->shortName,
                'state' => $chapter->state,
                'city' => $chapter->city,
                'lettersDrawn' => $drawn,
                'readersWithinMile' => $chapter->survey->readersWithinMile,
                'readersInState' => $chapter->survey->readersInState,
                'officials' => count($chapter->officials),
                'instagram' => $chapter->instagram,
                'hasPetition' => $chapter->petitionUrl !== null,
                'acknowledged' => $chapter->acknowledgedAt !== null,
                'status' => $chapter->status(),
                'createdAt' => $chapter->createdAt,
                'surveyedAt' => $chapter->survey->generatedAt,
            ];
        }, $chapters);

        usort($rows, static fn (array $a, array $b): int => $b['lettersDrawn'] <=> $a['lettersDrawn']);

        $byState = [];

        foreach ($rows as $row) {
            $code = $row['state'];
            $byState[$code] ??= ['state' => $code, 'name' => States::name($code), 'chapters' => 0, 'letters' => 0];
            $byState[$code]['chapters']++;
            $byState[$code]['letters'] += $row['lettersDrawn'];
        }

        usort($byState, static fn (array $a, array $b): int => $b['letters'] <=> $a['letters']);

        $letters = array_sum(array_column($rows, 'lettersDrawn'));
        $live = count(array_filter($rows, static fn (array $r): bool => $r['status'] === 'live'));

        return [
            'totals' => [
                'chapters' => count($rows),
                'live' => $live,
                'empty' => count($rows) - $live,
                'letters' => $letters,
                // The number vision.md calls the one that matters, per chapter.
                'lettersPerChapter' => count($rows) > 0 ? round($letters / count($rows), 1) : 0,
                'withInstagram' => count(array_filter($rows, static fn (array $r): bool => $r['instagram'] !== null)),
                'withPetition' => count(array_filter($rows, static fn (array $r): bool => $r['hasPetition'])),
                'acknowledged' => count(array_filter($rows, static fn (array $r): bool => $r['acknowledged'])),
                'officials' => array_sum(array_column($rows, 'officials')),
                'states' => count($byState),
            ],
            'chapters' => $rows,
            'byState' => array_values($byState),
            'silent' => array_values(array_filter(
                $rows,
                static fn (array $r): bool => $r['lettersDrawn'] === 0,
            )),
        ];
    }
}
