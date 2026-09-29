import type { PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, shout, tag } from '@/Posts/kit';

/**
 * Campus life, with the plate camera as the punchline: last semester, move-in
 * day, the 8am you skipped.
 *
 * The student is always the relatable one and the camera is always the one
 * watching. Every joke only claims what every plate reader does: photographs
 * each car that passes, reads the plate, keeps the time and place. Where a post
 * says "near campus" it means the kind of camera a chapter exists to count,
 * never a claim about one particular pole at one particular school.
 */

const LENS = { photo: '/posts/campus/lens.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };
const LIBRARY = { photo: '/posts/campus/library.jpg', credit: 'Photo: Pbritti / CC BY 4.0' };
const DRIVE_THRU = { photo: '/posts/campus/drive-thru.jpg', credit: 'Photo: Michael Gil / CC BY 2.0' };
const DUSK = { photo: '/posts/campus/dusk.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };
const CAMPUS_ROAD = { photo: '/posts/campus/campus-road.jpg', credit: 'Photo: Statecitizen1 / CC0' };
// A camera on its pole outside a brick building, which is all a dorm is.
const BY_THE_DORMS = { photo: '/posts/campus/dorms.jpg', credit: 'Photo: Bobobo666 / CC BY 4.0' };
// No front plate on this one, so the joke is about a minivan and not about anybody's car.
const MINIVAN = { photo: '/posts/campus/minivan.jpg', credit: 'Photo: Christopher Ziemnowicz / CC0' };
const ON_THE_POLE = { photo: '/posts/campus/pole.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };

/** "\n\nthere's 12 of them within a mile of Georgia Tech", or nothing before a survey. */
function howManyNearby(input: PostInput): string {
    const nearby = input.readersWithinMile;

    if (typeof nearby !== 'number' || nearby <= 0) {
        return '';
    }

    return nearby === 1
        ? `\n\nthere's one within a mile of ${input.shortName}`
        : `\n\nthere are ${count(nearby)} of them within a mile of ${input.shortName}`;
}

const family: PostFamily = (input) => [
    {
        id: 'campus-last-semester',
        kind: 'meme',
        purpose: 'The horror-movie line from a plate camera. What it knows turns out to be your library-to-drive-thru ratio, and everybody else\'s.',
        caption:
            'the plate camera knows you hit the drive-thru way more than the library 💀\n'
            + 'it photographs every car that goes by and keeps the plate, time and place. everyone\'s, not just yours'
            + howManyNearby(input)
            + `\n\n${input.address}`,
        slides: [
            {
                id: 'campus-last-semester-1',
                ...LENS,
                tint: 'wash',
                // The lens sits right of centre; pushing the crop right keeps the
                // whole housing in, with the pole and bare leaves on the left for
                // the tag.
                focus: [0.62, 0.5],
                alt: 'A plate camera up close on its pole, lens pointed straight at you, with the words: the plate camera near campus. I know what you did last semester.',
                blocks: [
                    tag('The plate camera near campus', { align: 'left' }),
                    shout('I know what you did\nlast semester'),
                ],
            },
            {
                id: 'campus-last-semester-2',
                ...LIBRARY,
                tint: 'duotone',
                focus: [0.5, 0.5],
                alt: 'A college library lit up at night, with the words: drove to the library. Once.',
                blocks: [
                    tag('Drove to the library'),
                    hook('Once'),
                ],
            },
            {
                id: 'campus-last-semester-3',
                ...DRIVE_THRU,
                tint: 'wash',
                // Pushed right so the diner sitting in the window on the left
                // falls out of frame.
                focus: [1, 0.5],
                alt: 'A glowing drive-thru menu board at night, with the words: hit the drive-thru. Every night.',
                blocks: [
                    tag('Hit the drive-thru'),
                    hook('Every night'),
                ],
            },
            {
                id: 'campus-last-semester-4',
                ...DUSK,
                tint: 'duotone',
                // The camera is on the left-hand pole against the evening sky.
                focus: [0.1, 0.5],
                alt: 'A plate camera on a pole against the evening sky by a traffic light, with the words: don\'t worry. I got everyone else too.',
                blocks: [
                    tag('Don\'t worry'),
                    shout('I got everyone else too'),
                ],
            },
        ],
    },
    {
        id: 'campus-move-in',
        kind: 'meme',
        purpose: 'Move-in day, and the plate camera takes your first campus photo. It isn\'t of you: plate cameras want the car, so it\'s mom\'s minivan.',
        caption:
            'your first photo on campus wasn\'t your student ID\n'
            + 'a plate camera got your mom\'s minivan first. it photographs every car that drives by and keeps the plate, time and place'
            + howManyNearby(input)
            + `\n\n${input.address}`,
        slides: [
            {
                id: 'campus-move-in-1',
                ...BY_THE_DORMS,
                tint: 'wash',
                // Tall frame: the camera and its panel ride in the upper third,
                // between the tag and the hook, over the brick.
                focus: [0.5, 0.45],
                alt: 'A plate camera and its solar panel on a pole outside a brick residence building, with the words: move-in day, the plate camera. Say cheese, freshmen.',
                blocks: [
                    tag('Move-in day. The plate camera:'),
                    shout('Say cheese, freshmen 📸'),
                ],
            },
            {
                id: 'campus-move-in-2',
                ...MINIVAN,
                tint: 'duotone',
                focus: [0.45, 0.6],
                alt: 'A white minivan parked on a street at night, with the words: it wasn\'t of you. It was your mom\'s minivan.',
                blocks: [
                    tag('It wasn\'t of you'),
                    shout('It was your mom\'s minivan'),
                ],
            },
        ],
    },
    {
        id: 'campus-skipped-8am',
        kind: 'meme',
        purpose: 'Skipped the 8am and the prof never noticed; the plate camera did. It is not personal: it got everybody who went, too.',
        caption:
            'skipped my 8am and the only one who noticed was a pole 😭\n'
            + 'nothing personal. it photographs every car that goes by and keeps the plate, time and place, class or no class'
            + howManyNearby(input)
            + `\n\n${input.address}`,
        slides: [
            {
                id: 'campus-skipped-8am-1',
                ...CAMPUS_ROAD,
                tint: 'wash',
                // The cameras stand at the right of a wide campus road. Pushed
                // right, the near one rides the treeline on the left, between
                // the tag and the hook.
                focus: [0.85, 0.5],
                alt: 'A plate camera on its pole beside a road through campus, with the words: skipped my 8am, prof didn\'t notice. The camera did.',
                blocks: [
                    tag('Skipped my 8am. Prof didn\'t notice.'),
                    hook('The camera did'),
                ],
            },
            {
                id: 'campus-skipped-8am-2',
                ...ON_THE_POLE,
                tint: 'duotone',
                // Pushed right so the camera sits mid-frame on its pole, under
                // the tag and clear above the hook.
                focus: [0.8, 0.5],
                alt: 'A plate camera strapped to a street pole beside its solar panel, with the words: 8:03am, don\'t take it personal. It got everyone who went too.',
                blocks: [
                    tag('8:03am. Don\'t take it personal'),
                    shout('It got everyone who went too'),
                ],
            },
        ],
    },
];

export default family;
