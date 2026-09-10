<?php

declare(strict_types=1);

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\CoverageController;
use App\Http\Controllers\ChapterCreationController;
use App\Http\Controllers\ChapterEditController;
use App\Http\Controllers\ChapterWelcomeController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OutreachController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/chapters', [ChapterController::class, 'index'])->name('chapters.index');

Route::get('/about', [LegalController::class, 'about'])->name('about');
Route::get('/contact', [LegalController::class, 'contact'])->name('contact');
Route::get('/terms', [LegalController::class, 'terms'])->name('terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('privacy');

/*
 * Verification. The send endpoint is throttled in the controller as well, per
 * address and per client; this is the outer bound.
 */
Route::post('/verify', [VerificationController::class, 'store'])
    ->middleware('throttle:20,60')
    ->name('verify.send');

/*
 * The statewide reader field, shared by every chapter in that state and cached
 * by the browser rather than re-sent inside each page.
 */
Route::get('/coverage/us', [CoverageController::class, 'nation'])->name('coverage.nation');
Route::get('/coverage/{state}', [CoverageController::class, 'show'])
    ->where('state', '[A-Za-z]{2}')
    ->name('coverage.show');

/*
 * The operator's dashboard. Declared before the chapter catch-all so no chapter
 * can ever claim the slug, and "admin" is in the reserved list besides.
 */
Route::get('/admin', [AdminController::class, 'show'])->name('admin');
Route::post('/admin', [AdminController::class, 'unlock'])
    ->middleware('throttle:20,1')
    ->name('admin.unlock');
Route::post('/admin/lock', [AdminController::class, 'lock'])->name('admin.lock');

Route::get('/start', [ChapterCreationController::class, 'start'])->name('chapters.start');
Route::post('/places', [ChapterCreationController::class, 'search'])
    ->middleware('throttle:60,60')
    ->name('places.search');
/*
 * Lookups the create form makes. Declared here, above the chapter catch-all,
 * because "/districts" is a valid slug shape and would otherwise be answered by
 * the chapter route with a 405.
 */
Route::post('/districts', [ChapterCreationController::class, 'districts'])
    ->middleware('throttle:30,60')
    ->name('districts.lookup');

Route::post('/handle-check', [ChapterCreationController::class, 'checkHandle'])
    ->middleware('throttle:40,60')
    ->name('handle.check');

Route::post('/chapters', [ChapterCreationController::class, 'store'])
    ->middleware('throttle:10,60')
    ->name('chapters.store');

/*
 * The letter a reader is about to send. Throttled hard: one press a minute is
 * more than anybody writing a considered email needs, and it keeps the chapter
 * counter meaning something.
 */
Route::post('/{slug}/email', [OutreachController::class, 'show'])
    ->middleware('throttle:20,1')
    ->name('chapters.email');

Route::get('/{slug}/welcome', [ChapterWelcomeController::class, 'show'])->name('chapters.welcome');
Route::post('/{slug}/acknowledge', [ChapterWelcomeController::class, 'acknowledge'])
    ->name('chapters.acknowledge');

Route::get('/{slug}/edit', [ChapterEditController::class, 'edit'])->name('chapters.edit');
Route::post('/{slug}/unlock', [ChapterEditController::class, 'unlock'])
    ->middleware('throttle:10,60')
    ->name('chapters.unlock');
Route::post('/{slug}/recover-key', [ChapterEditController::class, 'recoverKey'])
    ->middleware('throttle:5,60')
    ->name('chapters.recover-key');
Route::patch('/{slug}', [ChapterEditController::class, 'update'])
    ->middleware('throttle:20,60')
    ->name('chapters.update');

/*
 * A chapter answers on both shapes: gt.deflock.school and deflock.school/gt.
 * The subdomain is the canonical one because it is what students share, and the
 * page declares that so search engines do not split the two.
 *
 * Registered before the path form, and only when an apex is configured. It
 * cannot shadow the apex itself, which has no leading label to match, and
 * reserved names like "www" are refused by the slug rules.
 */
if ($apex = config('app.domain')) {
    Route::domain('{slug}.'.$apex)->group(function (): void {
        Route::get('/', [ChapterController::class, 'show'])->name('chapters.subdomain');
        Route::get('/edit', [ChapterEditController::class, 'edit'])->name('chapters.subdomain.edit');
    });
}

/*
 * The catch-all chapter page. Declared last so it can never shadow a real route,
 * and constrained to the slug grammar so it does not swallow asset paths.
 */
Route::get('/{slug}', [ChapterController::class, 'show'])
    ->where('slug', '[a-z0-9][a-z0-9-]{0,30}[a-z0-9]')
    ->name('chapters.show');
