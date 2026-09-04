/**
 * Board arithmetic for the Circuit template.
 *
 * Everything here is deterministic from the chapter slug. Trace routing has to
 * look hand-laid rather than gridded, but a board that re-routes itself on every
 * render would be noise, so the randomness is seeded and stable.
 */

/** Silkscreen reference designators, by the kind of part a section becomes. */
const WIDGET_PREFIX = 'U';
const PROSE_PREFIXES = ['R', 'C', 'L', 'D'] as const;

export function hashSeed(text: string): number {
    let hash = 0x811c9dc5;

    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }

    return hash >>> 0;
}

/** Mulberry32. Small, stable, and good enough to place vias with. */
export function makeRandom(seed: number): () => number {
    let state = seed >>> 0;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function designatorFor(kind: 'widget' | 'prose', index: number): string {
    if (kind === 'widget') {
        return `${WIDGET_PREFIX}${index + 2}`;
    }

    return `${PROSE_PREFIXES[index % PROSE_PREFIXES.length]}${index + 11}`;
}

/**
 * One routed net: down out of a pad, across on a jog, down into the next pad.
 * Corners are rounded rather than mitred so the trace survives the non-uniform
 * stretch the bus SVG applies to fill its width.
 */
export interface Trace {
    d: string;
    viaX: number;
    viaY: number;
    weight: number;
}

export function routeTraces(seed: number, count: number, height: number): Trace[] {
    const random = makeRandom(seed);
    const traces: Trace[] = [];

    for (let i = 0; i < count; i++) {
        const lane = (i + 1) / (count + 1);
        const startX = Math.round(lane * 1000 + (random() - 0.5) * 90);
        const endX = Math.round(lane * 1000 + (random() - 0.5) * 260);
        const jogY = Math.round(height * (0.28 + random() * 0.44));

        traces.push({
            d: `M ${startX} 0 L ${startX} ${jogY} L ${endX} ${jogY} L ${endX} ${height}`,
            viaX: endX,
            viaY: jogY,
            weight: random() > 0.62 ? 3 : 2,
        });
    }

    return traces;
}

/** A part number that reads as a real one and is derived from real values. */
export function partNumber(slug: string, readers: number): string {
    const stem = slug.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X');

    return `ALPR-${stem}-${String(readers).padStart(3, '0')}`;
}

export function compassPoint(bearing: number): string {
    const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    return points[Math.round((((bearing % 360) + 360) % 360) / 45) % 8];
}
