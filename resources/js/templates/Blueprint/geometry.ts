import type { Reader, StreetWay } from '../contract';

/**
 * Plan geometry.
 *
 * Streets and readers arrive already projected into a shared 0-1000 space, one
 * thousand tall and one thousand times the aspect wide. Nothing here invents a
 * distance: the drawing is dimensionless by design, because the source data
 * carries no scale that could be printed honestly.
 */

const SPACE_HEIGHT = 1000;

/** Lineweight by road class, thickest for arterials, as a plan would draw them. */
const TIER_WEIGHT = [3.2, 2.1, 1.3, 0.7];
const TIER_OPACITY = [0.95, 0.72, 0.5, 0.34];

export interface PlanBounds {
    width: number;
    height: number;
}

export function planBounds(aspect: number): PlanBounds {
    return { width: SPACE_HEIGHT * (aspect > 0 ? aspect : 1), height: SPACE_HEIGHT };
}

export function tierWeight(tier: number): number {
    return TIER_WEIGHT[Math.min(Math.max(Math.trunc(tier), 0), TIER_WEIGHT.length - 1)];
}

export function tierOpacity(tier: number): number {
    return TIER_OPACITY[Math.min(Math.max(Math.trunc(tier), 0), TIER_OPACITY.length - 1)];
}

/** Flat [x, y, x, y, ...] to an SVG path. Odd-length tails are dropped. */
export function wayPath(points: number[]): string {
    const usable = points.length - (points.length % 2);

    if (usable < 4) {
        return '';
    }

    let path = `M ${points[0]} ${points[1]}`;

    for (let i = 2; i < usable; i += 2) {
        path += ` L ${points[i]} ${points[i + 1]}`;
    }

    return path;
}

export function drawableWays(streets: StreetWay[]): StreetWay[] {
    return streets.filter((way) => Array.isArray(way?.[1]) && way[1].length >= 4);
}

export function normaliseDegrees(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
}

/** Point on a circle for a compass bearing, north up, bearings clockwise. */
export function polar(cx: number, cy: number, bearing: number, radius: number): { x: number; y: number } {
    const radians = (bearing * Math.PI) / 180;

    return { x: cx + Math.sin(radians) * radius, y: cy - Math.cos(radians) * radius };
}

export const SECTOR_COUNT = 24;
export const SECTOR_DEGREES = 360 / SECTOR_COUNT;

export function headingSectors(readers: Reader[]): Set<number> {
    const sectors = new Set<number>();

    for (const reader of readers) {
        if (reader[2] >= 0) {
            sectors.add(Math.floor(normaliseDegrees(reader[2]) / SECTOR_DEGREES) % SECTOR_COUNT);
        }
    }

    return sectors;
}

/** Grid reference for a reader, so a symbol on the plan is findable in the schedule. */
export function gridReference(x: number, y: number, bounds: PlanBounds): string {
    const column = Math.min(Math.floor((x / bounds.width) * 8), 7);
    const row = Math.min(Math.floor((y / bounds.height) * 6), 5);

    return `${'ABCDEF'[row]}${column + 1}`;
}
