/**
 * The argument every chapter page makes, in the network's own words.
 *
 * Fixed rather than seeded. A chapter's job is to persuade somebody who has
 * never thought about plate readers, and the case for that does not improve by
 * being different at every school — it improves by being the same case, made
 * well, everywhere.
 *
 * Nothing here states a figure this project cannot stand behind. The numbers on
 * a chapter page come from OpenStreetMap and appear only where that data is
 * rendered; the copy below argues, and leaves counting to the counts.
 */

export interface Card {
    heading: string;
    body: string;
    /**
     * Where a reader can check the claim themselves.
     *
     * Most cards argue and need none. A card that says a named company sells a
     * named product is asserting a fact about somebody, and a fact about
     * somebody carries its source or it does not go on the page.
     */
    source?: { label: string; url: string };
}

export const PROBLEM: Card[] = [
    {
        heading: 'Searched without a warrant',
        body:
            'A plate reader records where a car was and when. Those records are searchable ' +
            'by the agencies that hold them, and in most places that search needs no warrant ' +
            'and no suspicion — only a login.',
    },
    {
        heading: 'Kept long after you pass',
        body:
            'A reader does not photograph suspects. It photographs everyone, and keeps the ' +
            'record for as long as the contract says. Retention windows are set by policy, ' +
            'and policy is easier to extend than to write.',
    },
    {
        heading: 'Held by a company',
        body:
            'The cameras around most campuses are not owned by the campus. They are a ' +
            'vendor service, and the record of your movements sits on that vendor’s ' +
            'systems under terms almost nobody driving past has read.',
    },
    {
        heading: 'Shared beyond who installed it',
        body:
            'Networks are built to be shared between agencies. A camera bought for one ' +
            'department’s stated purpose can be queried by others, including agencies ' +
            'the community that paid for it never voted for.',
    },
    {
        heading: 'Wrong often enough to matter',
        body:
            'Plate reads are automated, and automation misreads. A dirty plate or a bad ' +
            'match puts an innocent driver in a stop that begins with the assumption they ' +
            'are in a wanted car.',
    },
    {
        heading: 'Paid for out of the same budget',
        body:
            'Cameras are a recurring cost, renewed year after year. That money is not free ' +
            'money — it comes from the same budget as everything else the campus and the ' +
            'city could have chosen to fund instead.',
    },
];

export interface Source {
    outlet: string;
    headline: string;
    body: string;
    url: string;
}

/**
 * Every link here was checked before it shipped.
 *
 * Two are an organisation’s standing coverage rather than one article, because
 * a topic page keeps working when a single story is moved or renamed — and a
 * chapter page that cites a dead link argues against itself.
 */
export const EVIDENCE: Source[] = [
    {
        outlet: '404 Media',
        headline: 'Federal immigration agents reached a nationwide camera network',
        body:
            'Reporting showed ICE gaining access to plate reader data across the country, ' +
            'through local agencies rather than any federal contract of its own.',
        url: 'https://www.404media.co/ice-taps-into-nationwide-ai-enabled-camera-network-data-shows/',
    },
    {
        outlet: 'Electronic Frontier Foundation',
        headline: 'Continuing investigation into plate readers',
        body:
            'The EFF tracks how these networks are bought, shared, and used, and documents ' +
            'the cases where that use went past what was promised.',
        url: 'https://www.eff.org/issues/automated-license-plate-readers-alpr',
    },
    {
        outlet: 'ACLU',
        headline: 'Location tracking and the record it leaves',
        body:
            'On why a log of where a person has been is different in kind from a single ' +
            'photograph, and what having one changes.',
        url: 'https://www.aclu.org/issues/privacy-technology/location-tracking',
    },
];

/**
 * What a data broker sells about a person, and what it is then used for.
 *
 * Every label below is a real category from the Federal Trade Commission's
 * report on the data broker industry, which found a single broker holding three
 * thousand segments on nearly every American. "Ailment and prescription online
 * search propensity" is that report's wording, not ours.
 *
 * No values, and no name. Inventing a dossier for a made-up person would be
 * fabricating a record, which this page does not do even to make a point. What
 * is shown is the shape of the file, not somebody's file.
 *
 * Kept short on purpose. This section argues by showing a chain; prose is what
 * it is replacing.
 */
export interface Segment {
    label: string;
    value: string;
}

export const BROKER_SEGMENTS: Segment[] = [
    { label: 'Household income', value: 'Banded' },
    { label: 'Ailment and prescription search propensity', value: 'Scored' },
    { label: 'Political leanings', value: 'Inferred' },
    { label: 'Health conditions', value: 'Inferred' },
    { label: 'Ethnicity and country of origin', value: 'Inferred' },
    { label: 'Net worth and education', value: 'Banded' },
    { label: 'Who lives with you', value: 'Linked' },
];

export interface Step {
    node: string;
    caption: string;
    source?: { label: string; url: string };
}

/** Three moves, one line each. The diagram carries the argument. */
export const CHAIN: Step[] = [
    { node: 'Your plate', caption: 'Photographed in passing' },
    {
        node: 'Your name',
        caption: 'Matched by Flock’s people-lookup tool',
        source: {
            label: '404 Media',
            url: 'https://www.404media.co/license-plate-reader-company-flock-is-building-a-massive-people-lookup-tool-leak-shows/',
        },
    },
    {
        node: 'Your file',
        caption: 'Bought from data brokers',
        source: {
            label: 'FTC',
            url: 'https://www.ftc.gov/news-events/news/press-releases/2014/05/ftc-recommends-congress-require-data-broker-industry-be-more-transparent-give-consumers-greater',
        },
    },
];

export interface Consequence {
    what: string;
    detail: string;
    source?: { label: string; url: string };
}

/** What the file is worth to somebody. One line each. */
export const PRICED_IN: Consequence[] = [
    {
        what: 'Your insurance',
        detail: 'Motorola’s DRN sells insurers your car’s real location to reprice you.',
        source: { label: 'DRN', url: 'https://drndata.com/garage-aware/' },
    },
    {
        what: 'The price you are quoted',
        detail: 'The FTC found firms setting individual prices from data like yours.',
        source: {
            label: 'FTC',
            url: 'https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-surveillance-pricing-study-indicates-wide-range-personal-data-used-set-individualized-consumer',
        },
    },
    {
        what: 'Whatever is next',
        detail: 'Lenders and repossession firms already buy it. Nothing limits the rest.',
    },
];

export interface Question {
    question: string;
    answer: string;
}

export const FAQ: Question[] = [
    {
        question: 'What is an automated plate reader?',
        answer:
            'A camera that photographs every passing vehicle, reads the plate, and stores ' +
            'the plate, the time, and the location. Unlike a traffic camera it is not ' +
            'looking for an offence — it records everyone and keeps the result.',
    },
    {
        question: 'Do these cameras stop crime?',
        answer:
            'Vendors say so. Independent evidence is thinner than the marketing, and the ' +
            'strongest claims tend to come from the companies selling the cameras. That is ' +
            'a reason to ask the campus for its own figures before renewing a contract.',
    },
    {
        question: 'Is any of this illegal?',
        answer:
            'Mostly it is legal, which is the point. These systems were installed under ' +
            'rules written before they existed. Changing that is a decision for councils, ' +
            'campuses, and legislatures — which is why this asks you to write to them.',
    },
    {
        question: 'Who can see the data?',
        answer:
            'The agency that installed the cameras, the vendor that runs them, and — where ' +
            'networks are shared — other agencies entirely. The list is set by contract and ' +
            'by policy, and both can change without anyone driving past being told.',
    },
    {
        question: 'Where do the numbers on this page come from?',
        answer:
            'OpenStreetMap, where readers are mapped by volunteers. Every count is ' +
            'checkable by anyone, and every count is a floor: there are almost certainly ' +
            'cameras nobody has mapped yet.',
    },
    {
        question: 'What actually helps?',
        answer:
            'Writing to the offices that signed for the cameras, in your own words, and ' +
            'turning up where those decisions get made. Damaging a camera does the ' +
            'opposite — it hands the other side the only story they want.',
    },
];
