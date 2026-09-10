<?php

declare(strict_types=1);

namespace App\Chapters;

use Illuminate\Support\Facades\File;
use InvalidArgumentException;

/**
 * Per-state coverage files, shared by every chapter in that state.
 *
 * One file per state, so the hundredth chapter in Georgia costs no more
 * Overpass traffic than the first.
 */
final class StateCoverageRepository
{
    public function __construct(private readonly string $directory) {}

    public function find(string $stateCode): ?StateCoverage
    {
        $path = $this->pathFor($stateCode);

        if (! File::exists($path)) {
            return null;
        }

        $decoded = json_decode(File::get($path), true);

        return is_array($decoded) ? StateCoverage::fromArray($decoded) : null;
    }

    public function save(StateCoverage $coverage): void
    {
        File::ensureDirectoryExists($this->directory);
        File::put(
            $this->pathFor($coverage->state),
            json_encode($coverage->toArray(), JSON_UNESCAPED_SLASHES),
        );
    }

    /** @return list<string> state codes we hold coverage for */
    public function states(): array
    {
        if (! File::isDirectory($this->directory)) {
            return [];
        }

        $codes = [];

        foreach (File::files($this->directory) as $file) {
            if ($file->getExtension() === 'json') {
                $codes[] = $file->getFilenameWithoutExtension();
            }
        }

        sort($codes);

        return $codes;
    }

    /** Allowlisted before it becomes a filename, like every other path here. */
    private function pathFor(string $stateCode): string
    {
        $code = strtoupper(trim($stateCode));

        if (preg_match('/\A[A-Z]{2}\z/', $code) !== 1) {
            throw new InvalidArgumentException("A state code must be two letters, got: {$stateCode}");
        }

        return $this->directory.DIRECTORY_SEPARATOR.$code.'.json';
    }
}
