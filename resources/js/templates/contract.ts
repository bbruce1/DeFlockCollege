/**
 * The shape of a chapter page, and the wording that never varies.
 *
 * A chapter page has one job: get somebody to send the letter, sign the
 * petition, and follow the Instagram. The structure below is the same on every
 * chapter so a student who has used one knows how to use the next; only the
 * skin changes. Variation is visual, never structural.
 */

export interface ReaderSurvey {
    point: string;
    /** Null when OpenStreetMap could not be reached. Never shown as 0. */
    readersWithinMile: number | null;
    flockCount: number | null;
    /** Null when OpenStreetMap could not be reached for it. Never shown as 0. */
    readersInState: number | null;
    generatedAt: string;
    previous: { readersWithinMile: number; readersInState: number } | null;
}

export interface SchoolColours {
    primary: string;
    secondary: string;
    primaryIsDark: boolean;
    secondaryIsDark: boolean;
}

export interface Meeting {
    date: string;
    time: string | null;
    place: string;
    note: string;
}

export interface Chapter {
    slug: string;
    /** The chapter's own address — its subdomain where one is configured. */
    url: string;
    schoolName: string;
    shortName: string;
    state: string;
    city: string;
    instagram: string | null;
    petitionUrl: string | null;
    /** Every meeting the creator has entered, past ones included. */
    meetings: Meeting[];
    status: 'live' | 'empty';
    colours: SchoolColours | null;
    officials: Official[];
    survey: ReaderSurvey;
}

export interface Official {
    name: string;
    title: string;
    email: string | null;
    url: string | null;
    role: string;
    roleLabel: string;
    scope: string;
}

export interface PageProps {
    chapter: Chapter;
    stateName: string;
    officials: Official[];
    lookupUrl: string | null;
    canonical: string;
}

/** The wording that is identical on every chapter in the network. */
export const FIXED = {
    heroLead: 'You are being',
    heroAccent: 'flocked',
    heroCta: 'Help push back',
    conduct: {
        label: 'How this is done',
        headline: 'Never vandalize',
        body:
            'Do not touch, damage, obstruct, or interfere with these cameras. It is a ' +
            'crime, it hands every opponent the story they want, and in many states a ' +
            'conviction costs you the vote you are trying to use. This is won in public ' +
            'meetings, not at the base of a pole.',
    },
    affiliation: {
        label: 'Who runs this',
        headline: 'Run by students',
        body:
            'This chapter is run by students. It is not affiliated with, endorsed by, or ' +
            'operated by the school, and the accounts it links to are not moderated by ' +
            'DeFlock.',
    },
    instagram: {
        // Addressed to whoever is reading, not to the person who built the page.
        // The account exists by the time anybody sees this: creating one is a
        // condition of starting a chapter, so asking for it here would be
        // talking to somebody who is not in the room.
        label: 'Where this chapter actually happens',
        headline: 'Instagram',
        body: 'Following it is how you hear about the next meeting.',
    },
    ask: 'Removal of the readers, and a ban on new installations.',
} as const;


/**
 * At or below this many readers within a mile, the campus figure stops being
 * evidence and starts being an anticlimax — a giant "1" over "automated plate
 * readers are mapped within a mile" argues against the page it sits on. The
 * statewide figure leads instead; the campus one is still reported, just not
 * set at display size.
 */
export const SPARSE_MAX = 2;
