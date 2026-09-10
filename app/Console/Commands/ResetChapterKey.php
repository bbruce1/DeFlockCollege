<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Chapters\ChapterRepository;
use App\Chapters\EditKey;
use App\Chapters\Ownership;
use App\Chapters\Slug;
use Illuminate\Console\Command;
use InvalidArgumentException;

/**
 * Issues a replacement edit key for somebody who lost theirs.
 *
 * A lost key cannot be recovered. Only its bcrypt hash is stored, which is the
 * property that makes the file safe to hold at all, so the original is gone the
 * moment the creator closes that first screen. This replaces it instead.
 *
 * There is deliberately no web route for this. Running it needs shell access to
 * the server, which is the whole access control: nothing to authenticate, no
 * endpoint to attack, no way to reach it from the internet.
 *
 * The claimed address is checked against the chapter's stored ownership record
 * before anything is written. That record is an HMAC keyed with the application
 * secret, so it confirms an address somebody offers without ever holding the
 * address itself, and without letting anyone work backwards to a list of them.
 */
final class ResetChapterKey extends Command
{
    protected $signature = 'chapter:reset-key
                            {slug : The chapter to issue a new key for}
                            {--email= : The address that created it, to prove the claim}
                            {--force : Skip the ownership check (use only when the address is genuinely lost)}';

    protected $description = 'Issue a replacement edit key for a chapter';

    public function handle(ChapterRepository $chapters): int
    {
        try {
            $slug = Slug::fromString((string) $this->argument('slug'));
        } catch (InvalidArgumentException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $chapter = $chapters->find($slug);

        if ($chapter === null) {
            $this->error("No chapter exists at \"{$slug}\".");

            return self::FAILURE;
        }

        $email = (string) $this->option('email');

        if ($email === '' && ! $this->option('force')) {
            $this->error('Pass --email with the address that created the chapter, so the claim can be checked.');
            $this->line('If that address is genuinely gone, --force skips the check.');

            return self::FAILURE;
        }

        if ($email !== '') {
            if (! $chapter->isOwnedBy($email)) {
                $this->error("{$email} did not create {$chapter->slug}.");
                $this->line('The stored record is an HMAC, so this is a definite no rather than a near miss.');

                return self::FAILURE;
            }

            $this->info("{$email} matches the ownership record for {$chapter->slug}.");
        } else {
            $this->warn('Skipping the ownership check because --force was passed.');
        }

        if (! $this->confirm("Issue a new key for {$chapter->shortName}? The current one stops working.", false)) {
            $this->line('Nothing changed.');

            return self::SUCCESS;
        }

        $key = EditKey::generate();

        $chapters->save($chapter->withEditKeyHash(EditKey::hash($key)));

        $this->newLine();
        $this->line('  New key for '.$chapter->shortName.':');
        $this->line('  <options=bold>'.$key.'</>');
        $this->newLine();
        $this->warn('  Shown once here. It is not written to the chapter file or any log,');
        $this->warn('  so send it to them now and do not keep a copy.');

        return self::SUCCESS;
    }
}
