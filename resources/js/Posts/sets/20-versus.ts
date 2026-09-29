import type { Post, PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, shout, sub, tag } from '@/Posts/kit';

/**
 * Comparisons and rankings: the meme-account bait-and-switch.
 *
 * Slide one sets up a harmless contest, slide two hands the win to the camera.
 * The joke only ever lands on the surveillance. Mom is the runner-up, never the
 * punchline, and nobody real is pictured on either side.
 */

// A pole you would drive past every day without looking up. The camera is up
// there, which is the point: slide one has to read as nothing at all.
const STREET = { photo: '/posts/versus/street.jpg', credit: 'Photo: LemononoM / CC0' };
// The same kind of pole, close enough that there is no mistaking what it is.
const REVEAL = { photo: '/posts/versus/reveal.jpg', credit: 'Photo: MeridioOceano / CC0' };
const CAMERA_CLOSE = { photo: '/posts/versus/camera-close.jpg', credit: 'Photo: Bruxton / CC0' };
const QUAD = { photo: '/posts/versus/quad.jpg', credit: 'Photo: IMCBerea College / CC BY 2.0' };

/** Past this, "FLOCK RATES <school>" is too long for the wide shout and drops to the condensed one. */
const RATING_HOOK_MAX_CHARACTERS = 24;

/** The chapter's surveyed count, or null when there is nothing honest to print. */
function nearbyCount(input: PostInput): number | null {
    const nearby = input.readersWithinMile;

    return typeof nearby === 'number' && nearby > 0 ? nearby : null;
}

function mostPhotos(input: PostInput): Post {
    const nearby = nearbyCount(input);
    const local = nearby === null ? '' : `there are ${count(nearby)} of them within a mile of campus\n\n`;

    return {
        id: 'versus-mom',
        kind: 'meme',
        purpose: 'Bait-and-switch ranking. Works before the campus is surveyed.',
        caption:
            'sorry mom 💀 that pole on slide 1 is a plate reader and it gets you every time you drive past\n\n'
            + local
            + input.address,
        slides: [
            {
                id: 'versus-mom-1',
                ...STREET,
                // Left untinted so it looks like any photo of any street; slide
                // two goes into the school's colours, and that change is the swipe.
                tint: 'none',
                // Held near the top so the camera stays in frame under the tag,
                // with the hook down on the empty road.
                focus: [0.5, 0.15],
                alt: 'An ordinary street corner with a plain black pole on the grass, with the words: most photos of your car: your mom.',
                blocks: [
                    tag('Most photos of your car'),
                    hook('Your mom'),
                ],
            },
            {
                id: 'versus-mom-2',
                ...REVEAL,
                tint: 'duotone',
                // Pinned to the bottom of a tall frame so the lens rides high,
                // under the tag, and the result goes on the bare pole below.
                focus: [0.5, 1],
                alt: 'A Flock license plate camera strapped to a pole, lens facing you, with the words: updated rankings. 1. this pole, 2. your mom.',
                blocks: [
                    tag('Updated rankings'),
                    // Condensed so the result stays on one line, under the lens.
                    shout('1. This pole', { at: 'lower' }),
                    sub('2. Your mom', { at: 'bottom' }),
                ],
            },
        ],
    };
}

/** "FLOCK RATES GEORGIA TECH", in the narrower shout when the school's name is long. */
function ratingHeadline(shortName: string) {
    const headline = `Flock rates ${shortName}`;

    return headline.length <= RATING_HOOK_MAX_CHARACTERS ? hook(headline) : shout(headline);
}

function flockRates(input: PostInput): Post[] {
    const nearby = nearbyCount(input);

    // The payoff is the number. Without a survey there is no punchline, and a
    // made-up score would be the one thing a reply could fairly call out.
    if (nearby === null) {
        return [];
    }

    const score = `${count(nearby)}/10`;
    const cameras = nearby === 1 ? '1 camera within a mile' : `${count(nearby)} cameras within a mile`;

    return [
        {
            id: 'versus-rate',
            kind: 'meme',
            purpose: 'Flock reviews the campus. Our joke, not their words: the score is the real camera count.',
            caption:
                `${score} is not a flex. it's how many plate readers are within a mile of campus (flock didn't actually rate us, relax)\n\n`
                + input.address,
            slides: [
                {
                    id: 'versus-rate-1',
                    ...QUAD,
                    tint: 'wash',
                    focus: [0.5, 0.35],
                    alt: `A leafy campus quad seen from above, with the words: the license plate camera company. Flock rates ${input.shortName}.`,
                    blocks: [
                        tag('The license plate camera company'),
                        ratingHeadline(input.shortName),
                    ],
                },
                {
                    id: 'versus-rate-2',
                    ...CAMERA_CLOSE,
                    tint: 'duotone',
                    // Pinned to the bottom of a tall frame, which lifts the
                    // camera clear of the score and the line under it.
                    focus: [0.5, 1],
                    alt: `A Flock license plate camera on a pole, with the words: ${cameras}. ${score}, would surveil again.`,
                    blocks: [
                        tag(cameras),
                        hook(score, { at: 'lower' }),
                        sub('Would surveil again', { at: 'bottom' }),
                    ],
                },
            ],
        },
    ];
}

const family: PostFamily = (input) => [mostPhotos(input), ...flockRates(input)];

export default family;
