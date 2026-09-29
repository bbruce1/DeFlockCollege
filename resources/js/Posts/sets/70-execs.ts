import type { PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, note, shout, sub, tag } from '@/Posts/kit';

/**
 * Execs: the people who run the plate-reader companies, in their own words.
 *
 * Every line in quotation marks is copied character for character from the
 * source noted beside it, and the caption names that source. The joke is only
 * ever the distance between what they said and what the cameras do; nobody is
 * accused of anything, and nothing is said about them as people.
 *
 * The two portraits are the companies' own: Motorola Solutions publishes Greg
 * Brown's as a press download, and Flock ran Garrett Langley's on the blog post
 * quoted below. Neither is freely licensed; they are here as commentary on what
 * each man said in public, and are credited to the company that released them.
 * A portrait only ever sits beside that person's own words — never a line he
 * did not say, and never a joke about him rather than about the cameras.
 */

// https://www.flocksafety.com/blog/flock-safety-ceo-principled-framework — Langley's
// own post: "Type of data - we collect the objective, indiscriminate evidence
// needed to solve crime."
const FRAMEWORK_PAGE = 'flocksafety.com/blog/flock-safety-ceo-principled-framework';
const INDISCRIMINATE_SENTENCE = 'we collect the objective, indiscriminate evidence needed to solve crime.';
const INDISCRIMINATE = 'indiscriminate';

// https://www.clickondetroit.com/news/local/2026/08/18/we-asked-flock-ceo-these-16-questions-heres-what-he-said/
// Langley to WDIV Local 4, Aug 18 2026: "It feels like yesterday, but nine years
// ago, I was sitting at my dining room table asking the question: Why does crime
// exist? ... So, I called two of my friends that I went to Georgia Tech with and
// said, 'We've got to build a camera that reads license plates.'"
const INTERVIEW_PAGE = 'clickondetroit.com/news/local/2026/08/18/we-asked-flock-ceo-these-16-questions-heres-what-he-said';
const DINING_TABLE_LINE = 'I was sitting at my dining room table asking the question: Why does crime exist?';
const WHY_CRIME = 'Why does crime exist?';
const BUILD_A_CAMERA = 'We’ve got to build a camera that reads license plates.';

// https://www.motorolasolutions.com/newsroom/press-releases/motorola-solutions-acquires-vaas-international-holdings-leader-in-data-and-.html
// Jan 7 2019, buying Vigilant's parent: "With this acquisition, VaaS will expand
// our command center software portfolio with the largest shareable database of
// vehicle location information ..." — said Greg Brown, chairman and CEO.
const VIGILANT_PAGE = 'motorolasolutions.com/newsroom (press release, jan 7 2019)';
const LARGEST_DATABASE = 'the largest shareable database of vehicle location information';

const RAZR = { photo: '/posts/execs/razr.jpg', credit: 'Photo: edusand / CC BY 2.0' };
const MOTOROLA_ROAD = { photo: '/posts/execs/motorola-road.jpg', credit: 'Photo: Varpxt / CC0' };
const PHARMACY = { photo: '/posts/execs/pharmacy.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };
// https://www.motorolasolutions.com/newsroom/leadership/greg-brown.html — the
// "download" rendition offered on Motorola Solutions' own leadership page.
const BROWN = { photo: '/posts/execs/brown.jpg', credit: 'Photo: Motorola Solutions press image' };
// The share image of the framework post quoted above, on flocksafety.com.
const LANGLEY = { photo: '/posts/execs/langley.jpg', credit: 'Photo: Flock Safety' };
const VALLEY = { photo: '/posts/execs/valley.jpg', credit: 'Photo: Tony Webster / CC BY 4.0' };

/** The chapter's surveyed count, or null before the survey — never a nought. */
function surveyedNearby(input: PostInput): number | null {
    const nearby = input.readersWithinMile;

    return typeof nearby === 'number' && nearby > 0 ? nearby : null;
}

/** "9,846 across Georgia", or null when either half is unknown. */
function statewide(input: PostInput): string | null {
    const inState = input.readersInState;

    return typeof inState === 'number' && inState > 0 && input.stateName
        ? `${count(inState)} across ${input.stateName}`
        : null;
}

/** One caption line with the local numbers, or nothing when there are none. */
function localLine(input: PostInput): string {
    const nearby = surveyedNearby(input);
    const state = statewide(input);

    if (nearby !== null && state !== null) {
        return `${count(nearby)} of these within a mile of ${input.shortName}, ${state}\n`;
    }

    if (nearby !== null) {
        return `${count(nearby)} of these within a mile of ${input.shortName}\n`;
    }

    return state !== null ? `there are ${state}\n` : '';
}

const family: PostFamily = (input) => {
    const nearby = surveyedNearby(input);
    const local = localLine(input);

    return [
        {
            id: 'execs-razr',
            kind: 'meme',
            purpose: 'Razr nostalgia, then the same company now: plate readers, and its CEO bragging about the database.',
            caption:
                'motorola went from the pink razr to license plate cameras 💀\n'
                + 'same company. the phones got spun off in 2011, and the part that stayed motorola bought vigilant in 2019\n'
                + local
                + `source: ${VIGILANT_PAGE}\n`
                + input.address,
            slides: [
                {
                    id: 'execs-razr-1',
                    ...RAZR,
                    tint: 'none',
                    focus: [0.5, 0.35],
                    alt: 'A hot-pink Motorola Razr flip phone, captioned: Motorola, before plate cameras. Iconic.',
                    blocks: [
                        tag('Motorola, before plate cameras'),
                        hook('ICONIC'),
                    ],
                },
                {
                    id: 'execs-razr-2',
                    ...MOTOROLA_ROAD,
                    tint: 'duotone',
                    focus: [0.45, 0.5],
                    alt: 'Two Motorola-branded license plate reader cameras on a pole, captioned: Motorola, now. Bro what.',
                    blocks: [
                        tag('Motorola, now'),
                        hook('BRO WHAT'),
                    ],
                },
                {
                    id: 'execs-razr-3',
                    ...BROWN,
                    tint: 'wash',
                    focus: [0.5, 0.5],
                    alt: `Motorola Solutions CEO Greg Brown's official portrait, captioned with his words from 2019 on buying Vigilant: "${LARGEST_DATABASE}"`,
                    blocks: [
                        // Both blocks sit below his face, over the suit.
                        tag('Motorola CEO Greg Brown, buying Vigilant, 2019', { at: 'lower' }),
                        note(`“${LARGEST_DATABASE}”`, { at: 'bottom', align: 'center' }),
                    ],
                },
            ],
        },
        {
            id: 'execs-indiscriminate',
            kind: 'meme',
            purpose: 'Flock’s own CEO called what it collects "indiscriminate". His word, on his blog.',
            caption:
                `flock’s ceo really put "${INDISCRIMINATE_SENTENCE}" on the company blog 💀\n`
                + 'he meant it as a flex\n'
                + local
                + `source: ${FRAMEWORK_PAGE}\n`
                + input.address,
            slides: [
                {
                    id: 'execs-indiscriminate-1',
                    ...LANGLEY,
                    tint: 'none',
                    focus: [0.5, 0.5],
                    alt: 'Flock CEO Garrett Langley smiling in a striped polo, captioned: plate camera CEO, on what his cameras collect. Bro what.',
                    blocks: [
                        tag('Plate camera CEO, on what his cameras collect', { at: 'middle' }),
                        hook('BRO WHAT'),
                    ],
                },
                {
                    id: 'execs-indiscriminate-2',
                    ...PHARMACY,
                    tint: 'duotone',
                    focus: [0.3, 0.5],
                    alt: `A Flock camera on a pole outside a drive-thru pharmacy, captioned with the word Flock's CEO used on his blog: "${INDISCRIMINATE}"`,
                    blocks: [
                        tag('His word. His blog.'),
                        ...(nearby === null
                            ? []
                            : [note(`${count(nearby)} of these within a mile of ${input.shortName}`, { at: 'lower', align: 'center' })]),
                        shout(`“${INDISCRIMINATE.toUpperCase()}”`),
                    ],
                },
            ],
        },
        {
            id: 'execs-crime-exist',
            kind: 'meme',
            purpose: 'Flock’s CEO asked the big question at his dining table. The answer he came up with was a plate camera.',
            caption:
                `flock’s ceo said "${DINING_TABLE_LINE}"\n`
                + `then he called his friends and said "${BUILD_A_CAMERA}" 💀\n`
                + local
                + `source: ${INTERVIEW_PAGE}\n`
                + input.address,
            slides: [
                {
                    id: 'execs-crime-exist-1',
                    ...LANGLEY,
                    tint: 'wash',
                    focus: [0.5, 0.5],
                    alt: `Flock CEO Garrett Langley, captioned with the question he recalls asking at his dining room table: "${WHY_CRIME}"`,
                    blocks: [
                        tag('Plate camera CEO, at his dining room table', { at: 'middle' }),
                        shout(`“${WHY_CRIME.toUpperCase()}”`),
                    ],
                },
                {
                    id: 'execs-crime-exist-2',
                    ...VALLEY,
                    tint: 'duotone',
                    focus: [0.52, 0.5],
                    alt: `A lone Flock camera on a pole in an empty valley, captioned with the answer Flock's CEO recalls giving: "${BUILD_A_CAMERA}"`,
                    blocks: [
                        tag('His answer'),
                        sub(`“${BUILD_A_CAMERA}”`, { at: 'lower' }),
                        ...(nearby === null
                            ? []
                            : [note(`${count(nearby)} of them within a mile of ${input.shortName} now 💀`, { at: 'bottom', align: 'center' })]),
                    ],
                },
            ],
        },
    ];
};

export default family;
