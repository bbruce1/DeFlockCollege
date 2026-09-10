<?php

declare(strict_types=1);

return [
    /*
     * bcrypt hash of the admin passphrase. Generate with:
     *
     *   php artisan admin:password
     *
     * Left empty, the admin page cannot be unlocked at all, which is the right
     * default for a deployment nobody has configured.
     */
    'password_hash' => env('ADMIN_PASSWORD_HASH'),
];
