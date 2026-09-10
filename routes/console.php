<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Counts go stale as readers are installed and mapped. Overnight, so a slow
// run never collides with somebody creating a chapter.
Schedule::command('chapters:refresh')->dailyAt('03:30');
