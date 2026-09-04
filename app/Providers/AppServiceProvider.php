<?php

declare(strict_types=1);

namespace App\Providers;

use App\Chapters\ChapterRepository;
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
