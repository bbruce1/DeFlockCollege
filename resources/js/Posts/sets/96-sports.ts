import type { Post, PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, note, shout, sub, tag } from '@/Posts/kit';

/**
 * The sports page: the recruiting graphic and the replay review. The plate
 * camera plays the athlete, because a feed that follows
 * college sports accounts already knows how these graphics read.
 *
 * Slide 1 names the camera or shows one up close, so the bait is the format and
 * the twist is somewhere else: how many of him there are, what the replay
 * shows. The only claims are what every plate reader
 * does (photographs each passing car, reads the plate, keeps the time and
 * place), and the only number is the chapter's own count. No stat line, grade
 * or contract here is real, so none of them is written as if it were.
 */

// Borrowed from the news set: a glossy camera on a dark ground reads as a
// player portrait, which is what a commit graphic is.
const PORTRAIT = { photo: '/posts/news/la-crosse-close.jpg', credit: 'Photo: Snoowastaken / CC0' };
// Two cameras on one pole: "the boys".
const THE_BOYS = { photo: '/posts/hypocrisy/dual.jpg', credit: 'Photo: Epicdeflocker64 / CC0' };
const MAIN_STREET = { photo: '/posts/hypocrisy/street.jpg', credit: 'Photo: Bruxton / CC0' };
const NIGHT_CORNER = { photo: '/posts/receipts/night.jpg', credit: 'Photo: Themis3000 / CC0' };
const CAR_PASSING = { photo: '/posts/receipts/passing.jpg', credit: 'Photo: Themis3000 / CC0' };
const SIDE_ROAD = { photo: '/posts/formats/night.jpg', credit: 'Photo: BigPipNic / CC0' };

/** The chapter's count within a mile, or null before a survey or when it is nought. */
function surveyedNearby(input: PostInput): number | null {
    const nearby = input.readersWithinMile;

    return typeof nearby === 'number' && nearby > 0 ? nearby : null;
}

/** "\nthere's 52 of them within a mile of campus", or nothing before a survey. */
function howManyNearby(input: PostInput): string {
    const nearby = surveyedNearby(input);

    if (nearby === null) {
        return '';
    }

    return nearby === 1
        ? '\nthere\'s one within a mile of campus'
        : `\nthere are ${count(nearby)} of them within a mile of campus`;
}

/**
 * The commit graphic. Its twist is the count, so it is only offered once the
 * campus has been surveyed and something was found.
 */
function commitPost(input: PostInput, nearby: number): Post {
    const others = nearby - 1;
    const entourage = others === 0
        ? 'He came solo'
        : others === 1
            ? 'And he brought one of the boys'
            : `And he brought ${count(others)} of the boys`;

    return {
        id: 'sports-commit',
        kind: 'meme',
        purpose: 'A 5-star recruit commit graphic. The recruit is a plate camera, and the reveal is how many of him are within a mile of campus.',
        caption:
            `huge commit for ${input.shortName.toLowerCase()}${others === 0 ? '' : ', and he brought the whole squad'} 💀\n`
            + 'every car that drives past gets photographed, plate read, time and place kept'
            + howManyNearby(input)
            + `\n\n${input.address}`,
        slides: [
            {
                id: 'sports-commit-1',
                ...PORTRAIT,
                tint: 'none',
                // The camera sits dead centre on its dark ground, so the tag
                // takes the empty top and the hook the empty bottom.
                focus: [0.5, 0.5],
                alt: 'A license plate camera up close on its pole against a dark background, like a recruit portrait, with the words: 5-star plate camera commit. Who\'s he watching?',
                blocks: [
                    tag('🚨 5-star plate camera commit'),
                    hook('Who\'s he watching?'),
                ],
            },
            {
                id: 'sports-commit-2',
                ...THE_BOYS,
                tint: 'duotone',
                // Both cameras hang in the middle of a wide frame: the tag goes
                // above the solar panel, the line below the cameras.
                focus: [0.5, 0.5],
                alt: `Two license plate cameras on one pole, with the words: committed, within a mile of ${input.shortName}. ${entourage}.`,
                blocks: [
                    tag(`Committed: within a mile of ${input.shortName}`),
                    shout(entourage),
                ],
            },
            {
                id: 'sports-commit-3',
                ...MAIN_STREET,
                tint: 'wash',
                focus: [0.5, 0.25],
                alt: 'A license plate camera on a green pole above a main street, with a scouting report: position, pole. Strengths: sees every car that drives by, never forgets a plate. Weaknesses: a city council vote.',
                blocks: [
                    tag('Scouting report'),
                    sub('Position: pole', { at: 'upper' }),
                    note(
                        'Strengths: sees every car that drives by, never forgets a plate.\nWeaknesses: a city council vote.',
                        { at: 'bottom' },
                    ),
                ],
            },
        ],
    };
}

const family: PostFamily = (input) => {
    const nearby = surveyedNearby(input);

    return [
        ...(nearby === null ? [] : [commitPost(input, nearby)]),
        {
            id: 'sports-review',
            kind: 'meme',
            purpose: 'The replay review, on your alibi. The plate camera is the booth, and the call on the field gets overturned.',
            caption:
                'told everyone i was at the library and the plate camera said otherwise 💀\n'
                + 'it keeps the time and place of every car that drives past, not just yours'
                + howManyNearby(input)
                + `\n\n${input.address}`,
            slides: [
                {
                    id: 'sports-review-1',
                    ...NIGHT_CORNER,
                    tint: 'duotone',
                    // Pinned to the top so the camera rides the pole under the
                    // tag and the snowy street takes the hook.
                    focus: [0.5, 0],
                    alt: 'A license plate camera on a pole over a city street at dusk, with the words: I was at the library all night. Checking the plate camera. Under review.',
                    blocks: [
                        tag('“I was at the library all night”\nChecking the plate camera 📺'),
                        hook('Under review'),
                    ],
                },
                {
                    id: 'sports-review-2',
                    ...CAR_PASSING,
                    tint: 'wash',
                    focus: [0.5, 0.45],
                    alt: 'A car driving past a license plate camera on a snowy corner, with the words: after review. Your car, by the frat house, 1:40am.',
                    blocks: [
                        tag('After review'),
                        shout('Your car. By the frat house. 1:40am'),
                    ],
                },
                {
                    id: 'sports-review-3',
                    ...SIDE_ROAD,
                    tint: 'duotone',
                    // The camera stands on the right of the frame, lit by the car park.
                    focus: [0.5, 0.55],
                    alt: 'A plate reader on a pole beside a road at night, with the words: the call on the field is overturned. It keeps the time and place of every car that drives past. Not just yours.',
                    blocks: [
                        tag('The call on the field is'),
                        hook('Overturned', { at: 'upper' }),
                        note('It keeps the time and place of every car that drives past. Not just yours.', { at: 'bottom' }),
                    ],
                },
            ],
        },
    ];
};

export default family;
