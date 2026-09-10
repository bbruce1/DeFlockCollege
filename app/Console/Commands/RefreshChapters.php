<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\ReaderSurvey;
use App\Maps\StateCoverageBuilder;
use App\Maps\SurveyBuilder;
use Illuminate\Console\Command;
use Throwable;

/**
 * Re-counts every chapter against OpenStreetMap.
 *
 * Carries the old counts forward into `previous`, which is what lets a page say
 * a reader was added this month rather than only what stands there today.
 *
 * Overpass is a free service shared by everyone, so chapters are refreshed one
 * at a time with a pause between them. A run that takes an hour at three in the
 * morning costs nothing; a run that gets us rate limited costs everyone.
 */
final class RefreshChapters extends Command
{
    protected $signature = 'chapters:refresh
                            {--slug= : Refresh a single chapter}
                            {--pause=5 : Seconds to wait between chapters}';

    protected $description = 'Re-count plate readers for every chapter from OpenStreetMap';

    public function handle(
        ChapterRepository $chapters,
        SurveyBuilder $surveys,
        StateCoverageBuilder $coverage,
    ): int {
        $targets = $this->option('slug')
            ? array_filter($chapters->all(), fn (Chapter $c): bool => $c->slug === $this->option('slug'))
            : $chapters->all();

        if ($targets === []) {
            $this->warn('No chapters to refresh.');

            return self::SUCCESS;
        }

        $pause = max(0, (int) $this->option('pause'));
        $failed = 0;

        // Statewide fields are cached and shared, so a chapter refresh would
        // otherwise keep reusing last month's readers. Refreshed once per state
        // rather than once per chapter.
        foreach (array_unique(array_map(static fn (Chapter $c): string => $c->state, $targets)) as $state) {
            $this->line("Refreshing the {$state} field…");

            try {
                $field = $coverage->for($state, true);
                $this->info("  {$field->readerCount()} readers mapped in {$state}");
            } catch (Throwable $e) {
                $this->error("  {$state}: {$e->getMessage()}");
                $failed++;
            }

            if ($pause > 0) {
                sleep($pause);
            }
        }

        foreach ($targets as $index => $chapter) {
            $this->line("Refreshing {$chapter->slug}…");

            try {
                $survey = $surveys->build($chapter->survey->point, $chapter->state);
            } catch (Throwable $e) {
                // One unreachable chapter must not abandon the rest of the run.
                $this->error("  {$chapter->slug}: {$e->getMessage()}");
                $failed++;

                continue;
            }

            $before = $chapter->survey->readersWithinMile;

            $chapters->save(new Chapter(
                slug: $chapter->slug,
                schoolName: $chapter->schoolName,
                shortName: $chapter->shortName,
                state: $chapter->state,
                city: $chapter->city,
                ownerDomain: $chapter->ownerDomain,
                ownerRecord: $chapter->ownerRecord,
                survey: new ReaderSurvey(
                    point: $survey->point,
                    // A failed query this run must not erase what the last one
                    // found. Absent means unknown, and a figure we hold is not.
                    readersWithinMile: $survey->readersWithinMile ?? $chapter->survey->readersWithinMile,
                    flockCount: $survey->flockCount ?? $chapter->survey->flockCount,
                    // A statewide query that failed this run must not erase the
                    // figure the last one found. Absent means unknown, and a
                    // number we already hold is not unknown.
                    readersInState: $survey->readersInState ?? $chapter->survey->readersInState,
                    generatedAt: $survey->generatedAt,
                    previous: [
                        'readersWithinMile' => $before,
                        'readersInState' => $chapter->survey->readersInState,
                        'generatedAt' => $chapter->survey->generatedAt,
                    ],
                ),
                // Only the survey is regenerated. Everything a person authored
                // is carried across by hand, because the chapter file is
                // rewritten whole and a field left out here is deleted from it
                // — including the edit key hash, which cannot be recovered.
                instagram: $chapter->instagram,
                tiktok: $chapter->tiktok,
                petitionUrl: $chapter->petitionUrl,
                officials: $chapter->officials,
                editKeyHash: $chapter->editKeyHash,
                acknowledgedAt: $chapter->acknowledgedAt,
                colours: $chapter->colours,
                createdAt: $chapter->createdAt,
                updatedAt: now()->toIso8601String(),
            ));

            if ($survey->readersWithinMile === null) {
                $this->warn("  could not be surveyed; keeping {$before} within a mile");
            } else {
                $delta = $survey->readersWithinMile - (int) $before;
                $this->info("  {$before} → {$survey->readersWithinMile} within a mile"
                    .($delta === 0 ? '' : sprintf(' (%+d)', $delta)));
            }

            if ($pause > 0 && $index < count($targets) - 1) {
                sleep($pause);
            }
        }

        if ($failed > 0) {
            $this->warn("{$failed} chapter(s) could not be refreshed.");

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
