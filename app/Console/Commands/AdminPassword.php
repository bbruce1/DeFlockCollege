<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

/**
 * Turns a passphrase into the hash the admin page checks against.
 *
 * Deliberately prints the hash rather than writing it: the operator pastes it
 * into their own environment file, and the plaintext never touches disk here.
 */
final class AdminPassword extends Command
{
    protected $signature = 'admin:password';

    protected $description = 'Generate the ADMIN_PASSWORD_HASH value for the admin dashboard';

    public function handle(): int
    {
        $passphrase = (string) $this->secret('Choose an admin passphrase (not shown)');

        if (mb_strlen($passphrase) < 12) {
            $this->error('Use at least 12 characters. This is the only door in the application.');

            return self::FAILURE;
        }

        if ((string) $this->secret('Type it again') !== $passphrase) {
            $this->error('Those did not match.');

            return self::FAILURE;
        }

        $this->newLine();
        $this->line('  Add this line to your .env file:');
        $this->newLine();
        $this->line('  <options=bold>ADMIN_PASSWORD_HASH="'.Hash::make($passphrase).'"</>');
        $this->newLine();
        $this->warn('  The passphrase itself is not stored anywhere. Keep it in a password manager.');

        return self::SUCCESS;
    }
}
