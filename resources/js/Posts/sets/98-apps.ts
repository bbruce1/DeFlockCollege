import type { PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, note, shout, tag } from '@/Posts/kit';

/**
 * The tracking apps everybody already has (the location prompt, the stray
 * tracker alert, ghost mode) with the plate camera as the one nobody opted in to.
 *
 * Each post borrows an app's everyday wording as text only: no logos, no
 * screenshots, and nothing about what those apps do beyond what anybody with a
 * phone already knows. The camera side only ever claims what every plate reader
 * does (photographs each passing car, reads the plate, keeps the time and
 * place), plus the one line about police, which rests on Flock's own site.
 */

// Flock's own page for selling to police: https://www.flocksafety.com/industries/law-enforcement
const POLICE_PAGE = 'flocksafety.com/industries/law-enforcement';

const PROMPT = { photo: '/posts/apps/trees.jpg', credit: 'Photo: MiracleMiles / CC BY 4.0' };
const CLOSEUP = { photo: '/posts/apps/closeup.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };
// Borrowed from the hypocrisy set: the parked cruisers are who the camera shares with.
const CRUISER = { photo: '/posts/hypocrisy/cruiser.jpg', credit: 'Photo: Vincent Hilary / CC BY-SA 4.0' };

const ROADSIDE = { photo: '/posts/apps/roadside.jpg', credit: 'Photo: Grokflok / CC0' };
const POLE = { photo: '/posts/apps/pole.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };
const FIELD = { photo: '/posts/apps/field.jpg', credit: 'Photo: Mr. Matté / CC BY-SA 4.0' };

const DUSK = { photo: '/posts/apps/dusk.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };
// A quiet street with the camera on a pole at the curb: where you'd pull up.
const QUIET_STREET = { photo: '/posts/apps/street.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };

/** "there are 12 within a mile of campus" as a caption line, or nothing before a survey. */
function nearbyLine(input: PostInput): string {
    const nearby = input.readersWithinMile;

    if (typeof nearby !== 'number' || nearby <= 0) {
        return '';
    }

    return nearby === 1
        ? 'there\'s 1 within a mile of campus\n\n'
        : `there are ${count(nearby)} within a mile of campus\n\n`;
}

const family: PostFamily = (input) => [
    {
        id: 'apps-location-prompt',
        kind: 'meme',
        purpose: 'The phone\'s location prompt, from a pole. You tap Don\'t Allow; it was never asking, and the police are who it shares with.',
        caption:
            'hit don\'t allow like that ever worked on a pole 💀\n'
            + 'plate readers photograph every car that drives by, and flock sells them to police departments\n\n'
            + nearbyLine(input)
            + `source: ${POLICE_PAGE}\n`
            + input.address,
        slides: [
            {
                id: 'apps-location-prompt-1',
                ...PROMPT,
                tint: 'duotone',
                // The camera hangs low under a big panel, so the prompt goes up
                // over the panel and the lens stays clear underneath.
                focus: [0.5, 0.5],
                alt: 'A plate camera under its solar panel against the sky, with the words: Plate Camera would like to track your location. Don\'t allow.',
                blocks: [
                    // Broken by hand: left to wrap, "LOCATION" ends up alone.
                    tag('📍 “Plate Camera” would like\nto track your location'),
                    hook('Don\'t Allow', { at: 'upper' }),
                ],
            },
            {
                id: 'apps-location-prompt-2',
                ...CLOSEUP,
                tint: 'wash',
                focus: [1, 0.5],
                alt: 'The camera up close on its pole, lens facing you, with the words: it wasn\'t asking.',
                blocks: [
                    // Condensed so it holds one line under the housing.
                    shout('It wasn\'t asking'),
                ],
            },
            {
                id: 'apps-location-prompt-3',
                ...CRUISER,
                tint: 'duotone',
                focus: [0.5, 0.5],
                alt: 'Two parked police cruisers, with the words: shared with the cops.',
                blocks: [
                    tag('Shared with'),
                    // Flock sells to police departments, per its own law enforcement page:
                    // https://www.flocksafety.com/industries/law-enforcement
                    hook('The cops'),
                ],
            },
        ],
    },
    {
        id: 'apps-tracker-alert',
        kind: 'meme',
        purpose: 'Your phone\'s stray-tracker alert, pointed at the plate camera. Tap to play sound; it\'s a pole, and nothing ever warns you about it.',
        caption:
            'your phone warns you about a stray airtag but never about the plate reader on your way to class 💀\n'
            + 'it photographs every car that drives by and keeps the time and place\n\n'
            + nearbyLine(input)
            + input.address,
        slides: [
            {
                id: 'apps-tracker-alert-1',
                ...ROADSIDE,
                tint: 'duotone',
                focus: [0.5, 0.3],
                alt: 'A plate camera on a thin pole beside a road, with the words: tracker found near you. It\'s on your way to class.',
                blocks: [
                    tag('⚠️ Tracker found near you'),
                    shout('It\'s on your way to class'),
                ],
            },
            {
                id: 'apps-tracker-alert-2',
                ...POLE,
                tint: 'wash',
                focus: [0.6, 0.5],
                alt: 'The camera and its solar panel strapped to a street pole, with the words: tap to play sound. Bro it\'s a pole.',
                blocks: [
                    tag('Tap to play sound'),
                    hook('Bro it\'s a pole'),
                ],
            },
            {
                id: 'apps-tracker-alert-3',
                ...FIELD,
                tint: 'duotone',
                focus: [0.5, 0.5],
                alt: 'Plate cameras on a pole by a field, explaining that nothing warns you about them, and that they photograph every car that drives by.',
                blocks: [
                    tag('No alert for this one'),
                    note(
                        'your phone checks for stray trackers. nothing checks for the pole. '
                        + 'it photographs every car that drives by and keeps the time and place 💀',
                    ),
                ],
            },
        ],
    },
    {
        id: 'apps-ghost-mode',
        kind: 'meme',
        purpose: 'Ghost mode on, told the boys you were sick, sure nobody saw. The plate camera on the way did.',
        caption:
            'ghost mode hides you from the group chat, not from the plate reader on the way 👻\n'
            + 'it photographs every car that drives by and keeps the time and place\n\n'
            + nearbyLine(input)
            + input.address,
        slides: [
            {
                id: 'apps-ghost-mode-1',
                ...DUSK,
                tint: 'duotone',
                // The camera hangs on the left-hand pole, so the crop keeps the
                // left of the frame and the words go over the sky and skyline.
                focus: [0, 0.5],
                alt: 'A plate camera on a street pole at dusk, with the words: Snap Map, ghost mode on, told the boys I was sick. No cameras, no proof.',
                blocks: [
                    // Broken by hand: left to wrap, "PLACE." ends up alone.
                    tag('Snap Map: ghost mode on.\nTold the boys I was sick.'),
                    shout('No cameras, no proof 🤫'),
                ],
            },
            {
                id: 'apps-ghost-mode-2',
                ...QUIET_STREET,
                tint: 'wash',
                // Held left: the camera stands at the curb on the left of the
                // frame, and the hook sits on the sidewalk below it.
                focus: [0.2, 0.5],
                alt: 'A plate camera on a pole along a quiet tree-lined street, with the words: the plate camera on the way. Clocked you pulling up.',
                blocks: [
                    tag('The plate camera on the way'),
                    shout('Clocked you pulling up'),
                ],
            },
        ],
    },
];

export default family;
