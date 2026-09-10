<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Admin\Analytics;
use App\Admin\AdminGate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The operator's view of the network.
 *
 * Locked until the passphrase is entered. Locked, it renders nothing but a
 * single field: no counts, no chapter names, no hint that there is anything
 * behind it, because a login screen that describes what it protects is an
 * invitation.
 */
final class AdminController extends Controller
{
    public function __construct(
        private readonly AdminGate $gate,
        private readonly Analytics $analytics,
    ) {}

    public function show(Request $request): Response
    {
        if (! $this->gate->isUnlocked($request)) {
            return Inertia::render('Admin/Locked', [
                'retryIn' => $this->gate->secondsUntilRetry($request),
            ]);
        }

        return Inertia::render('Admin/Dashboard', $this->analytics->summary());
    }

    public function unlock(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'passphrase' => ['required', 'string', 'max:200'],
        ]);

        if ($this->gate->secondsUntilRetry($request) > 0) {
            return back()->withErrors([
                'passphrase' => 'Too many attempts. Wait before trying again.',
            ]);
        }

        if (! $this->gate->attempt($request, $validated['passphrase'])) {
            // Deliberately identical whether the passphrase was wrong or no
            // passphrase is configured at all.
            return back()->withErrors(['passphrase' => 'That did not work.']);
        }

        return redirect()->route('admin');
    }

    public function lock(Request $request): RedirectResponse
    {
        $this->gate->lock($request);

        return redirect()->route('admin');
    }
}
