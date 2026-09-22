<?php

declare(strict_types=1);

namespace App\Providers;

use App\Chapters\ChapterRepository;
use App\Chapters\StateCoverageRepository;
use App\Maps\NationalMap;
use App\Maps\StateBorders;
use App\Metrics\OutreachLog;
use App\Officials\OfficialsDirectory;
use App\Officials\DistrictLookup;
use App\Officials\LegislatorDirectory;
use App\Officials\OutreachLibrary;
use App\Officials\RotationCounter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Chapters are files, not rows. They live outside the source tree so the
        // application never writes into its own codebase.
        $this->app->singleton(
            ChapterRepository::class,
            static fn (): ChapterRepository => new ChapterRepository(storage_path('app/chapters')),
        );

        // Statewide reader fields are shared by every chapter in that state.
        $this->app->singleton(
            StateCoverageRepository::class,
            static fn (): StateCoverageRepository => new StateCoverageRepository(storage_path('app/states')),
        );

        $this->app->singleton(
            LegislatorDirectory::class,
            static fn ($app): LegislatorDirectory => new LegislatorDirectory(
                resource_path('data'),
                $app->make(DistrictLookup::class),
            ),
        );

        $this->app->singleton(
            RotationCounter::class,
            static fn (): RotationCounter => new RotationCounter(storage_path('app/rotation')),
        );

        // Committed with the repository, not fetched: borders do not move.
        $this->app->singleton(
            StateBorders::class,
            static fn (): StateBorders => new StateBorders(
                resource_path('data/borders/us-states.json'),
            ),
        );

        // The country, drawn from the committed boundaries. No build step.
        $this->app->singleton(
            NationalMap::class,
            static fn ($app): NationalMap => new NationalMap($app->make(StateBorders::class)),
        );

        $this->app->singleton(
            OutreachLibrary::class,
            static fn (): OutreachLibrary => new OutreachLibrary(resource_path('data')),
        );

        // The metric vision.md says the project is judged on.
        $this->app->singleton(
            OutreachLog::class,
            static fn (): OutreachLog => new OutreachLog(storage_path('app/metrics')),
        );

        $this->app->singleton(
            OfficialsDirectory::class,
            static fn (): OfficialsDirectory => new OfficialsDirectory(resource_path('data')),
        );
    }

    public function boot(): void
    {
        // Signed verification links must not be downgraded to http in production,
        // or the signature travels in the clear.
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
