<?php

declare(strict_types=1);

namespace App\Officials;

use App\Chapters\States;
use RuntimeException;

/**
 * The offices we have loaded, by state.
 *
 * Resolved when a page is requested rather than baked into the chapter file, so
 * adding a state fixes every existing chapter in it at once.
 *
 * A state we have not loaded yet returns nothing. The page then says so and
 * still gives the student the letter — an honest gap beats an invented address.
 */
final class OfficialsDirectory
{
    private const DATA_FILE = 'officials.json';

    /** @var array<string, array<string, mixed>>|null */
    private ?array $cache = null;

    public function __construct(private readonly string $dataPath) {}

    /** @return list<Official> */
    public function forState(string $stateCode): array
    {
        $code = strtoupper($stateCode);

        if (! States::exists($code)) {
            return [];
        }

        $entry = $this->load()[$code] ?? null;

        if ($entry === null) {
            return [];
        }

        return array_map(
            static fn (array $o): Official => Official::fromArray($o),
            $entry['officials'] ?? [],
        );
    }

    /** Where a student confirms which representative is actually theirs. */
    public function lookupUrl(string $stateCode): ?string
    {
        return $this->load()[strtoupper($stateCode)]['lookupUrl'] ?? null;
    }

    public function hasState(string $stateCode): bool
    {
        return isset($this->load()[strtoupper($stateCode)]);
    }

    /** @return array<string, array<string, mixed>> */
    private function load(): array
    {
        if ($this->cache !== null) {
            return $this->cache;
        }

        $file = rtrim($this->dataPath, '/').'/'.self::DATA_FILE;

        if (! is_file($file)) {
            throw new RuntimeException(
                "The officials directory is missing at {$file}. It ships with the "
                .'application, so an absent file means a broken deployment rather '
                .'than an empty dataset.'
            );
        }

        $decoded = json_decode((string) file_get_contents($file), true);

        if (! is_array($decoded)) {
            throw new RuntimeException("The officials directory at {$file} is not valid JSON.");
        }

        return $this->cache = $decoded;
    }
}
