<?php

declare(strict_types=1);

namespace App\Providers;

use App\Chapters\Blocklist;
use App\Chapters\ChapterRepository;
use App\Chapters\StateCoverageRepository;
use App\Http\Controllers\ChapterCreationController;
use App\Maps\NationalMap;
use App\Maps\OverpassClient;
use App\Maps\StateBorders;
use App\Maps\StateCoverageBuilder;
use App\Maps\SurveyBuilder;
use App\Metrics\OutreachLog;
use App\Officials\OfficialsDirectory;
use App\Officials\DistrictLookup;
use App\Officials\LegislatorDirectory;
use App\Officials\OutreachLibrary;
use App\Officials\RotationCounter;
use App\Site\PostCatalogue;
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

        // Chapters taken down with chapter:remove, so they stay down.
        $this->app->singleton(
            Blocklist::class,
            static fn (): Blocklist => new Blocklist(storage_path('app/blocklist.json')),
        );

        // Statewide reader fields are shared by every chapter in that state.
        $this->app->singleton(
            StateCoverageRepository::class,
            static fn (): StateCoverageRepository => new StateCoverageRepository(storage_path('app/states')),
        );

        // Creation surveys inside a visitor's request, so it gets one short
        // attempt per query instead of the patient policy the nightly refresh
        // uses. A count it cannot fetch is saved as unknown and the refresh
        // fills it in. Contextual, so it wins over any SurveyBuilder bound
        // elsewhere: a test that wants to swap the controller's builder has to
        // bind it with when() as well.
        $this->app->when(ChapterCreationController::class)
            ->needs(SurveyBuilder::class)
            ->give(static function ($app): SurveyBuilder {
                $overpass = OverpassClient::quick();

                return new SurveyBuilder($overpass, new StateCoverageBuilder(
                    $overpass,
                    $app->make(StateCoverageRepository::class),
                    $app->make(StateBorders::class),
                ));
            });

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

        // Read from the TypeScript sets on first use, once per process.
        $this->app->singleton(
            PostCatalogue::class,
            static fn (): PostCatalogue => new PostCatalogue(resource_path('js/Posts/sets')),
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
