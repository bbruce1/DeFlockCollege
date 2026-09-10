<?php

declare(strict_types=1);

namespace App\Maps;

use RuntimeException;

/**
 * The state outlines, read from the committed Census data file.
 *
 * Borders do not move, so they are not fetched at build time. Holding them here
 * takes the heaviest query out of every sweep: an `out geom` on a state
 * boundary relation made Overpass assemble the whole border node by node, and
 * there were fifty-one of them.
 *
 * Boundaries (c) US Census Bureau, TIGER/Line, public domain.
 */
final class StateBorders
{
    /** @var array<string, list<list<array{0: float, 1: float}>>>|null */
    private ?array $borders = null;

    public function __construct(private readonly string $path) {}

    /** Changes when the border file does, and not otherwise. */
    public function revision(): string
    {
        return is_file($this->path) ? (string) filemtime($this->path) : '0';
    }

    /**
     * The state's outline as rings of [latitude, longitude].
     *
     * @return list<list<array{0: float, 1: float}>>
     */
    public function ringsFor(string $stateCode): array
    {
        return $this->all()[strtoupper(trim($stateCode))] ?? [];
    }

    /** @return array<string, list<list<array{0: float, 1: float}>>> */
    private function all(): array
    {
        if ($this->borders !== null) {
            return $this->borders;
        }

        if (! is_file($this->path)) {
            throw new RuntimeException(
                "No border data at {$this->path}. Run `php artisan borders:fetch` to download it."
            );
        }

        $decoded = json_decode((string) file_get_contents($this->path), true);

        if (! is_array($decoded) || ! is_array($decoded['borders'] ?? null)) {
            throw new RuntimeException("The border data at {$this->path} is not readable.");
        }

        return $this->borders = $decoded['borders'];
    }
}
