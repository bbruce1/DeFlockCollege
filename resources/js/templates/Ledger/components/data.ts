import type { Reader } from '../../contract';

/**
 * Section `data` arrives as `Record<string, unknown>`, so every read is narrowed
 * here rather than asserted at the call site. A widget whose data does not match
 * what it needs renders nothing instead of NaN.
 */

export const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

/** The server computes horizon coverage in 15 degree sectors; the ladder matches. */
export const SECTOR_DEGREES = 15;

export const SECTOR_COUNT = 360 / SECTOR_DEGREES;

export function numberFrom(data: Record<string, unknown> | undefined, key: string): number | null {
    const value = data?.[key];

    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function readersFrom(data: Record<string, unknown> | undefined, key: string): Reader[] | null {
    const value = data?.[key];

    if (!Array.isArray(value)) {
        return null;
    }

    const rows = value.filter(
        (row): row is Reader =>
            Array.isArray(row) && row.length >= 4 && row.every((cell) => typeof cell === 'number'),
    );

    return rows.length > 0 ? rows : null;
}

export function formatCount(value: number): string {
    return Number.isFinite(value) ? Math.round(value).toLocaleString('en-US') : '--';
}

/** Two decimals, because a desk quotes a share to the basis point it can defend. */
export function formatShare(numerator: number, denominator: number): string {
    if (denominator <= 0) {
        return '--';
    }

    return `${((numerator / denominator) * 100).toFixed(2)}%`;
}

export function normaliseBearing(bearing: number): number {
    return ((bearing % 360) + 360) % 360;
}

export function compassPoint(bearing: number): string {
    return COMPASS_POINTS[Math.round(normaliseBearing(bearing) / 45) % 8];
}

export function sectorOf(bearing: number): number {
    return Math.floor(normaliseBearing(bearing) / SECTOR_DEGREES);
}

/** Which 15 degree sectors of the horizon have at least one reader pointed into them. */
export function coveredSectors(readers: Reader[]): Set<number> {
    return new Set(
        readers.filter((reader) => reader[2] >= 0).map((reader) => sectorOf(reader[2])),
    );
}

export function padSectorLabel(sector: number): string {
    return String(sector * SECTOR_DEGREES).padStart(3, '0');
}
