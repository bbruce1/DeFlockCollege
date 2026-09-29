import type { PostFamily } from '@/Posts/postTemplates';
import { count, hook, note, sub, tag } from '@/Posts/kit';

/**
 * The count: the one post every chapter should put up first.
 *
 * The photo is a real Flock camera in Valdosta, Georgia. Real matters here —
 * a generated picture of a surveillance camera invites the reply "that's not
 * even real", and this is the one post that cannot afford it.
 *
 * The number arrives dressed as an Instagram notification, "added to close
 * friends", and the swipe says who added you. The camera is small in this photo
 * on purpose: the first glance reads as the notification, the second finds the
 * pole.
 */
const PHOTO = '/posts/core/valdosta.jpg';
const CREDIT = 'Photo: GA_Kevin / CC0';

// The camera and its panel sit around 30–40% down this frame, so the words
// take the sky above it and the parked cars below.
const CAMERA_IN_UPPER_MIDDLE: [number, number] = [0.5, 0.3];

const family: PostFamily = (input) => {
    const nearby = input.readersWithinMile;

    // With no survey yet there is no honest number to lead with, so the post is
    // not offered rather than printed with a nought.
    if (typeof nearby !== 'number' || nearby <= 0) {
        return [];
    }

    const friends = nearby === 1 ? '1 close friend' : `${count(nearby)} close friends`;
    const whoAddedYou = nearby === 1 ? "It's a plate reader" : "They're all plate readers";
    const statewide = typeof input.readersInState === 'number' && input.readersInState > 0 && input.stateName
        ? `. ${count(input.readersInState)} across ${input.stateName}`
        : '';

    return [
        {
            id: 'count',
            kind: 'info',
            purpose: 'Opens with the fact, dressed as a notification. Post this one first.',
            caption: [
                nearby === 1
                    ? `there's a plate reader within a mile of campus and it has never once said hi 💀`
                    : `${count(nearby)} plate readers within a mile of campus and not one has said hi 💀`,
                `they snap every car that drives by and keep it, suspect or not${statewide}`,
                input.address,
            ].join('\n\n'),
            slides: [
                {
                    id: 'count-1',
                    photo: PHOTO,
                    credit: CREDIT,
                    tint: 'duotone',
                    focus: CAMERA_IN_UPPER_MIDDLE,
                    alt: `A Flock license plate reader on a pole among trees, with the words: cameras near campus added you to ${friends}.`,
                    blocks: [
                        tag('Cameras near campus added you to'),
                        hook(friends),
                    ],
                },
                {
                    id: 'count-2',
                    photo: PHOTO,
                    credit: CREDIT,
                    tint: 'wash',
                    focus: CAMERA_IN_UPPER_MIDDLE,
                    alt: `The same camera, with the words: ${whoAddedYou.toLowerCase()}, and that each one photographs every car and keeps the record.`,
                    blocks: [
                        // Broken by hand: left to wrap, "READERS" ends up alone.
                        sub(nearby === 1 ? "It's a\nplate reader" : "They're all\nplate readers", { at: 'top' }),
                        note(
                            `${count(nearby)} within a mile of ${input.shortName}. ${nearby === 1 ? 'It snaps' : 'Every one snaps'} every car `
                            + 'that drives by, reads the plate, saves where and when. Suspect or not, '
                            + "doesn't matter. You're in it.",
                        ),
                    ],
                },
            ],
        },
    ];
};

export default family;
