import type { Reader } from '../../contract';

/**
 * Section payloads arrive as `Record<string, unknown>` by contract, so every
 * value a widget draws is read through here rather than asserted. A malformed
 * payload falls back to a value the template already has, which keeps a bad
 * refresh from rendering NaN across a live chapter page.
 */

export function numberFrom(data: Record<string, unknown> | undefined, key: string, fallback: number): number {
    const value = data?.[key];

    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function isReader(value: unknown): value is Reader {
    return (
        Array.isArray(value) &&
        value.length >= 4 &&
        value.slice(0, 4).every((entry) => typeof entry === 'number' && Number.isFinite(entry))
    );
}

export function readersFrom(data: Record<string, unknown> | undefined, fallback: Reader[]): Reader[] {
    const value = data?.['readers'];

    if (!Array.isArray(value)) {
        return fallback;
    }

    const readers = value.filter(isReader);

    return readers.length > 0 ? readers : fallback;
}

/** Compass letter for a bearing, used in readouts beside every plotted reader. */
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export function compassOf(bearing: number): string {
    return COMPASS[Math.round((((bearing % 360) + 360) % 360) / 45) % 8];
}

export function count(value: number): string {
    return value.toLocaleString('en-US');
}
