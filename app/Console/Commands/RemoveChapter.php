<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Chapters\Blocklist;
use App\Chapters\ChapterRepository;
use App\Chapters\Slug;
use Illuminate\Console\Command;
use InvalidArgumentException;

/**
 * Takes a chapter down, and keeps it down.
 *
 * The answer to a cease-and-desist, and vision.md is plain that being able to
 * give it the same day is the single control that makes an open creation model
 * defensible. Deleting the file alone would free the slug for anybody to put
 * the same page back up, so the slug is blocked before the file goes.
 *
 * Like chapter:reset-key, there is deliberately no web route for this: shell
 * access to the server is the whole access control.
 */
final class RemoveChapter extends Command
{
    protected $signature = 'chapter:remove
                            {slug : The chapter to take down}
                            {--reason= : Why, kept beside the blocked slug for whoever asks later}
                            {--block-domain : Also refuse new chapters from the school domain that created it}';

    protected $description = 'Delete a chapter and block its address from being created again';

    public function handle(ChapterRepository $chapters, Blocklist $blocklist): int
    {
        try {
            $slug = Slug::fromString((string) $this->argument('slug'));
        } catch (InvalidArgumentException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $chapter = $chapters->find($slug);

        if ($chapter === null) {
            $this->error("No chapter exists at \"{$slug}\". Nothing was deleted or blocked.");

            return self::FAILURE;
        }

        if (! $this->confirm("Take down {$chapter->schoolName} at /{$slug}? The file cannot be restored.", false)) {
            $this->line('Nothing changed.');

            return self::SUCCESS;
        }

        $reason = $this->option('reason');
        $reason = is_string($reason) ? $reason : null;

        // Blocked before the file goes, so there is never a moment where the
        // chapter is gone and its slug is free to be claimed again.
        $blocklist->blockSlug($slug, $reason);
        $this->info("Blocked \"{$slug}\": no chapter can be created at that address again.");

        if ($this->option('block-domain')) {
            if ($chapter->ownerDomain === '') {
                $this->warn('This chapter has no school domain on record, so no domain was blocked.');
            } else {
                $blocklist->blockDomain($chapter->ownerDomain, $reason);
                $this->info("Blocked {$chapter->ownerDomain}: no new chapter can be started from any address there.");
            }
        }

        if (! $chapters->delete($slug)) {
            $this->error("Could not delete the file for \"{$slug}\". Its address is blocked, but the page is still up.");

            return self::FAILURE;
        }

        $this->info("Deleted {$chapter->schoolName} (/{$slug}). The page is gone.");

        return self::SUCCESS;
    }
}
