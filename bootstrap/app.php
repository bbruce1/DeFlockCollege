<?php

use App\Site\PageMeta;
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

        /*
         * Which forwarded headers to believe, and only from a trusted proxy.
         *
         * The proxies themselves come from config/trustedproxy.php (env
         * TRUSTED_PROXIES), which the middleware reads per request. They
         * cannot be passed as `at:` here: this callback runs before
         * configuration or .env is loaded, so config() is not available yet.
         */
        $middleware->trustProxies(
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO,
        );
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
         * development the stack trace is worth more than a tidy page. With
         * debug off the framework renders resources/views/errors/500.blade.php
         * instead, which needs neither Inertia nor the built assets, since
         * either may be what broke.
         *
         * Every one of these is kept out of search. An error page is not a
         * page, and the canonical link the root template would otherwise emit
         * points at an address that does not exist.
         */
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            $handled = [404, 403, 419, 429, 503];

            if ($request->expectsJson() || ! in_array($response->getStatusCode(), $handled, true)) {
                return $response;
            }

            return Inertia::render('Error', [
                'status' => $response->getStatusCode(),
                'meta' => PageMeta::make(
                    title: 'Error '.$response->getStatusCode().' · '.PageMeta::SITE_NAME,
                    description: '',
                    image: '',
                    noindex: true,
                )->toArray(),
            ])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
        });
    })->create();
