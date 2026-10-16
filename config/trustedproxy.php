<?php

declare(strict_types=1);

return [
    /*
     * The proxies allowed to say who the visitor is, via X-Forwarded-For.
     *
     * Behind a load balancer or Cloudflare every request arrives from the
     * proxy's address, so without this every visitor shares one IP and every
     * per-IP rate limit in routes/web.php becomes one global limit that a
     * single person can exhaust for everybody.
     *
     * Comma-separated addresses or CIDR ranges, or "*" to trust whatever is
     * directly in front of the app. "*" is only safe when nothing can reach
     * the app except through that proxy: otherwise anybody can claim any
     * address and walk past every limit. Unset trusts nobody, which is the
     * right default for a server taking connections directly (the framework
     * still trusts its own proxy on Laravel Cloud and Forge hostnames).
     *
     * The framework's TrustProxies middleware reads this key on each request;
     * bootstrap/app.php sets which forwarded headers it believes.
     */
    'proxies' => env('TRUSTED_PROXIES') ?: null,
];
