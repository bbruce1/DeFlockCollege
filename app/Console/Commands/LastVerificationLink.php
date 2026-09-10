<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;

/**
 * Prints the most recent verification link from the local log.
 *
 * A convenience for testing on your own machine, where a university spam filter
 * sits between you and the mail you just sent yourself. Refuses to run anywhere
 * but local, because handing out verification links is exactly what the email
 * step exists to prevent.
 */
final class LastVerificationLink extends Command
{
    protected $signature = 'chapters:last-link';

    protected $description = 'Show the most recent verification link (local only)';

    public function handle(): int
    {
        if (! app()->isLocal()) {
            $this->error('Only available in the local environment.');

            return self::FAILURE;
        }

        $log = storage_path('logs/laravel.log');

        if (! is_file($log)) {
            $this->error('No log file yet. Ask for a link first.');

            return self::FAILURE;
        }

        $matches = [];
        preg_match_all('#"url":"([^"]+)"#', (string) file_get_contents($log), $matches);

        if ($matches[1] === []) {
            $this->error('No verification link in the log. Ask for one first.');

            return self::FAILURE;
        }

        $url = stripslashes(end($matches[1]));

        $this->newLine();
        $this->line($url);
        $this->newLine();

        return self::SUCCESS;
    }
}
