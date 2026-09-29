import type { PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, sub, tag } from '@/Posts/kit';

/**
 * The camera as the clingy acquaintance: the ex who never moved on, the one
 * who is always somehow around.
 *
 * The joke lands on the camera, never on a person — every photo is a pole or a
 * lens. The creepiness is the point, but it only ever claims what every plate
 * reader does: photographs the car, reads the plate, keeps the time and place.
 * The one line about the police rests on who Flock sells to, which its own
 * site says, not on who owns any particular camera near any particular campus.
 */

const PEEKING = { photo: '/posts/clingy/peek.jpg', credit: 'Photo: Bruxton / CC0' };
const WATCHING = { photo: '/posts/clingy/watching.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' };
// A field by the road. The pole is there if you look, which nobody does.
const TREELINE = { photo: '/posts/clingy/field.jpg', credit: 'Photo: DividedFrame / CC0' };
const LENS = { photo: '/posts/clingy/lens.jpg', credit: 'Photo: Bruxton / CC0' };

/** "and there are 52 of him within a mile of campus" as a caption line, or nothing before a survey. */
function howManyOfHim(input: PostInput, pronoun: 'him' | 'them'): string {
    const nearby = input.readersWithinMile;

    if (typeof nearby !== 'number' || nearby <= 0) {
        return '';
    }

    return nearby === 1
        ? `and there's one of ${pronoun} within a mile of campus\n\n`
        : `and there are ${count(nearby)} of ${pronoun} within a mile of campus\n\n`;
}

const family: PostFamily = (input) => [
    {
        id: 'clingy-ex',
        kind: 'meme',
        purpose: 'Reads like a post about an ex. It is about the camera that kept every picture of your car.',
        caption:
            'we all got that one creepy ex. ours is a plate reader bolted to a pole 💀\n\n'
            + 'photos of your car every time you drive by, and flock sells them to police departments so yeah he talks to cops\n\n'
            + howManyOfHim(input, 'him')
            + input.address,
        slides: [
            {
                id: 'clingy-ex-1',
                ...PEEKING,
                tint: 'wash',
                // The camera hangs low on the left of its pole, so both lines go
                // up over the solar panel and the lens peeks out underneath.
                focus: [0.5, 0],
                alt: 'A plate reader peeking out from behind its pole, with the words: still watches you park. Creepy ex.',
                blocks: [
                    tag('Still watches you park'),
                    hook('Creepy ex', { at: 'upper' }),
                ],
            },
            {
                id: 'clingy-ex-2',
                ...WATCHING,
                tint: 'duotone',
                // Pinned to the bottom of a tall frame so the lens rides high on
                // the right, above the two lines on the bare pole and sky.
                focus: [0.5, 1],
                alt: 'The camera right up close on its pole, lens pointed at you, with the words: you blocked his number. He still has your plate. And he talks to cops.',
                blocks: [
                    tag('You blocked his number'),
                    hook('He still has your plate', { at: 'lower' }),
                    sub('And he talks to cops', { at: 'bottom' }),
                ],
            },
        ],
    },
    {
        id: 'clingy-stalking',
        kind: 'meme',
        purpose: 'Opens like a warning. Lands on a pole, and on who it reports to.',
        caption:
            'not a drill, something near campus has been watching you from the side of the road\n\n'
            + 'it\'s a plate reader. it logs every car that goes by, and no, you can\'t call the cops on it. flock sells these to the cops 💀\n\n'
            + howManyOfHim(input, 'them')
            + input.address,
        slides: [
            {
                id: 'clingy-stalking-1',
                ...TREELINE,
                tint: 'duotone',
                // Open sky above for the tag, long grass below for the hook, and
                // the pole left alone in the middle.
                focus: [0.5, 0.5],
                alt: 'A thin pole standing in a roadside field at the edge of the woods, with the words: someone near campus is stalking you.',
                blocks: [
                    tag('Someone near campus is'),
                    hook('Stalking you'),
                ],
            },
            {
                id: 'clingy-stalking-2',
                ...LENS,
                tint: 'wash',
                // Pinned to the top so the lens sits under the tag and the
                // shop front at the foot of the pole is cropped away.
                focus: [0.5, 0],
                alt: 'A Flock camera up close on its pole, with the words: called the cops on it. They\'re subscribed.',
                blocks: [
                    tag('Called the cops on it'),
                    hook('They\'re subscribed'),
                ],
            },
        ],
    },
];

export default family;
