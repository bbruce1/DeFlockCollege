import type { Reader } from '../contract';

/**
 * Section payloads arrive as Record<string, unknown> because the server composes
 * them per campus. Coercing at this boundary keeps every component below it
 * working with real numbers rather than defensive casts.
 */

export function figure(data: Record<string, unknown> | undefined, key: string): number {
    const value = data?.[key];

    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function isReader(value: unknown): value is Reader {
    return (
        Array.isArray(value) &&
        value.length >= 4 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number' &&
        typeof value[2] === 'number' &&
        typeof value[3] === 'number'
    );
}

export function readerList(data: Record<string, unknown> | undefined, key: string): Reader[] {
    const value = data?.[key];

    return Array.isArray(value) ? value.filter(isReader) : [];
}

export function aspectOf(data: Record<string, unknown> | undefined, fallback: number): number {
    const value = figure(data, 'aspect');

    return value > 0 ? value : fallback;
}

export const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export function compassOf(bearing: number): string {
    return COMPASS[Math.round((((bearing % 360) + 360) % 360) / 45) % 8];
}

export function count(value: number): string {
    return value.toLocaleString('en-US');
}

/** Instagram and TikTok handles are stored bare, so the URL is built here. */
export function socialUrl(platform: 'instagram' | 'tiktok', handle: string): string {
    const path = platform === 'tiktok' ? `@${handle}` : handle;

    return `https://www.${platform}.com/${encodeURIComponent(path)}/`;
}
