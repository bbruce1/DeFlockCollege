@php
    /*
     * Meta comes from the shared Inertia props rather than from a component,
     * because a link preview is built by fetching this HTML and reading it —
     * no JavaScript runs, so anything React sets arrives far too late.
     */
    $meta = $page['props']['meta'] ?? [];
    $title = $meta['title'] ?? config('app.name', 'DeFlock Campus');
    $description = $meta['description'] ?? '';
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $title }}</title>
        <meta name="description" content="{{ $description }}">
        @if (! empty($meta['noindex']))
            <meta name="robots" content="noindex, nofollow">
        @else
            <link rel="canonical" href="{{ $meta['url'] ?? url()->current() }}">
        @endif

        {{-- The tab, the home screen, and the installed icon. --}}
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <meta name="theme-color" content="#08090a">

        {{-- Messages, Slack, Discord, WhatsApp, Facebook. --}}
        <meta property="og:type" content="{{ $meta['type'] ?? 'website' }}">
        <meta property="og:site_name" content="{{ $meta['siteName'] ?? 'DeFlock Campus' }}">
        <meta property="og:title" content="{{ $title }}">
        <meta property="og:description" content="{{ $description }}">
        <meta property="og:url" content="{{ $meta['url'] ?? url()->current() }}">
        @if (! empty($meta['image']))
            <meta property="og:image" content="{{ $meta['image'] }}">
            <meta property="og:image:width" content="{{ $meta['imageWidth'] ?? 1200 }}">
            <meta property="og:image:height" content="{{ $meta['imageHeight'] ?? 630 }}">
            <meta property="og:image:alt" content="A crow in a graduating cap with a surveillance camera for a head, reading a book">
        @endif

        {{-- Twitter reads its own namespace and ignores og: for the card type. --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $title }}">
        <meta name="twitter:description" content="{{ $description }}">
        @if (! empty($meta['image']))
            <meta name="twitter:image" content="{{ $meta['image'] }}">
        @endif

        @if ($clarityId = config('services.clarity.id'))
            {{--
                Microsoft Clarity, with consent withheld before the tag loads.

                `clarity('consent', false)` is queued ahead of the script so the
                decision is already made by the time it initialises, rather than
                a moment after it has had a chance to write. That is the
                documented way to run it without cookies — and it is checked
                rather than assumed; see the note in the privacy page.

                Only the tracking id reaches the page, which is public by nature.
            --}}
            <script>
                (function (c, l, a, r, i, t, y) {
                    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
                    c[a]('consent', false);
                    t = l.createElement(r); t.async = 1;
                    t.src = 'https://www.clarity.ms/tag/' + i;
                    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
                })(window, document, 'clarity', 'script', @json($clarityId));
            </script>
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
