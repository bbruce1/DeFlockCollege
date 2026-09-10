<?php

declare(strict_types=1);

namespace Tests;

use App\Chapters\ChapterRepository;
use App\Chapters\StateCoverageRepository;
use App\Officials\RotationCounter;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\File;

abstract class TestCase extends BaseTestCase
{
    /**
     * Chapters are files rather than rows, so the usual database refresh has
     * nothing to reset. Without this every test reads and writes the operator's
     * real storage directory: a chapter left there by hand decides whether a
     * domain looks taken, and a test that saves one leaves it behind.
     */
    private string $storageRoot;

    protected function setUp(): void
    {
        parent::setUp();

        $this->storageRoot = storage_path('framework/testing/state-'.bin2hex(random_bytes(8)));

        $this->app->singleton(
            ChapterRepository::class,
            fn (): ChapterRepository => new ChapterRepository($this->storageRoot.'/chapters'),
        );

        $this->app->singleton(
            StateCoverageRepository::class,
            fn (): StateCoverageRepository => new StateCoverageRepository($this->storageRoot.'/states'),
        );

        $this->app->singleton(
            RotationCounter::class,
            fn (): RotationCounter => new RotationCounter($this->storageRoot.'/rotation'),
        );
    }

    protected function tearDown(): void
    {
        if (isset($this->storageRoot) && File::isDirectory($this->storageRoot)) {
            File::deleteDirectory($this->storageRoot);
        }

        parent::tearDown();
    }
}
