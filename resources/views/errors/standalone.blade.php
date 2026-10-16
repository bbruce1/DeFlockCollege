{{--
    The error page for when the site itself is what broke.

    Every other error goes through the Inertia page, which needs the built
    assets and a working framework to render. A 500 often means one of those
    is the problem, so this depends on neither: no Vite, no fonts, no scripts,
    no helpers that could fail in turn. The colours are the shell's tokens from
    resources/css/app.css, written out by hand.
--}}
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex, nofollow">
        <meta name="theme-color" content="#08090a">
        <title>@yield('code') — @yield('title') · DeFlock Campus</title>
        <style>
            *, *::before, *::after { box-sizing: border-box; }
            html { -webkit-text-size-adjust: 100%; }
            body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                align-content: center;
                background: #08090a;
                color: #ffffff;
                font-family: "Archivo Variable", "Archivo", system-ui, -apple-system, "Segoe UI", sans-serif;
                font-size: 1rem;
                line-height: 1.55;
                -webkit-font-smoothing: antialiased;
            }
            main {
                width: 100%;
                max-width: 72rem;
                margin-inline: auto;
                padding: 6rem 1.75rem;
                display: grid;
                gap: 1.5rem;
            }
            .annot {
                margin: 0;
                font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
                font-size: 0.6875rem;
                font-weight: 500;
                letter-spacing: 0.16em;
                text-transform: uppercase;
                color: #f43f5e;
            }
            h1 {
                margin: 0;
                max-width: 18ch;
                font-size: clamp(2.25rem, 7vw, 4.5rem);
                font-weight: 700;
                letter-spacing: -0.035em;
                line-height: 1.05;
                text-transform: uppercase;
                text-wrap: balance;
            }
            p.body { margin: 0; max-width: 52ch; font-size: 1.125rem; color: #9aa4ad; }
            /* Square by rule, like every button on the site. */
            .btn {
                justify-self: start;
                margin-top: 0.5rem;
                display: inline-flex;
                padding: 1rem 1.75rem;
                font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
                font-size: 0.8125rem;
                font-weight: 600;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                text-decoration: none;
                background: #22d3ee;
                color: #08090a;
            }
            .btn:hover { background: #67e8f9; }
            .btn:focus-visible { outline: 2px solid #ffffff; outline-offset: 3px; }
            @media (max-width: 640px) { main { padding-inline: 1.25rem; } }
        </style>
    </head>
    <body>
        <main>
            <p class="annot">Error @yield('code')</p>
            <h1>@yield('title')</h1>
            <p class="body">@yield('message')</p>
            <a class="btn" href="/">Back to the start</a>
        </main>
    </body>
</html>
