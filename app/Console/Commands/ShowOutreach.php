<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Chapters\ChapterRepository;
use App\Metrics\OutreachLog;
use Illuminate\Console\Command;

/**
 * The number the project is judged on, read off the server.
 *
 * There is no dashboard and no login, because adding either would mean holding
 * something. This is the whole reporting layer.
 */
final class ShowOutreach extends Command
{
    protected $signature = 'chapters:outreach {--days=14 : How far back to break it down}';

    protected $description = 'Letters opened, per chapter';

    public function handle(OutreachLog $outreach, ChapterRepository $chapters): int
    {
        $totals = $outreach->totals();

        if ($totals === []) {
            $this->line('No letters opened yet.');

            return self::SUCCESS;
        }

        $names = [];

        foreach ($chapters->all() as $chapter) {
            $names[$chapter->slug] = $chapter->shortName;
        }

        $this->newLine();
        $this->line('  <options=bold>Letters opened</>');
        $this->newLine();

        foreach ($totals as $slug => $total) {
            $this->line(sprintf(
                '  %-22s %6d   %s',
                $names[$slug] ?? $slug,
                $total,
                $this->recent($outreach->read($slug)),
            ));
        }

        $this->newLine();
        $this->line('  <options=bold>'.array_sum($totals).'</> in total, across '.count($totals).' chapters.');
        $this->line('  <fg=gray>Counts letters opened, not letters sent: what happens in somebody\'s');
        $this->line('  mail client is not visible here and never will be.</>');
        $this->newLine();

        return self::SUCCESS;
    }

    /** @param  array<string, int>  $byDay */
    private function recent(array $byDay): string
    {
        $days = (int) $this->option('days');
        $since = now()->subDays($days)->toDateString();
        $recent = array_sum(array_filter(
            $byDay,
            static fn (string $day): bool => $day >= $since,
            ARRAY_FILTER_USE_KEY,
        ));

        return sprintf('%d in the last %d days', $recent, $days);
    }
}
