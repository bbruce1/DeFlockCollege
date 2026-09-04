import type { Reader } from '../contract';

/** Widget payloads are untyped by contract, so every read is checked here. */

export function numberFrom(data: Record<string, unknown> | undefined, key: string, fallback = 0): number {
    const value = data?.[key];

    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function isReader(value: unknown): value is Reader {
    return (
        Array.isArray(value)
        && value.length >= 4
        && value.every((entry) => typeof entry === 'number' && Number.isFinite(entry))
    );
}

export function readersFrom(data: Record<string, unknown> | undefined, key = 'readers'): Reader[] {
    const value = data?.[key];

    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter(isReader).map((reader) => [reader[0], reader[1], reader[2], reader[3]] as Reader);
}
