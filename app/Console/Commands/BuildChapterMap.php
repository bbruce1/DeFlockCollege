<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Chapters\BoundingBox;
use App\Maps\CampusMapBuilder;
use App\Maps\OverpassClient;
use Illuminate\Console\Command;
use InvalidArgumentException;
use RuntimeException;

/**
 * Builds a campus map from a bounding box, without creating a chapter.
 *
 * The pipeline is the part that has to stay cheap for the project's premise to
 * hold, so it is runnable on its own for checking a frame before anyone commits
 * to it.
 */
final class BuildChapterMap extends Command
{
    protected $signature = 'map:build
        {bbox : south,west,north,east}
        {--state= : two letter state code}
        {--operator= : school name, matched against the operator tag}';

    protected $description = 'Query OpenStreetMap for a campus frame and report what is there';

    public function handle(): int
    {
        try {
            $box = BoundingBox::parse((string) $this->argument('bbox'));
        } catch (InvalidArgumentException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $builder = new CampusMapBuilder(
            new OverpassClient(fn (string $line) => $this->line("  {$line}"))
        );

        $this->info('Querying OpenStreetMap...');

        try {
            $map = $builder->build(
                $box,
                (string) ($this->option('state') ?? ''),
                $this->option('operator'),
            );
        } catch (RuntimeException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->newLine();
        $this->table(['measure', 'value'], [
            ['streets in frame', count($map->streets)],
            ['readers in frame', count($map->readers)],
            ['readers within a mile', $map->readersWithinMile],
            ['Flock units', $map->flockCount],
            ['readers in state', $map->readersInState],
            ['horizon covered', round($map->horizonCoverage() * 100).'%'],
            ['aspect', $map->aspect],
            ['area', round($box->areaInSquareMiles(), 1).' sq mi'],
        ]);

        return self::SUCCESS;
    }
}
