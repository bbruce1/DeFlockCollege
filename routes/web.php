<?php

declare(strict_types=1);

use App\Http\Controllers\ChapterController;
use App\Http\Controllers\ChapterCreationController;
use App\Http\Controllers\ChapterEditController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/chapters', [ChapterController::class, 'index'])->name('chapters.index');

/*
 * Verification. The send endpoint is throttled in the controller as well, per
 * address and per client; this is the outer bound.
 */
Route::post('/verify', [VerificationController::class, 'store'])
    ->middleware('throttle:20,60')
    ->name('verify.send');

Route::get('/start', [ChapterCreationController::class, 'start'])->name('chapters.start');
Route::post('/chapters', [ChapterCreationController::class, 'store'])
    ->middleware('throttle:10,60')
    ->name('chapters.store');

Route::get('/{slug}/edit', [ChapterEditController::class, 'edit'])->name('chapters.edit');
Route::patch('/{slug}', [ChapterEditController::class, 'update'])
    ->middleware('throttle:20,60')
    ->name('chapters.update');

/*
 * The catch-all chapter page. Declared last so it can never shadow a real route,
 * and constrained to the slug grammar so it does not swallow asset paths.
 */
Route::get('/{slug}', [ChapterController::class, 'show'])
    ->where('slug', '[a-z0-9][a-z0-9-]{0,30}[a-z0-9]')
    ->name('chapters.show');
