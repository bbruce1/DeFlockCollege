<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sends the bare apex to www, which is the site's front door.
 *
 * Two hosts serving one page splits links, search results and anything else
 * that counts by URL, so one of them has to be the address. Chapter subdomains
 * are left alone: each is already its own canonical host.
 *
 * Does nothing at all when no apex is configured, which is every local machine.
 */
final class RedirectToCanonicalHost
{
    private const CANONICAL_LABEL = 'www';

    public function handle(Request $request, Closure $next): Response
    {
        $apex = (string) config('app.domain');

        if ($apex === '' || $request->getHost() !== $apex) {
            return $next($request);
        }

        // Permanent: the apex is not a second address for the site, it is the
        // old way of writing the only one.
        return redirect()->away($this->canonical($request, $apex), 301);
    }

    private function canonical(Request $request, string $apex): string
    {
        $query = $request->getQueryString();

        return $request->getScheme().'://'.self::CANONICAL_LABEL.'.'.$apex
            .$request->getPathInfo()
            .($query === null ? '' : '?'.$query);
    }
}
