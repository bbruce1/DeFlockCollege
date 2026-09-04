/**
 * The contract every chapter template builds against.
 *
 * Ten templates exist and a chapter is assigned one by a seed derived from its
 * slug, so two schools never get the same page. They share nothing but this
 * interface and the token names below: no layout, no components, no type scale.
 * That is the point — swapping text into one layout is what this replaces.
 *
 * A template may do anything it likes visually. It may not:
 *   - change the hero wording, which is identical across the network so a
 *     student who has seen one chapter recognises the next
 *   - drop the three commitments (Instagram, no vandalism, not affiliated)
 *   - hide a value behind an animation: every number must be correct in the DOM
 *     at first paint, with motion as enhancement only
 *   - render any campus string as HTML. They are user-supplied.
 */

/** [x, y, bearingDegrees or -1, isFlock] in a shared 0-1000 space. */
export type Reader = [number, number, number, number];

/** [tier, [x, y, x, y, ...]] where tier 0 is an arterial and 3 a service road. */
export type StreetWay = [number, number[]];

export interface ChapterMap {
    aspect: number;
    streets: StreetWay[];
    readers: Reader[];
    readersWithinMile: number;
    flockCount: number;
    readersInState: number;
    bbox: string;
    generatedAt: string;
    previous: { readersWithinMile: number; readersInState: number; generatedAt: string } | null;
}

export interface Chapter {
    slug: string;
    schoolName: string;
    shortName: string;
    state: string;
    instagram: string | null;
    tiktok: string | null;
    status: 'live' | 'empty';
    map: ChapterMap;
}

/** One composed section, chosen and ordered on the server. */
export interface Section {
    id: string;
    kind: 'widget' | 'prose';
    label: string;
    /** May contain a single <em>, which templates render as their accent. */
    headline: string;
    body: string;
    treatment?: string;
    data?: Record<string, unknown>;
}

export interface TemplateProps {
    chapter: Chapter;
    sections: Section[];
    /** Derived server-side so the value is right before any script runs. */
    coverage: number;
    stateName: string;
}

/**
 * Every template themes itself by setting these on its root. Naming them here is
 * what lets shared pieces — the commitments, the outreach block — sit inside any
 * template without knowing which one they are in.
 */
export interface TemplateTokens {
    '--t-bg': string;
    '--t-surface': string;
    '--t-line': string;
    '--t-ink': string;
    '--t-ink-soft': string;
    '--t-accent': string;
    '--t-accent-ink': string;
    '--t-signal': string;
    '--t-display': string;
    '--t-body': string;
    '--t-data': string;
}

/** The wording that never changes, on any template. */
export const FIXED = {
    heroHeadline: 'You are being',
    heroAccent: 'flocked',
    heroCta: 'Help push back',
    commitments: {
        instagram: {
            label: 'The one thing we cannot make for you',
            headline: 'Make the Instagram.',
        },
        conduct: {
            label: 'How this is done',
            headline: 'Emails and votes. Never vandalism.',
            body:
                'Do not touch, damage, obstruct, or interfere with these cameras. It is a ' +
                'crime, it hands every opponent the story they want, and in many states a ' +
                'conviction costs you the vote you are trying to use. Lasting change is won ' +
                'in public meetings.',
        },
        affiliation: {
            label: 'Who runs this',
            headline: 'Students. Not the school.',
        },
    },
} as const;

/** Splits "one <em>word</em> here" so a template can style the emphasis itself. */
export function splitEmphasis(text: string): { before: string; accent: string; after: string } {
    const match = text.match(/^(.*?)<em>(.*?)<\/em>(.*)$/s);

    if (!match) {
        return { before: text, accent: '', after: '' };
    }

    return { before: match[1], accent: match[2], after: match[3] };
}
