<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(prepend: [
            // Before anything else, so every other layer sees one host.
            \App\Http\Middleware\RedirectToCanonicalHost::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        /*
         * Errors a visitor can actually cause get the site's own page rather
         * than the framework's bare one. A mistyped chapter address is the
         * common case by far, and landing on unstyled black-on-white text
         * reads as a broken site rather than a wrong address.
         *
         * A 500 is deliberately not in this list: that is a bug, and in
         * development the stack trace is worth more than a tidy page.
         */
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            $handled = [404, 403, 419, 429, 503];

            if ($request->expectsJson() || ! in_array($response->getStatusCode(), $handled, true)) {
                return $response;
            }

            return Inertia::render('Error', [
                'status' => $response->getStatusCode(),
            ])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
        });
    })->create();
