<?php

declare(strict_types=1);

namespace App\Officials;

use InvalidArgumentException;

/**
 * How many times a chapter page has handed out letters.
 *
 * The library only works if consecutive readers get different letters. A
 * deterministic pick would hand the same paragraph to everyone who opened the
 * same page, which is precisely the form letter the rotation exists to avoid.
 *
 * One small file per chapter, incremented under an exclusive lock so two
 * simultaneous readers cannot land on the same number. No database, in keeping
 * with the rest of the application.
 *
 * It is deliberately not a metric. It counts pages rendered, not letters sent,
 * and nothing here should be reported as the latter.
 */
final class RotationCounter
{
    public function __construct(private readonly string $directory) {}

    /** Returns the next offset for this chapter, advancing it by one. */
    public function next(string $slug): int
    {
        $path = $this->pathFor($slug);

        if (! is_dir($this->directory)) {
            @mkdir($this->directory, 0775, true);
        }

        $handle = @fopen($path, 'c+');

        // A read-only deployment should still serve pages. Falling back to a
        // time-derived offset keeps letters varying even when nothing persists.
        if ($handle === false) {
            return (int) floor(microtime(true));
        }

        try {
            if (! flock($handle, LOCK_EX)) {
                return (int) floor(microtime(true));
            }

            $current = (int) trim((string) stream_get_contents($handle));
            $next = $current + 1;

            ftruncate($handle, 0);
            rewind($handle);
            fwrite($handle, (string) $next);
            fflush($handle);
            flock($handle, LOCK_UN);

            return $next;
        } finally {
            fclose($handle);
        }
    }

    public function current(string $slug): int
    {
        $path = $this->pathFor($slug);

        return is_file($path) ? (int) trim((string) file_get_contents($path)) : 0;
    }

    /**
     * Allowlisted before it becomes a filename, like every other path here.
     *
     * `\A` and `\z` rather than `^` and `$`. Nothing trims the slug on the way
     * in, and `$` also matches immediately before a trailing newline, so the
     * anchors alone are what stop "gatech\n" from becoming a filename that the
     * allowlist says cannot exist.
     */
    private function pathFor(string $slug): string
    {
        if (preg_match('/\A[a-z0-9][a-z0-9-]{0,30}[a-z0-9]\z/', $slug) !== 1) {
            throw new InvalidArgumentException("Not a usable chapter slug: {$slug}");
        }

        return rtrim($this->directory, '/').'/'.$slug.'.txt';
    }
}
