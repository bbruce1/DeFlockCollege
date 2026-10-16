# DeFlock Campus

Starting a campus chapter against automated license plate readers, as a
twenty-minute, one-student job: pick a school, verify a school email, drop a pin
on campus, and get a chapter page with every mapped reader nearby, the officials
who decide, one-click letters to them, and a catalogue of Instagram posts in the
school's colours.

Laravel 13, Inertia, React 19, TypeScript and Tailwind 4 on PHP 8.5. There is no
database: each chapter is a JSON file under `storage/app/chapters`, and
ownership is a keyed hash inside that file. `vision.md`, `goal.md` and
`security.md` are the design documents and are binding.

## Running it locally

    composer install
    npm install
    cp .env.example .env
    php artisan key:generate

    php artisan serve          # http://127.0.0.1:8000
    npm run dev                # Vite, in a second terminal

With `MAIL_MAILER=log` the verification link is written to
`storage/logs/laravel.log` instead of being sent.

    php artisan test           # the suite
    npm run build              # tsc, then the production bundle

Posts for `/social` are written one family per file in
`resources/js/Posts/sets/`; see `public/posts/README.md` before adding one.

## Deploying

### Server

- PHP 8.5 with the usual Laravel extensions, Composer, and Node 20+ to build.
- `storage/` and `bootstrap/cache/` writable by the web server user.
- HTTPS only. The chapter subdomains need a wildcard DNS record
  (`*.deflock.school`) and a wildcard certificate.

### Environment

Start from `.env.example`. The values that must change for production:

| Variable | Production value |
| --- | --- |
| `APP_ENV` / `APP_DEBUG` | `production` / `false` |
| `APP_KEY` | Generated once, then **backed up**. Chapter ownership is keyed with it; losing it orphans every chapter. |
| `APP_URL` | The public origin, e.g. `https://deflock.school` |
| `APP_DOMAIN` | The apex chapters hang off, e.g. `deflock.school`. Turns on `slug.deflock.school`. |
| `SESSION_SECURE_COOKIE` | `true` |
| `TRUSTED_PROXIES` | The load balancer or CDN in front of the app (`*` behind Cloudflare or a platform proxy). Without it every visitor shares one IP and the per-IP rate limits become site-wide. |
| `MAIL_*` | A transactional provider (Postmark, Resend, SES) with an authenticated from-address on the site's own domain. A personal Gmail account will hit sending caps and campus spam filters. |
| `MAIL_REPLY_TO_ADDRESS` | The public contact address shown on /contact and in the legal pages. |
| `ADMIN_PASSWORD_HASH` | Output of `php artisan admin:password`. Only the hash is stored; keep the passphrase in a password manager. |
| `CLARITY_ID` | Optional. Microsoft Clarity runs cookieless and is kept off every private page. |
| `LEGAL_OPERATOR` / `LEGAL_JURISDICTION` | Named in the terms and privacy policy. |

### Each release

    git pull
    composer install --no-dev --optimize-autoloader
    npm ci && npm run build
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

Then reload PHP-FPM (or the platform's equivalent). Run `php artisan
config:clear` before `config:cache` if `.env` changed.

### Scheduler

The nightly survey refresh (`chapters:refresh`, 03:30) only runs if the
scheduler is called every minute:

    * * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1

### Backups

Chapters, metrics and rotation state live only on the server's disk and are
not in git. Back up `storage/app/` off the server nightly, and keep a copy of
`APP_KEY` somewhere other than the server.

Do not deploy a development `storage/app/chapters` directory: test chapters
created locally would appear on the home page and in the chapter list.

### Taking a chapter down

    php artisan chapter:remove <slug> --reason="…"

Deletes the chapter and blocks the slug from being created again.
