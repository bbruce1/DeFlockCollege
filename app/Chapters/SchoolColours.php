<?php

declare(strict_types=1);

namespace App\Chapters;

use InvalidArgumentException;

/**
 * The two colours a creator gives for their school.
 *
 * These reach the browser inside a style attribute, which makes them the one
 * piece of creator input that becomes code rather than text. They are therefore
 * matched against a strict six-digit hex pattern and rebuilt from that match
 * rather than escaped: anything that is not exactly a colour is refused, so
 * there is nothing left for a value like `red;background:url(...)` to do.
 */
final readonly class SchoolColours
{
    private const PATTERN = '/^#[0-9a-f]{6}$/';

    public function __construct(public string $primary, public string $secondary) {}

    public static function fromInput(?string $primary, ?string $secondary): ?self
    {
        $primary = self::clean($primary);
        $secondary = self::clean($secondary);

        // Both or neither. One colour is not a palette, and a half-set pair
        // makes a page look broken rather than themed.
        if ($primary === null || $secondary === null) {
            return null;
        }

        return new self($primary, $secondary);
    }

    private static function clean(?string $value): ?string
    {
        $value = strtolower(trim((string) $value));

        if ($value === '') {
            return null;
        }

        if (! str_starts_with($value, '#')) {
            $value = '#'.$value;
        }

        // Expand the three-digit shorthand before checking, since a colour
        // picker may hand back either form.
        if (preg_match('/\A#([0-9a-f])([0-9a-f])([0-9a-f])\z/', $value, $short) === 1) {
            $value = '#'.$short[1].$short[1].$short[2].$short[2].$short[3].$short[3];
        }

        if (preg_match(self::PATTERN, $value) !== 1) {
            throw new InvalidArgumentException(
                "\"{$value}\" is not a colour. Use a six-digit hex value such as #003057."
            );
        }

        return $value;
    }

    /** Relative luminance, for choosing readable text over the colour. */
    public function primaryIsDark(): bool
    {
        return self::isDark($this->primary);
    }

    public function secondaryIsDark(): bool
    {
        return self::isDark($this->secondary);
    }

    private static function isDark(string $hex): bool
    {
        $channels = array_map(
            static function (int $value): float {
                $channel = $value / 255;

                return $channel <= 0.03928
                    ? $channel / 12.92
                    : (($channel + 0.055) / 1.055) ** 2.4;
            },
            [
                (int) hexdec(substr($hex, 1, 2)),
                (int) hexdec(substr($hex, 3, 2)),
                (int) hexdec(substr($hex, 5, 2)),
            ],
        );

        $luminance = 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];

        return $luminance < 0.45;
    }

    public function toArray(): array
    {
        return [
            'primary' => $this->primary,
            'secondary' => $this->secondary,
            'primaryIsDark' => $this->primaryIsDark(),
            'secondaryIsDark' => $this->secondaryIsDark(),
        ];
    }

    public static function fromArray(?array $data): ?self
    {
        if (! is_array($data) || ! isset($data['primary'], $data['secondary'])) {
            return null;
        }

        try {
            return self::fromInput($data['primary'], $data['secondary']);
        } catch (InvalidArgumentException) {
            // A stored value that no longer validates is dropped rather than
            // rendered: the page falls back to its skin's own palette.
            return null;
        }
    }
}
