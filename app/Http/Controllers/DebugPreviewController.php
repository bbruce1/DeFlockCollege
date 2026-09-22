<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\VerificationTicket;
use Illuminate\Http\RedirectResponse;
use RuntimeException;

/**
 * A way to look at the create flow without waiting for an email.
 *
 * Reaching the real thing means sending a link to a school address and clicking
 * it, which is fine once and tiresome when the work is the screen itself. This
 * mints a ticket for a throwaway address and drops you at step one.
 *
 * It is a verification bypass, and it is treated as one: the route is only
 * registered when the application is in debug, and this refuses to run in
 * production even if something registers it anyway. Both checks, because the
 * cost of the first being wrong is that anyone can make a chapter for any
 * school without ever proving they attend it.
 */
final class DebugPreviewController extends Controller
{
    /**
     * A fresh fake school on every visit.
     *
     * One school gets one chapter, so a fixed address worked exactly once and
     * then sent every later visit to the "you already have a chapter" screen.
     * Randomising the domain means the preview always starts from nothing.
     */
    private static function previewAddress(): string
    {
        return 'preview@deflock-debug-'.bin2hex(random_bytes(4)).'.edu';
    }

    public function start(): RedirectResponse
    {
        $this->refuseUnlessDebugging();

        return redirect()->route('chapters.start', [
            'ticket' => VerificationTicket::issue(self::previewAddress())->toToken(),
        ]);
    }

    /**
     * The second lock.
     *
     * routes/web.php only registers this when debug is on, so this should be
     * unreachable in production. "Should be" is what makes it worth checking:
     * a cached route file from a debug build would otherwise carry the bypass
     * into production silently.
     */
    private function refuseUnlessDebugging(): void
    {
        if (! config('app.debug') || app()->environment('production')) {
            throw new RuntimeException('The debug preview is not available here.');
        }
    }
}
