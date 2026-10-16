<?php

declare(strict_types=1);

namespace App\Chapters;

use App\Storage\AtomicFile;
use Illuminate\Support\Facades\File;
use RuntimeException;

/**
 * Chapters that were taken down, and must stay down.
 *
 * Deleting a chapter's file is not removal on its own: the slug is free again
 * the moment the file is gone, and anybody with a school address can put the
 * same page back up that afternoon. Removal within a day is what makes an open
 * creation model defensible (vision.md), so a removed slug is recorded here and
 * creation refuses it.
 *
 * Holds slugs and school domains only. A domain names an institution rather
 * than a person, which is why the chapter file already keeps it in the clear;
 * no address is ever written here (security.md).
 */
final class Blocklist
{
    public function __construct(private readonly string $path) {}

    public function blocksSlug(Slug $slug): bool
    {
        return isset($this->read()['slugs'][$slug->value]);
    }

    /** @param  string  $domain  A registrable school domain, e.g. "gatech.edu". */
    public function blocksDomain(string $domain): bool
    {
        return isset($this->read()['domains'][self::normaliseDomain($domain)]);
    }

    public function blockSlug(Slug $slug, ?string $reason): void
    {
        $entries = $this->read();
        $entries['slugs'][$slug->value] = self::entry($reason);

        $this->write($entries);
    }

    public function blockDomain(string $domain, ?string $reason): void
    {
        $normalised = self::normaliseDomain($domain);

        if ($normalised === '') {
            throw new RuntimeException('Cannot block an empty domain.');
        }

        $entries = $this->read();
        $entries['domains'][$normalised] = self::entry($reason);

        $this->write($entries);
    }

    /** @return array{slugs: array<string, mixed>, domains: array<string, mixed>} */
    private function read(): array
    {
        if (! File::exists($this->path)) {
            return ['slugs' => [], 'domains' => []];
        }

        $decoded = json_decode(File::get($this->path), true);

        // Loud rather than empty: a blocklist that silently reads as nothing
        // would let every removed chapter be made again.
        if (! is_array($decoded)) {
            throw new RuntimeException("The blocklist at {$this->path} is not valid JSON.");
        }

        return [
            'slugs' => (array) ($decoded['slugs'] ?? []),
            'domains' => (array) ($decoded['domains'] ?? []),
        ];
    }

    /** @param  array{slugs: array<string, mixed>, domains: array<string, mixed>}  $entries */
    private function write(array $entries): void
    {
        ksort($entries['slugs']);
        ksort($entries['domains']);

        File::ensureDirectoryExists(dirname($this->path));
        AtomicFile::write(
            $this->path,
            json_encode($entries, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n",
        );
    }

    /** @return array{reason: string|null, date: string} */
    private static function entry(?string $reason): array
    {
        $reason = $reason === null ? null : trim($reason);

        return [
            'reason' => $reason === '' ? null : $reason,
            'date' => now()->toDateString(),
        ];
    }

    private static function normaliseDomain(string $domain): string
    {
        return strtolower(trim($domain));
    }
}
