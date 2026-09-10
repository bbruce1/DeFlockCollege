<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Chapters\StateCoverageRepository;
use App\Chapters\States;
use App\Maps\StateCoverageBuilder;
use Illuminate\Console\Command;
use Throwable;

/**
 * Warms the per-state reader fields.
 *
 * Every chapter page and the national field are drawn from these files, so they
 * are built ahead of time rather than on the first request that needs them.
 */
final class BuildStateCoverage extends Command
{
    protected $signature = 'coverage:build
        {state?* : State codes to build. Defaults to every state.}
        {--refresh : Re-query Overpass even for states already on disk}
        {--pause= : Seconds to wait between queries, overriding the default}';

    protected $description = 'Fetch the plate readers in each state and cache the drawn field';

    /**
     * Overpass blocks an address that queries it too hard, and it has blocked
     * this one. A sweep is now a single light `out skel qt` per state — the
     * heavy border queries come from the committed Census data instead — so it
     * asks for half as much, half as often.
     */
    private const SECONDS_BETWEEN_STATES = 10;

    public function __construct(private readonly StateCoverageRepository $store)
    {
        parent::__construct();
    }

    public function handle(StateCoverageBuilder $builder): int
    {
        $codes = $this->requestedStates();
        $pause = $this->pauseSeconds();
        $failed = [];

        foreach ($codes as $code) {
            // Decided before the call, because afterwards a cached state and a
            // freshly fetched one are indistinguishable.
            $queried = ! $this->alreadyHeld($code);

            try {
                $coverage = $builder->for($code, (bool) $this->option('refresh'));
                $this->line(sprintf(
                    '%s  %s readers, %d dots, %dx%d',
                    $code,
                    number_format($coverage->readerCount),
                    // Points are a flat [x, y, x, y, ...] run, not a list of pairs.
                    intdiv(count($coverage->points), 2),
                    $coverage->width,
                    $coverage->height,
                ));
            } catch (Throwable $e) {
                // One unreachable state must not abandon the other fifty.
                $failed[] = $code;
                $this->warn("{$code}  failed: {$e->getMessage()}");
            }

            // Only a state we actually asked Overpass about owes it a pause.
            if ($queried && $pause > 0) {
                sleep($pause);
            }
        }

        if ($failed !== []) {
            $this->error('Could not build: '.implode(', ', $failed));

            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    private function pauseSeconds(): int
    {
        $asked = $this->option('pause');

        return $asked === null ? self::SECONDS_BETWEEN_STATES : max(0, (int) $asked);
    }

    private function alreadyHeld(string $code): bool
    {
        return ! $this->option('refresh') && $this->store->find($code) !== null;
    }

    /** @return list<string> */
    private function requestedStates(): array
    {
        $asked = array_map(strtoupper(...), (array) $this->argument('state'));

        return $asked === [] ? States::codes() : $asked;
    }
}
