<?php

declare(strict_types=1);

namespace App\Chapters;

use Illuminate\Support\Facades\File;
use RuntimeException;

/**
 * Chapter storage. One JSON file per chapter, no database.
 *
 * Files live under storage/app/chapters so the application never writes into its
 * own source tree, which keeps deployment sane on hosts with a read-only
 * codebase.
 *
 * Every path is built from a validated Slug. A raw string never reaches the
 * filesystem, which is what makes traversal impossible rather than escaped.
 */
final class ChapterRepository
{
    public function __construct(private readonly string $directory) {}

    public function exists(Slug $slug): bool
    {
        return File::exists($this->pathFor($slug));
    }

    public function find(Slug $slug): ?Chapter
    {
        $path = $this->pathFor($slug);

        if (! File::exists($path)) {
            return null;
        }

        $decoded = json_decode(File::get($path), true);

        if (! is_array($decoded)) {
            throw new RuntimeException("Chapter file for \"{$slug}\" is not valid JSON.");
        }

        return Chapter::fromArray($decoded);
    }

    /** Convenience for routes, where the slug arrives as an unvalidated string. */
    public function findBySlugString(string $raw): ?Chapter
    {
        if (! Slug::isValid($raw)) {
            return null;
        }

        return $this->find(Slug::fromString($raw));
    }

    public function save(Chapter $chapter): void
    {
        $slug = Slug::fromString($chapter->slug);

        File::ensureDirectoryExists($this->directory);
        File::put(
            $this->pathFor($slug),
            json_encode($chapter->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n",
        );
    }

    public function delete(Slug $slug): bool
    {
        $path = $this->pathFor($slug);

        return File::exists($path) && File::delete($path);
    }

    /** @return array<int, Chapter> */
    public function all(): array
    {
        if (! File::isDirectory($this->directory)) {
            return [];
        }

        $chapters = [];

        foreach (File::files($this->directory) as $file) {
            if ($file->getExtension() !== 'json') {
                continue;
            }

            $decoded = json_decode($file->getContents(), true);

            if (is_array($decoded)) {
                $chapters[] = Chapter::fromArray($decoded);
            }
        }

        usort($chapters, static fn (Chapter $a, Chapter $b): int => strcmp($a->slug, $b->slug));

        return $chapters;
    }

    /** The chapter started from this domain, if any. One school, one chapter. */
    public function findByDomain(SchoolDomain $domain): ?Chapter
    {
        foreach ($this->all() as $chapter) {
            if ($chapter->ownerDomainMatches($domain)) {
                return $chapter;
            }
        }

        return null;
    }

    private function pathFor(Slug $slug): string
    {
        return $this->directory.DIRECTORY_SEPARATOR.$slug->value.'.json';
    }
}
