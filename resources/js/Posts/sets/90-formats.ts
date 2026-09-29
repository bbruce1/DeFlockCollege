import type { PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, note, shout, sub, tag } from '@/Posts/kit';

/**
 * Meme formats everybody already knows (the roommate red flags, the dating
 * profile, explaining something to your mom, the sports stat card) with the
 * plate reader dropped in as the punchline.
 *
 * Each one opens on a slide that reads as the ordinary version of the format
 * (a phone, a sunset, an empty stadium) and only shows the camera on the swipe,
 * because the format is the bait and the pole is the twist. The jokes only ever
 * claim what every plate reader does: photographs each passing car, reads the
 * plate, keeps the time and place, whether or not anybody is suspected.
 */

const NIGHT_ROAD = { photo: '/posts/formats/night.jpg', credit: 'Photo: BigPipNic / CC0' };
const OVER_THE_LOT = { photo: '/posts/formats/lot.jpg', credit: 'Photo: KneeHallHawk / CC0' };
const CAMPUS_LAMP = { photo: '/posts/formats/lamp.jpg', credit: 'Photo: MrNicoolio / CC0' };
const SUNSET = { photo: '/posts/formats/sunset.jpg', credit: 'Photo: Famartin / CC BY-SA 4.0' };
const DUSK_POLE = { photo: '/posts/formats/dusk.jpg', credit: 'Photo: UnitedShoes / CC0' };
const UNDER_THE_EAVE = { photo: '/posts/formats/eave.jpg', credit: 'Photo: Tony Webster / CC BY 2.0' };
const STREET_CORNER = { photo: '/posts/formats/corner.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };
const WINDSHIELD = { photo: '/posts/formats/windshield.jpg', credit: 'Photo: LemononoM / CC0' };
const STADIUM_SEATS = { photo: '/posts/formats/seats.jpg', credit: 'Photo: SEBCLEM13 / CC BY 4.0' };
const ROADSIDE = { photo: '/posts/formats/roadside.jpg', credit: 'Photo: Nicknimh / CC0' };
// Borrowed from the explainer set: the clearest close-up of a camera we have,
// for a slide that has to read as "camera" before anyone swipes.
const CAMERA_CLOSEUP = { photo: '/posts/explainer/flock-closeup.jpg', credit: 'Photo: Epicdeflocker64 / CC0' };

/** "\n\nthere's 12 of him within a mile of Georgia Tech", or nothing before a survey. */
function howManyOfHim(input: PostInput): string {
    const nearby = input.readersWithinMile;

    if (typeof nearby !== 'number' || nearby <= 0) {
        return '';
    }

    return nearby === 1
        ? `\n\nthere's one of him within a mile of ${input.shortName}`
        : `\n\nthere are ${count(nearby)} of him within a mile of ${input.shortName}`;
}

/** The sports-account stat lines, using only the counts the chapter actually has. */
function statLines(input: PostInput): string[] {
    const lines = ['Cars photographed: every one', 'Suspects needed: 0'];
    const nearby = input.readersWithinMile;
    const statewide = input.readersInState;

    if (typeof nearby === 'number' && nearby > 0) {
        lines.push(`Within a mile of ${input.shortName}: ${count(nearby)}`);
    }

    if (typeof statewide === 'number' && statewide > 0 && input.stateName) {
        lines.push(`Across ${input.stateName}: ${count(statewide)}`);
    }

    return lines;
}

const family: PostFamily = (input) => [
    {
        id: 'formats-red-flags',
        kind: 'meme',
        purpose: 'Reads like a roommate red-flags post. The red flags are a plate reader, and so is the roommate.',
        caption:
            'new roommate clocked my car at 2am and kept pics of it 🚩\n'
            + 'it\'s a plate reader. they photograph every car that goes by and save the time and place, suspect or not'
            + howManyOfHim(input)
            + `\n\n${input.address}`,
        slides: [
            {
                id: 'formats-red-flags-1',
                ...CAMERA_CLOSEUP,
                tint: 'wash',
                focus: [0.5, 0.4],
                alt: 'A license plate camera up close on its pole, with the words: roommate red flags. He knows my plate.',
                blocks: [
                    tag('Roommate red flags'),
                    hook('He knows my plate'),
                ],
            },
            {
                id: 'formats-red-flags-2',
                ...NIGHT_ROAD,
                tint: 'duotone',
                // The camera stands on the right of the frame, lit by the car park.
                focus: [0.5, 0.55],
                alt: 'A plate reader on a pole beside a road at night, with the words: red flag. Clocked your car at 2am.',
                blocks: [
                    tag('🚩 Red flag'),
                    shout('Clocked your car at 2am'),
                ],
            },
            {
                id: 'formats-red-flags-3',
                ...OVER_THE_LOT,
                tint: 'wash',
                // Low enough to keep the parked trucks in, since they are the joke.
                focus: [0.5, 0.62],
                alt: 'A plate reader on a pole above a row of parked pickup trucks, with the words: red flag. Kept pics of your car.',
                blocks: [
                    tag('🚩 Red flag'),
                    shout('Kept pics of your car'),
                ],
            },
            {
                id: 'formats-red-flags-4',
                ...CAMPUS_LAMP,
                tint: 'duotone',
                focus: [0.5, 0.1],
                alt: 'A plate reader strapped to a lamp post among trees, with the words: biggest red flag. He\'s a pole.',
                blocks: [
                    tag('🚩 Biggest red flag'),
                    hook('He\'s a pole'),
                ],
            },
        ],
    },
    {
        id: 'formats-hinge',
        kind: 'meme',
        purpose: 'Opens as a dating-profile post over a sunset. The match is a plate reader, and its one fear is a council vote.',
        caption:
            'matched with a plate reader on hinge 💀\n'
            + 'he saves the plate, time and place of every car that drives by and his biggest fear is a city council vote'
            + `\n\n${input.address}`,
        slides: [
            {
                id: 'formats-hinge-1',
                // The camera is his profile pic: the joke only works if you can
                // see who you matched with.
                ...DUSK_POLE,
                tint: 'duotone',
                focus: [0.3, 0.2],
                alt: 'A plate reader on a pole by the road at dusk, with the words: my Hinge match. Never forgets a plate.',
                blocks: [
                    tag('My Hinge match'),
                    shout('Never forgets a plate'),
                ],
            },
            {
                id: 'formats-hinge-2',
                ...SUNSET,
                // Left untinted: the pink sky is the dating-profile Sunday.
                tint: 'none',
                focus: [0.5, 0.4],
                alt: 'A pink and purple sunset over a treeline, with the words: typical Sunday. Reading your plate.',
                blocks: [
                    tag('Typical Sunday:'),
                    shout('Reading your plate'),
                ],
            },
            {
                id: 'formats-hinge-3',
                ...UNDER_THE_EAVE,
                tint: 'wash',
                focus: [0.6, 0.5],
                alt: 'A plate reader with its solar panel, close up against the sky, with the words: my biggest fear. A city council vote.',
                blocks: [
                    tag('My biggest fear:'),
                    // Councils do vote them out: Monroe, Ohio voted unanimously to
                    // remove every Flock camera and end the contract.
                    // https://www.fox19.com/2026/09/23/monroe-council-votes-remove-flock-cameras/
                    // The lens sits low in a landscape frame that cannot be
                    // reframed vertically, so the answer hangs under the prompt
                    // the way a Hinge card reads, clear of the lens.
                    shout('A city council vote', { at: 'upper' }),
                ],
            },
        ],
    },
    {
        id: 'formats-mom',
        kind: 'meme',
        purpose: 'The "explaining it to my mom" bit. The opp turns out to be a pole; mom calls it paparazzi, which is right.',
        caption:
            'told my mom i have an opp and it\'s a pole 💀\n'
            + 'it photographs every car that drives by and logs where and when, nobody has to suspect you of anything'
            + `\n\n${input.address}`,
        slides: [
            {
                id: 'formats-mom-1',
                // A camera far off by the road: enough to point at, still small
                // enough that "a pole" on the next slide lands.
                ...ROADSIDE,
                tint: 'wash',
                focus: [0.6, 0.4],
                alt: 'A camera on a pole beside a curving road, with the words: me explaining to my mom. My opp has my plate.',
                blocks: [
                    tag('Me explaining to my mom'),
                    hook('My opp has my plate'),
                ],
            },
            {
                id: 'formats-mom-2',
                ...STREET_CORNER,
                tint: 'duotone',
                focus: [0.2, 0.2],
                alt: 'A plate reader on a pole at a street corner, with the words: mom, who? A pole.',
                blocks: [
                    tag('Mom: "who??"'),
                    hook('A pole'),
                ],
            },
            {
                id: 'formats-mom-3',
                ...WINDSHIELD,
                tint: 'wash',
                focus: [0.5, 0.5],
                alt: 'A road seen through a car windshield with a plate reader ahead, with the words: mom, so like paparazzi? Paparazzi for everyone.',
                blocks: [
                    tag('Mom: "so like... paparazzi?"'),
                    shout('Paparazzi for everyone'),
                ],
            },
        ],
    },
    {
        id: 'formats-undefeated',
        kind: 'meme',
        purpose: 'A sports-account stat card for the campus\'s "most consistent player". The player is the plate reader.',
        caption:
            `${input.shortName.toLowerCase()}'s most consistent player this season is the plate reader 💀\n`
            + 'every car that goes by gets its plate read and logged, undefeated at something nobody asked for'
            + howManyOfHim(input)
            + `\n\n${input.address}`,
        slides: [
            {
                id: 'formats-undefeated-1',
                ...STADIUM_SEATS,
                tint: 'duotone',
                focus: [0.5, 0.5],
                alt: `Rows of empty stadium seats, with the words: never missed a car all season. Undefeated.`,
                blocks: [
                    tag('Never missed a car all season'),
                    hook('Undefeated'),
                ],
            },
            {
                id: 'formats-undefeated-2',
                ...ROADSIDE,
                tint: 'wash',
                focus: [0.55, 0.4],
                alt: `A plate reader on a roadside pole, with a stat card: ${statLines(input).join(', ')}.`,
                blocks: [
                    tag('Season stats'),
                    sub('It\'s the plate reader'),
                    note(statLines(input).join('\n'), { at: 'bottom' }),
                ],
            },
        ],
    },
];

export default family;
