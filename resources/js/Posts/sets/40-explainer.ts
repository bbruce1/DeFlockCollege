import type { PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, note, shout, tag } from '@/Posts/kit';

/**
 * What these cameras actually do: two short explainers.
 *
 * Informative, but each opens on a joke, because the explainer nobody stops
 * for explains nothing. The first slide baits, the swipe delivers the facts:
 * an empty road at 2am that turns out to have had a witness, and a sudden
 * fondness for speed cameras that turns out to be a comparison.
 *
 * Every claim is one of the general, well-established facts about plate
 * readers or is on a page cited beside it. Retention is described as set by
 * contract and policy on purpose: it genuinely varies, and a post that states
 * one number as universal is the post that gets corrected in the replies.
 */

// The empty road opens the post, so the camera is the reveal rather than the cover.
const CAMERA = { photo: '/posts/explainer/flock-closeup.jpg', credit: 'Photo: Epicdeflocker64 / CC0' };
const TRAFFIC = { photo: '/posts/explainer/traffic.jpg', credit: 'Photo: Matthew Henry matthewhenry / CC0' };
const SERVERS = { photo: '/posts/explainer/servers.jpg', credit: 'Photo: BalticServers.com / CC BY-SA 3.0' };
const KEYBOARD = { photo: '/posts/explainer/keyboard.jpg', credit: 'Photo: The indian dev / CC BY-SA 4.0' };

const POLE = { photo: '/posts/explainer/flock-pole.jpg', credit: 'Photo: Tony Webster / CC BY 2.0' };
const SPEED_CAMERA = { photo: '/posts/explainer/speed-camera.jpg', credit: 'Photo: DeFacto / CC BY-SA 2.5' };
const NIGHT_TRAFFIC = { photo: '/posts/explainer/night-traffic.jpg', credit: 'Photo: PattayaPatrol / CC BY-SA 4.0' };
const AERIAL = { photo: '/posts/explainer/aerial.jpg', credit: 'Photo: Patrickroque01 / CC BY-SA 4.0' };

/** "1,204 of them across Georgia" for a caption line. Or null, when either half is unknown. */
function statewideAside(input: PostInput): string | null {
    if (typeof input.readersInState !== 'number' || input.readersInState <= 0 || !input.stateName) {
        return null;
    }

    return `${count(input.readersInState)} of them across ${input.stateName}`;
}

/** " 12 are mapped within a mile of Georgia Tech 💀" Or nothing, before a survey. */
function nearby(input: PostInput): string {
    const readers = input.readersWithinMile;

    if (typeof readers !== 'number' || readers <= 0) {
        return '';
    }

    return readers === 1
        ? ` one is mapped within a mile of ${input.shortName} 💀`
        : ` ${count(readers)} are mapped within a mile of ${input.shortName} 💀`;
}

/** "12 of them within a mile of Georgia Tech" for a caption line. Or null, before a survey. */
function nearbyAside(input: PostInput): string | null {
    const readers = input.readersWithinMile;

    if (typeof readers !== 'number' || readers <= 0) {
        return null;
    }

    return `${count(readers)} of them within a mile of ${input.shortName}`;
}

const family: PostFamily = (input) => [
    {
        id: 'explainer-taco-run',
        kind: 'info',
        purpose: 'What one camera records, how long it is kept, and who can search it.',
        caption: [
            '2am taco run with the boys, no witnesses. except the snitch on the pole 📸',
            'it logs every car that drives by, suspect or not',
            statewideAside(input),
            input.address,
        ]
            .filter((line): line is string => line !== null)
            .join('\n\n'),
        audio: {
            style: 'Deadpan lo-fi loop that cuts out for the hook, then comes back under the facts',
            cues: [
                { atSeconds: 0, slide: 1, note: 'Hook lands on silence' },
                { atSeconds: 3, slide: 2, note: 'Beat comes back in on the snitch' },
                { atSeconds: 6, slide: 3, note: 'Steady' },
                { atSeconds: 9, slide: 4, note: 'Hold to the end' },
            ],
        },
        slides: [
            {
                id: 'explainer-taco-run-1',
                ...NIGHT_TRAFFIC,
                tint: 'duotone',
                focus: [0.5, 0.5],
                alt: 'An empty road junction at night, streaked with headlights, with the words: 2am. No witnesses? The camera on the corner has entered the chat.',
                blocks: [
                    // The night sky is the empty top third; the overpass and the
                    // light trails below it are the picture.
                    // Broken by hand: balanced, it splits as "2AM. NO / WITNESSES."
                    hook('2am.\nNo witnesses?', { at: 'top' }),
                    tag('The camera on the corner has entered the chat', { at: 'bottom' }),
                ],
            },
            {
                id: 'explainer-taco-run-2',
                ...CAMERA,
                tint: 'none',
                focus: [0.5, 0.36],
                alt: 'A plate reader on a pole against the sky, with the words: one snitch. It logs every car that drives past: plate, date, time and place.',
                blocks: [
                    // Condensed so it holds one line: the panel starts about a third
                    // of the way down, and the words have to stay in the sky above it.
                    shout('One snitch.', { at: 'top' }),
                    // Plate, time, date and location of every car it passes:
                    // https://www.eff.org/cases/automated-license-plate-readers-aclu-eff-v-lapd-lasd
                    // (linked from https://www.eff.org/issues/automated-license-plate-readers-alpr)
                    // Everybody, not only suspects, is how every plate reader works; the same page:
                    // "ALPRs capture massive amounts of data on Americans".
                    note(
                        'every car that drives past. plate, date, time, place. '
                        + 'not just suspects. everybody, every trip 💀',
                        { at: 'upper' },
                    ),
                ],
            },
            {
                id: 'explainer-taco-run-3',
                ...SERVERS,
                tint: 'wash',
                focus: [0.5, 0.5],
                alt: 'Rows of servers, explaining that how long the records are kept is set by each agency\'s contract and policy.',
                blocks: [
                    tag('How long it keeps it'),
                    // Retention varies by contract, so no period is stated. Agency ALPR policies
                    // have been obtained as public records, e.g. EFF and ACLU SoCal's request:
                    // https://www.eff.org/cases/automated-license-plate-readers-aclu-eff-v-lapd-lasd
                    note(
                        'no universal delete date, bro. it\'s whatever each agency\'s contract '
                        + 'and policy say, and you can usually request those as public records 🫡',
                    ),
                ],
            },
            {
                id: 'explainer-taco-run-4',
                ...KEYBOARD,
                tint: 'duotone',
                focus: [0.5, 0.5],
                alt: 'A backlit keyboard in the dark, explaining that local police have searched the network for ICE, typing reasons like immigration.',
                blocks: [
                    tag('Who can search it'),
                    // Nationwide lookups, a typed "reason", and local police searching for ICE:
                    // https://www.404media.co/ice-taps-into-nationwide-ai-enabled-camera-network-data-shows/
                    note(
                        'searches can reach cameras nationwide. 404 Media found local cops running them '
                        + 'for ICE, typing reasons like “immigration” 🚨',
                    ),
                ],
            },
        ],
    },
    {
        id: 'explainer-not-speed',
        kind: 'info',
        purpose: 'How a plate reader differs from a speed camera, and why a network of them is a location history.',
        caption: [
            "no shot we're saying this but bring back speed cameras",
            'at least a speed cam leaves you alone at 24 in a 25, this thing logs every car 💀',
            nearbyAside(input),
            input.address,
        ]
            .filter((line): line is string => line !== null)
            .join('\n\n'),
        audio: {
            style: 'Upbeat loop that scratches to a stop on the reveal',
            cues: [
                { atSeconds: 0, slide: 1, note: 'Hot take, upbeat' },
                { atSeconds: 3, slide: 2, note: 'Keep it light' },
                { atSeconds: 6, slide: 3, note: 'Record scratch' },
                { atSeconds: 9, slide: 4, note: 'Low and slow to the end' },
            ],
        },
        slides: [
            {
                id: 'explainer-not-speed-1',
                ...POLE,
                tint: 'duotone',
                focus: [0.62, 0.5],
                alt: 'A plate reader and its solar panel on a pole, with the words: bring back speed cameras.',
                blocks: [
                    tag('Hot take'),
                    hook('Bring back speed cameras'),
                ],
            },
            {
                id: 'explainer-not-speed-2',
                ...SPEED_CAMERA,
                tint: 'none',
                // The camera box is at the very top of a tall photo.
                focus: [0.5, 0],
                alt: 'A roadside speed camera, explaining that it is only waiting for a car breaking the limit.',
                blocks: [
                    tag('A speed camera'),
                    // General, well-established: a classic speed camera is triggered by a speeding car.
                    note(
                        'it waits for one thing: a car breaking the limit. '
                        + 'do 24 in a 25 and it could not care less about you 🤝',
                    ),
                ],
            },
            {
                id: 'explainer-not-speed-3',
                ...TRAFFIC,
                tint: 'wash',
                focus: [0.5, 0.6],
                alt: 'A highway full of cars, with the words: a plate reader wants everyone. It logs every car, speeding or not.',
                blocks: [
                    // The cars are the bottom half, so the words take the sky and the skyline.
                    tag('A plate reader'),
                    shout('Wants everyone', { at: 'upper', size: 'big' }),
                    // Reads the plate and records time, date and location of the car:
                    // https://www.eff.org/cases/automated-license-plate-readers-aclu-eff-v-lapd-lasd
                    note(
                        'it logs every car that passes. plate, date, time, place. '
                        + 'speeding or not. driving legal doesn\'t get you left out 💀',
                        { at: 'middle' },
                    ),
                ],
            },
            {
                id: 'explainer-not-speed-4',
                ...AERIAL,
                tint: 'duotone',
                focus: [0.5, 0.5],
                alt: 'A city seen from above, explaining that enough plate readers join up into where you live, work, pray and see a doctor.',
                blocks: [
                    tag('Now add more of them'),
                    // Over time the records show where you live and work, your doctor, your
                    // religious services and your friends:
                    // https://www.eff.org/cases/automated-license-plate-readers-aclu-eff-v-lapd-lasd
                    // https://www.aclu.org/issues/privacy-technology/location-tracking
                    note(
                        'stack enough of them on enough corners and the logs join up. where you live, work, '
                        + 'pray, see a doctor, and who your friends are.'
                        + nearby(input),
                    ),
                ],
            },
        ],
    },
];

export default family;
