<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // There is no authentication in this application. Ownership is proved
        // per request by a signed link sent to a school email address, so there
        // is no session, no user, and nothing to share.
        return [
            ...parent::share($request),
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                // Set when somebody asks for a link at a domain that already has
                // a chapter, so the page can send them straight to it.
                'existing' => fn () => $request->session()->get('existing'),
            ],
        ];
    }
}
