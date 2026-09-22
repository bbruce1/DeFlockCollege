<?php

declare(strict_types=1);

namespace App\Metrics;

use App\Chapters\Slug;
use Illuminate\Support\Facades\File;

/**
 * How many letters were opened, per chapter, per day.
 *
 * The one number the project is actually judged on. `vision.md` is blunt about
 * it: chapter count is a vanity metric that will look good early and mean
 * little, and the figure that decides whether any of this works is outreach
 * actually sent. So it is counted here rather than inferred from an analytics
 * product that cannot see it.
 *
 * Counts only. No address, no identifier, no session, nothing that could say
 * who opened anything — which is what lets this exist at all in a project whose
 * entire risk posture is holding almost nothing.
 *
 * It counts letters *opened*, which is not letters *sent*: what happens after
 * the mail client opens is invisible to us and always will be. Treat it as a
 * ceiling on sending and a floor on interest.
 *
 * Why this exists next to RotationCounter, which already increments on the same
 * event: that one is a single integer and cannot be anything else, because its
 * job is to pick the next letter in the rotation. This keeps the same event
 * broken down by day, which is the part vision.md actually asks for — a total
 * says nothing about whether a chapter is alive, and history is the one thing
 * that cannot be added retrospectively once it has not been kept.
 *
 * They are written at one call site, together. If a third thing ever wants to
 * count this, it belongs here rather than as another file beside these two.
 */
final class OutreachLog
{
    public function __construct(private readonly string $directory) {}

    /** One fresh letter drawn for this chapter. */
    public function record(string $slug): void
    {
        $day = now()->toDateString();
        $counts = $this->read($slug);
        $counts[$day] = ($counts[$day] ?? 0) + 1;

        File::ensureDirectoryExists($this->directory);
        File::put($this->pathFor($slug), json_encode($counts, JSON_PRETTY_PRINT)."\n");
    }

    /** @return array<string, int> day => letters */
    public function read(string $slug): array
    {
        $path = $this->pathFor($slug);

        if (! File::exists($path)) {
            return [];
        }

        $decoded = json_decode(File::get($path), true);

        return is_array($decoded) ? array_map('intval', $decoded) : [];
    }

    public function total(string $slug): int
    {
        return array_sum($this->read($slug));
    }

    /** @return array<string, int> slug => total, busiest first */
    public function totals(): array
    {
        if (! File::isDirectory($this->directory)) {
            return [];
        }

        $totals = [];

        foreach (File::files($this->directory) as $file) {
            if ($file->getExtension() === 'json') {
                $slug = $file->getFilenameWithoutExtension();
                $totals[$slug] = $this->total($slug);
            }
        }

        arsort($totals);

        return $totals;
    }

    /** Validated before it becomes a filename, like every other path here. */
    private function pathFor(string $slug): string
    {
        return $this->directory.DIRECTORY_SEPARATOR.Slug::fromString($slug)->value.'.json';
    }
}
