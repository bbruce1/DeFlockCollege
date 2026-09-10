/**
 * Ten looks a chapter page can wear.
 *
 * Every chapter renders the same sections in the same order, because the page
 * has a job and rearranging it would only make each one harder to use. What
 * varies is the skin: palette, type roles, the shape of the hero, and the
 * texture behind it. That is enough that two chapters never look alike, and
 * cheap enough that a new one is a few lines rather than a new codebase.
 *
 * A skin is data. It must never contain content.
 */

export type HeroShape = 'stack' | 'number-first' | 'split' | 'banner';
export type Texture = 'none' | 'scanlines' | 'grid' | 'dots' | 'noise';

export interface Skin {
    id: string;
    /** Palette. Every value is a colour; nothing here is a class name. */
    bg: string;
    surface: string;
    line: string;
    ink: string;
    inkSoft: string;
    accent: string;
    accentInk: string;
    /** Reserved for the cameras themselves, never for decoration. */
    signal: string;
    display: string;
    body: string;
    data: string;
    heroShape: HeroShape;
    texture: Texture;
    /** Corner radius in pixels, applied to surfaces and buttons. */
    radius: number;
    /** Whether labels are shouted or set normally. */
    upperLabels: boolean;
}

export const ARCHIVO = '"Archivo Variable", "Archivo", system-ui, sans-serif';
export const MONO = '"IBM Plex Mono", ui-monospace, monospace';
export const SERIF = 'ui-serif, Georgia, "Times New Roman", serif';

/**
 * Additional looks live one family per file in ./skins, and are collected here
 * at build time. Adding a family is dropping a file in; nothing shared has to be
 * edited, which is what lets several people extend the set at once.
 */
const CONTRIBUTED = Object.values(
    import.meta.glob<{ skins?: Skin[] }>('./skins/*.ts', { eager: true }),
).flatMap((module) => module.skins ?? []);

const BASE: Skin[] = [
    {
        id: 'terminal',
        bg: '#08090a', surface: '#0f1214', line: '#1e2529',
        ink: '#e6f1f5', inkSoft: '#7f9199',
        accent: '#22d3ee', accentInk: '#04191d', signal: '#f43f5e',
        display: ARCHIVO, body: MONO, data: MONO,
        heroShape: 'stack', texture: 'scanlines', radius: 0, upperLabels: true,
    },
    {
        id: 'dossier',
        bg: '#f4f1e8', surface: '#ffffff', line: '#d6cfbd',
        ink: '#17150f', inkSoft: '#6b6355',
        accent: '#1a3a8f', accentInk: '#ffffff', signal: '#b3261e',
        display: SERIF, body: SERIF, data: MONO,
        heroShape: 'split', texture: 'none', radius: 2, upperLabels: true,
    },
    {
        id: 'signal',
        bg: '#0a0f1c', surface: '#111a2e', line: '#22314f',
        ink: '#eaf2ff', inkSoft: '#8195b8',
        accent: '#6d4aff', accentInk: '#ffffff', signal: '#ff5d73',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'number-first', texture: 'grid', radius: 14, upperLabels: false,
    },
    {
        id: 'blueprint',
        bg: '#0d2135', surface: '#123049', line: '#2b5878',
        ink: '#e8f4ff', inkSoft: '#8fb4d0',
        accent: '#68d8ff', accentInk: '#04202f', signal: '#ffb020',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'banner', texture: 'grid', radius: 0, upperLabels: true,
    },
    {
        id: 'broadcast',
        bg: '#101010', surface: '#1a1a1a', line: '#2e2e2e',
        ink: '#f5f5f5', inkSoft: '#9a9a9a',
        accent: '#ffd400', accentInk: '#101010', signal: '#ff3b30',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'banner', texture: 'scanlines', radius: 0, upperLabels: true,
    },
    {
        id: 'manifest',
        bg: '#fbfbf9', surface: '#ffffff', line: '#e0e0da',
        ink: '#111111', inkSoft: '#666660',
        accent: '#111111', accentInk: '#ffffff', signal: '#d32f2f',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'stack', texture: 'none', radius: 4, upperLabels: false,
    },
    {
        id: 'circuit',
        bg: '#071410', surface: '#0d201a', line: '#1c3a30',
        ink: '#e4fff4', inkSoft: '#7ba997',
        accent: '#3ddc97', accentInk: '#04150f', signal: '#ff6b5e',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'number-first', texture: 'dots', radius: 8, upperLabels: true,
    },
    {
        id: 'surveil',
        bg: '#14090d', surface: '#1f1015', line: '#3a1f28',
        ink: '#ffeef2', inkSoft: '#b58995',
        accent: '#ff4d6d', accentInk: '#101010', signal: '#ffd166',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'split', texture: 'noise', radius: 18, upperLabels: false,
    },
    {
        id: 'ledger',
        bg: '#f7f5f0', surface: '#ffffff', line: '#ddd8cc',
        ink: '#1c1a17', inkSoft: '#6f6a5f',
        accent: '#0f6b4f', accentInk: '#ffffff', signal: '#a8321f',
        display: ARCHIVO, body: SERIF, data: MONO,
        heroShape: 'number-first', texture: 'none', radius: 2, upperLabels: true,
    },
    {
        id: 'wireframe',
        bg: '#ffffff', surface: '#fafafa', line: '#111111',
        ink: '#111111', inkSoft: '#555555',
        accent: '#2563eb', accentInk: '#ffffff', signal: '#dc2626',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'stack', texture: 'dots', radius: 0, upperLabels: true,
    },
];

export interface SchoolColours {
    primary: string;
    secondary: string;
    primaryIsDark: boolean;
    secondaryIsDark: boolean;
}

/** Relative luminance of a #rrggbb value, 0 (black) to 1 (white). */
function luminance(hex: string): number {
    const channel = (pair: string): number => {
        const value = parseInt(pair, 16) / 255;

        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };

    return (
        0.2126 * channel(hex.slice(1, 3)) +
        0.7152 * channel(hex.slice(3, 5)) +
        0.0722 * channel(hex.slice(5, 7))
    );
}

/**
 * Only dark grounds are in rotation.
 *
 * A page about being recorded reads better on a dark ground, and the light
 * families were the ones that looked generic: cream paper with a high-contrast
 * display face is the single most recognisable machine-generated look. Keeping
 * every chapter dark also means a student who has seen one recognises the next,
 * which is the whole growth mechanism.
 *
 * The light families are kept on disk rather than deleted, so this is one line
 * to lift if the brief ever changes.
 */
function isDarkGround(skin: Skin): boolean {
    return luminance(skin.bg) < 0.5;
}

/**
 * Every look a chapter can be assigned, base set first.
 *
 * Sorted by id so the order does not depend on how the filesystem happened to
 * enumerate the directory. A chapter's look must not change because a file was
 * added next to it.
 */
export const SKINS: Skin[] = [...BASE, ...CONTRIBUTED]
    .filter(isDarkGround)
    .sort((a, b) => a.id.localeCompare(b.id));


/** WCAG contrast ratio between two #rrggbb values. */
function contrast(a: string, b: string): number {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);

    return (light + 0.05) / (dark + 0.05);
}

/** #rrggbb to HSL, so a colour can be lightened without losing its hue. */
function toHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
        return [0, 0, l];
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h =
        max === r
            ? ((g - b) / d + (g < b ? 6 : 0)) / 6
            : max === g
              ? ((b - r) / d + 2) / 6
              : ((r - g) / d + 4) / 6;

    return [h, s, l];
}

function toHex(h: number, s: number, l: number): string {
    const f = (n: number): number => {
        const k = (n + h * 12) % 12;
        const a = s * Math.min(l, 1 - l);

        return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    };

    const channel = (n: number): string =>
        Math.round(Math.max(0, Math.min(1, f(n))) * 255)
            .toString(16)
            .padStart(2, '0');

    return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/**
 * Dresses a skin in a school's colours.
 *
 * The colour a creator typed is the colour their page uses. A school's palette
 * is chosen for a crest rather than for a screen, so a cardinal red or a navy
 * can sit too close to a dark background to be legible; the answer is to take
 * that same hue lighter or darker until it reads, not to throw it away and
 * substitute one the school never picked. Silently swapping in the skin's own
 * accent is how a page ends up purple when somebody asked for red.
 */
export function withSchoolColours(skin: Skin, colours?: SchoolColours | null): Skin {
    if (!colours) {
        return skin;
    }

    const chosen = [colours.primary, colours.secondary].filter((hex) =>
        /^#[0-9a-f]{6}$/i.test(hex),
    );

    if (chosen.length === 0) {
        return skin;
    }

    // Whichever of the two already reads best, then adjusted if it still falls
    // short. Both being the same colour is fine; this just picks that one.
    const preferred = chosen.sort((a, b) => contrast(b, skin.bg) - contrast(a, skin.bg))[0];
    const accent = legibleAgainst(preferred, skin.bg);

    return {
        ...skin,
        accent,
        accentInk: legibleInkOn(accent),
    };
}

/**
 * The label on a primary button, over whatever colour the school picked.
 *
 * The soft black the skins are written in reads better than pure black, but it
 * is not free: it carries luminance of its own, so against a mid-toned accent
 * both it and white land at 4.36:1 — under the 4.5:1 this directory's rules ask
 * for, on the one control the whole page exists to get pressed. Where the soft
 * black falls short the label goes to true black, which always clears it.
 */
function legibleInkOn(accent: string): string {
    const soft = contrast('#101010', accent) >= contrast('#ffffff', accent) ? '#101010' : '#ffffff';

    if (contrast(soft, accent) >= 4.5) {
        return soft;
    }

    return contrast('#000000', accent) >= contrast('#ffffff', accent) ? '#000000' : '#ffffff';
}

/**
 * Walks a colour's lightness until it clears 3:1 against the background,
 * keeping hue and saturation so it still reads as the school's colour.
 */
function legibleAgainst(hex: string, background: string): string {
    if (contrast(hex, background) >= 3) {
        return hex;
    }

    const [h, s] = toHsl(hex);
    const backgroundIsDark = luminance(background) < 0.5;

    let best = hex;
    let bestContrast = contrast(hex, background);

    // Step away from the background: lighter on a dark page, darker on a light
    // one. The first value that clears the threshold wins, so the colour moves
    // as little as it has to.
    for (let step = 1; step <= 20; step++) {
        const l = backgroundIsDark ? 0.5 + step * 0.025 : 0.5 - step * 0.025;
        const candidate = toHex(h, Math.max(s, 0.35), Math.min(Math.max(l, 0.05), 0.95));
        const ratio = contrast(candidate, background);

        if (ratio > bestContrast) {
            best = candidate;
            bestContrast = ratio;
        }

        if (ratio >= 3) {
            return candidate;
        }
    }

    return best;
}

/**
 * FNV-1a over the slug. A chapter keeps its look for as long as it keeps its
 * address, which matters because students recognise their own page.
 */
export function skinFor(slug: string, colours?: SchoolColours | null): Skin {
    let hash = 0x811c9dc5;

    for (let i = 0; i < slug.length; i++) {
        hash ^= slug.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }

    return withSchoolColours(SKINS[hash % SKINS.length], colours);
}

/** The skin as inline custom properties, so it lands with the first paint. */
export function skinVars(skin: Skin): React.CSSProperties {
    return {
        '--bg': skin.bg,
        '--surface': skin.surface,
        '--line': skin.line,
        '--ink': skin.ink,
        '--ink-soft': skin.inkSoft,
        '--accent': skin.accent,
        '--accent-ink': skin.accentInk,
        '--signal': skin.signal,
        '--display': skin.display,
        '--body': skin.body,
        '--data': skin.data,
        '--radius': `${skin.radius}px`,
    } as React.CSSProperties;
}
