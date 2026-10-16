<?php

declare(strict_types=1);

namespace App\Storage;

use RuntimeException;

/**
 * Whole-file writes that a reader never sees half done.
 *
 * Chapters are files and there is no database underneath to provide this. A
 * plain write truncates first and fills second, so a page load landing between
 * the two reads an empty or partial chapter, and a process that dies in between
 * leaves one behind for good. Writing beside the target and moving it into
 * place means the path always holds either the old file or the new one.
 *
 * The staged file sits in the same directory as the target because a rename
 * is only atomic within one filesystem. It ends in .tmp so a directory listing
 * that collects *.json never mistakes one for a record.
 */
final class AtomicFile
{
    private const STAGING_SUFFIX = '.tmp';

    /** Replaces the file at $path, or creates it. */
    public static function write(string $path, string $contents): void
    {
        $staged = self::stage($path, $contents);

        // A rename swaps in a new file, which would otherwise take default
        // permissions rather than the ones the deployment gave the old one.
        // Kept, so a chapter the web server could read stays readable whoever
        // rewrote it (the nightly refresh may run as a different user).
        if (is_file($path)) {
            @chmod($staged, fileperms($path) & 0777);
        }

        if (! @rename($staged, $path)) {
            $reason = error_get_last()['message'] ?? 'unknown error';
            self::discard($staged);

            throw new RuntimeException("Could not move a new version into place at {$path}: {$reason}");
        }
    }

    /**
     * Creates the file at $path only if nothing is there yet.
     *
     * A hard link fails when its target exists, and the check and the creation
     * are one operation in the kernel, so two writers racing for the same path
     * cannot both win. Checking first and writing second can: both see nothing,
     * and the second silently replaces the first.
     *
     * @return bool false when something already held the path; nothing was written
     */
    public static function create(string $path, string $contents): bool
    {
        $staged = self::stage($path, $contents);

        try {
            if (@link($staged, $path)) {
                return true;
            }

            $reason = error_get_last()['message'] ?? 'unknown error';
            clearstatcache(true, $path);

            if (file_exists($path)) {
                return false;
            }

            // Some hosts' filesystems refuse hard links. An exclusive open is
            // just as safe against two writers; a reader may glimpse the file
            // mid-write, which is the lesser problem than refusing to create.
            return self::createExclusively($path, $contents)
                ?? throw new RuntimeException("Could not create {$path}: {$reason}");
        } finally {
            self::discard($staged);
        }
    }

    /**
     * Creates the file with an exclusive open: true when written, false when
     * something already held the path, null when it could not be created at all.
     */
    private static function createExclusively(string $path, string $contents): ?bool
    {
        $handle = @fopen($path, 'x');

        if ($handle === false) {
            clearstatcache(true, $path);

            return file_exists($path) ? false : null;
        }

        $written = fwrite($handle, $contents);
        fclose($handle);

        if ($written !== strlen($contents)) {
            @unlink($path);

            throw new RuntimeException("Could not write all of {$path}.");
        }

        return true;
    }

    /** Writes the contents beside the target under a name nobody else will pick. */
    private static function stage(string $path, string $contents): string
    {
        $staged = $path.'.'.bin2hex(random_bytes(6)).self::STAGING_SUFFIX;

        if (@file_put_contents($staged, $contents) !== strlen($contents)) {
            $reason = error_get_last()['message'] ?? 'short write';
            self::discard($staged);

            throw new RuntimeException("Could not write a new version of {$path}: {$reason}");
        }

        return $staged;
    }

    private static function discard(string $staged): void
    {
        if (is_file($staged)) {
            unlink($staged);
        }
    }
}
