import type { PostFamily, PostSlide } from '@/Posts/postTemplates';
import { count, hook, note, shout, tag } from '@/Posts/kit';

/**
 * How to actually push back: the two posts that turn a follower into a letter.
 *
 * Both cast the camera as a "he" — the one who won't leave, the one who is
 * sensitive to touch — because a polite headline does not stop a thumb. The
 * turn on the next slide is the joke, and it always lands on the lawful route:
 * the pre-written letter on the chapter page. Nothing here winks at damaging a
 * camera — that would hand the other side the one story they want, which is
 * what the second post is about.
 */
const PHOTOS = {
    alprInSky: { photo: '/posts/pushback/eatontown.jpg', credit: 'Photo: MiracleMiles / CC BY 4.0' },
    laptop: { photo: '/posts/pushback/laptop.jpg', credit: 'Photo: Simon Hattinga Verschure we… / CC0' },
    newsCamera: { photo: '/posts/pushback/newscam.jpg', credit: 'Photo: Bidgee / CC BY-SA 3.0' },
    councilChambers: { photo: '/posts/pushback/chambers.jpg', credit: 'Photo: AJHalliwell from en.wikiped… / Public domain' },
    shyCamera: { photo: '/posts/pushback/shy.jpg', credit: 'Photo: Paul Goyette / CC BY 4.0' },
    // Shared with the explainer: the one highway shot where every car is a car he logs.
    highway: { photo: '/posts/explainer/traffic.jpg', credit: 'Photo: Matthew Henry matthewhenry / CC0' },
    keyboard: { photo: '/posts/pushback/keyboard.jpg', credit: 'Photo: Colin / CC BY-SA 4.0' },
} satisfies Record<string, Pick<PostSlide, 'photo' | 'credit'>>;

const AUDIO_STYLE = 'Deadpan build that cuts to a hard drop on the second slide';

const family: PostFamily = (input) => {
    const nearby = typeof input.readersWithinMile === 'number' && input.readersWithinMile > 0
        ? `${input.readersWithinMile === 1 ? '1 of him' : `${count(input.readersWithinMile)} of him`} within a mile of ${input.shortName}`
        : null;
    const lines = (...parts: (string | null)[]): string => parts.filter((part): part is string => part !== null).join('\n\n');

    return [
        {
            id: 'pushback-what-to-do',
            kind: 'info',
            purpose: 'Bait-and-switch how-to: the three things a follower can do today, letter first.',
            caption: lines(
                "bro won't leave so we're calling his parents (the officials who decide if he stays)",
                "letter's already written, add a sentence and hit send 📧",
                nearby,
                input.address,
            ),
            audio: {
                style: AUDIO_STYLE,
                cues: [
                    { atSeconds: 0, slide: 1, note: 'Hook on screen before the beat starts.' },
                    { atSeconds: 3, slide: 2, note: 'Drop lands on "call his parents".' },
                    { atSeconds: 6, slide: 3, note: 'Step two.' },
                    { atSeconds: 9, slide: 4, note: 'Step three, hold to the end.' },
                ],
            },
            slides: [
                {
                    id: 'pushback-what-to-do-1',
                    ...PHOTOS.alprInSky,
                    tint: 'duotone',
                    focus: [0.5, 0.5],
                    alt: "A Flock license plate camera and solar panel on a pole against the sky, with the words: the camera on your street. He won't leave.",
                    blocks: [
                        // No tag: anything that explains "he" on this slide gives the swipe away.
                        tag('The camera on your street'),
                        hook("He won't leave"),
                    ],
                },
                {
                    id: 'pushback-what-to-do-2',
                    ...PHOTOS.laptop,
                    focus: [0.35, 0.6],
                    alt: 'Hands typing on a laptop, with the words: so call his parents. Step one is sending the pre-written letter from the chapter page.',
                    blocks: [
                        shout('So call his parents', { at: 'top', size: 'big' }),
                        note(
                            `his parents = the officials who decide whether he stays. the letter to them is already written at ${input.address}. `
                            + 'add one sentence of your own and send it 📧',
                        ),
                    ],
                },
                {
                    id: 'pushback-what-to-do-3',
                    ...PHOTOS.newsCamera,
                    // Pulled down so the camera body sits high and the note takes the tripod.
                    focus: [0.5, 0.6],
                    alt: 'A television news camera on a tripod, with step two: follow the chapter, the consensual kind of following, to hear when the cameras come up for a vote.',
                    blocks: [
                        tag('Step 2'),
                        note(
                            "follow this account. the consensual kind of following lol. when he's up for a vote, you'll hear it here 🫡",
                            { at: 'bottom' },
                        ),
                    ],
                },
                {
                    id: 'pushback-what-to-do-4',
                    ...PHOTOS.councilChambers,
                    tint: 'wash',
                    focus: [0.5, 0.5],
                    alt: 'An empty council chamber, with step three: come to a meeting, even if you do not speak.',
                    blocks: [
                        tag('Step 3'),
                        note("pull up to a meeting. you don't have to talk, a row of students in the seats says plenty on its own 🗿"),
                    ],
                },
            ],
        },
        {
            id: 'pushback-never-vandalism',
            kind: 'info',
            purpose: 'The camera photographs everyone and nobody may touch it: why that is the joke, and why the email is the move.',
            caption: lines(
                "he photographs every car that drives by with zero consent but you can't touch him lol",
                "fr don't touch it tho, damaging one is a crime. email the officials who decide if he stays, the letter's already written",
                nearby,
                input.address,
            ),
            audio: {
                style: AUDIO_STYLE,
                cues: [
                    { atSeconds: 0, slide: 1, note: 'Hook on screen before the beat starts.' },
                    { atSeconds: 3, slide: 2, note: 'Drop lands on "never heard of her".' },
                    { atSeconds: 6, slide: 3, note: 'The email, hold to the end.' },
                ],
            },
            slides: [
                {
                    id: 'pushback-never-vandalism-1',
                    ...PHOTOS.shyCamera,
                    tint: 'duotone',
                    // He peeks out from behind the leaves in the upper middle; the
                    // words take the blur above and below him.
                    focus: [0.75, 0.5],
                    alt: "A Flock camera peeking out from behind leaves on a pole, with the words: photographs you 24/7, but careful, he's sensitive to touch.",
                    blocks: [
                        tag('Photographs you 24/7. But careful, he\'s', { at: 'top' }),
                        hook('Sensitive to touch'),
                    ],
                },
                {
                    id: 'pushback-never-vandalism-2',
                    ...PHOTOS.highway,
                    tint: 'wash',
                    focus: [0.2, 0.5],
                    alt: 'A highway full of cars, with the words: consent? Never heard of her. He photographs every car that passes and keeps the plate, time and place.',
                    blocks: [
                        shout('Consent?\nNever heard of her', { at: 'top', size: 'big' }),
                        // Plate, time, date and location of every car it passes:
                        // https://www.eff.org/cases/automated-license-plate-readers-aclu-eff-v-lapd-lasd
                        note('he photographs every car that passes and keeps the plate, the time and the place. nobody asked you'),
                    ],
                },
                {
                    id: 'pushback-never-vandalism-3',
                    ...PHOTOS.keyboard,
                    tint: 'duotone',
                    focus: [0.5, 0.5],
                    alt: 'Hands on a backlit keyboard, with the words: he has bosses, they have email. Damaging a camera is a crime; the letter is ready on the chapter page.',
                    blocks: [
                        shout('He has bosses.\nThey have email.', { at: 'top', size: 'big' }),
                        note(
                            'don\'t touch it. damaging one is a crime, and exactly the headline the pro-camera crowd wants. '
                            + `email the officials who decide whether he stays. letter's ready at ${input.address} 🫡`,
                        ),
                    ],
                },
            ],
        },
    ];
};

export default family;
