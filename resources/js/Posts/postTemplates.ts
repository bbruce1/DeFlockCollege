import { contrast, legibleInkOn } from '@/templates/skins';

/**
 * The posts a chapter is handed on the day it is made.
 *
 * The point is that nobody has to design anything. A student picks two colours
 * and gets a campaign: what is here, what it does, who can stop it, what we are
 * asking, and how to help. Five posts in that order is a sequence somebody can
 * publish as a carousel or one a day for a week.
 *
 * No figure is invented. The count is the chapter's own, and where it is not
 * known yet the slide says so rather than printing a nought.
 */

export interface PostInput {
    schoolName: string;
    shortName: string;
    primary: string;
    secondary: string;
    /** Null before the campus has been surveyed. */
    readersWithinMile?: number | null;
    /** Where the chapter lives, for the closing slide. */
    address: string;
}

/**
 * A soundtrack cue sheet for a carousel.
 *
 * The timings are ours: they say when each slide should land, which is a fact
 * about the post rather than a claim about any particular record. The track is
 * described by character instead of named, because we cannot check that a given
 * song still exists on a given platform, still has the same edit, or hits its
 * change where we said it does — and a cue sheet that is wrong about the music
 * is worse than none.
 *
 * A creator who has chosen a track writes it in; then the timings are theirs to
 * confirm against it.
 */
export interface PostAudio {
    /** What to look for, in the absence of naming a record we cannot verify. */
    style: string;
    /** Set by the creator once they have picked something. */
    title?: string | null;
    artist?: string | null;
    /** Seconds from the start of the audio, one per slide. */
    cues: { atSeconds: number; slide: number; note: string }[];
}

/** One post as Instagram counts them: a caption, and one or more slides. */
export interface Post {
    id: string;
    /** What the post is for, shown to the creator, never on the post. */
    purpose: string;
    slides: PostSlide[];
    /** Ready to paste into the caption box. */
    caption: string;
    audio?: PostAudio;
}

export interface PostSlide {
    id: string;
    /**
     * 'card' is the typographic square. 'meme' is a full-bleed photo with one
     * line shouted over it, which is the format that actually travels — the
     * photo carries it and the line is the whole joke.
     */
    layout?: 'card' | 'meme';
    /** The shouted line, for meme slides. Short: one breath, ideally one word. */
    overlay?: string;
    /**
     * The picture this slide is built on, served from /posts.
     *
     * Part of the template rather than something a creator supplies each time:
     * the whole point is that a chapter gets finished posts, and "now go find a
     * photo" is the step where somebody stops. Missing files fall back to the
     * ground colour, so a template still renders before its art exists.
     */
    photo?: string;
    ground: string;
    ink: string;
    accent: string;
    eyebrow: string;
    headline: string;
    /** The number set at display size, when the slide is built around one. */
    figure?: string | null;
    body?: string;
    footer: string;
}

/** Near-black, matching the network's own ground rather than pure black. */
const INK_GROUND = '#0a0c10';

const PAPER = '#f6f7f9';

/**
 * A colour that reads against the ground it sits on.
 *
 * A school whose colours are both dark would otherwise get slides with navy
 * text on a navy field. Falling back to paper is not a betrayal of the palette:
 * the ground is still theirs, and an illegible post helps nobody.
 */
function readable(colour: string, ground: string): string {
    return contrast(colour, ground) >= 3 ? colour : PAPER;
}

export function buildPosts(input: PostInput): Post[] {
    const { schoolName, shortName, primary, secondary, address } = input;
    const nearby = input.readersWithinMile;
    const counted = typeof nearby === 'number';

    const onPrimary = legibleInkOn(primary);
    const onSecondary = legibleInkOn(secondary);

    return [
        {
            id: 'count',
            purpose: 'Opens with the fact. Post this one first.',
            caption: counted
                ? `${nearby} automated licence plate readers are mapped within a mile of ${shortName}. `
                  + `They photograph every passing car and keep the record either way. Link in bio.`
                : `Automated licence plate readers are going up around ${shortName}. `
                  + `They photograph every passing car and keep the record either way. Link in bio.`,
            slides: [
                {
                    id: 'count-1',
                    ground: primary,
                    ink: onPrimary,
                    accent: onPrimary,
                    eyebrow: shortName,
                    headline: counted
                        ? 'automated plate readers within a mile of campus'
                        : 'plate readers are mapped within a mile of campus',
                    figure: counted ? String(nearby) : null,
                    footer: 'Mapped in OpenStreetMap',
                },
            ],
        },
        {
            id: 'what',
            purpose: 'A three-slide explainer. Swipe carousel.',
            caption:
                'A plate reader does not watch for a suspect. It records everyone and keeps the '
                + 'record. Where you were on a Tuesday night is now a row in a database somebody '
                + 'else owns. Swipe.',
            /*
             * The one carousel in the set, because the explanation genuinely has
             * three beats and cramming them onto one square is how a post stops
             * being read. The cue sheet below is what makes it work as a reel.
             */
            audio: {
                style:
                    'Something steady with a clear beat and no lyrics competing with the text — '
                    + 'a build that lands about nine seconds in suits the last slide.',
                title: null,
                artist: null,
                cues: [
                    { atSeconds: 0, slide: 1, note: 'Opens on the question.' },
                    { atSeconds: 3, slide: 2, note: 'Change on the first beat after the intro.' },
                    { atSeconds: 6, slide: 3, note: 'Change again; hold to the end.' },
                ],
            },
            slides: [
                {
                    id: 'what-1',
                    ground: INK_GROUND,
                    ink: PAPER,
                    accent: readable(primary, INK_GROUND),
                    eyebrow: 'What they do',
                    headline: 'Every car. Every time.',
                    body: 'Not a speed camera. Not looking for you in particular.',
                    footer: shortName,
                },
                {
                    id: 'what-2',
                    ground: INK_GROUND,
                    ink: PAPER,
                    accent: readable(primary, INK_GROUND),
                    eyebrow: 'What is kept',
                    headline: 'The plate, the place, the time.',
                    body:
                        'It photographs each vehicle that passes, reads the plate, and stores '
                        + 'where it was and when — whether or not anybody is suspected of anything.',
                    footer: shortName,
                },
                {
                    id: 'what-3',
                    ground: readable(primary, INK_GROUND) === PAPER ? primary : INK_GROUND,
                    ink: PAPER,
                    accent: readable(secondary, INK_GROUND),
                    eyebrow: 'And then',
                    headline: 'Kept either way.',
                    body: 'Where you were on a Tuesday night is a row in a database you do not own.',
                    footer: address,
                },
            ],
        },
        {
            id: 'who',
            purpose: 'Names the people who can actually remove them.',
            caption:
                'Plate readers are bought and installed by people with names and inboxes. '
                + 'City council, campus police, state legislators. They can be asked, and they '
                + 'can be asked again.',
            slides: [
                {
                    id: 'who-1',
                    ground: secondary,
                    ink: onSecondary,
                    accent: onSecondary,
                    eyebrow: 'Who decides',
                    headline: 'These are removable, and these are the people who remove them.',
                    body: 'City council · Campus police · State legislators',
                    footer: 'Following it is how you hear about the next meeting',
                },
            ],
        },
        {
            id: 'ask',
            purpose: 'States the ask, and the line the chapter does not cross.',
            caption:
                'What we are asking for: the readers around campus removed, and no new ones '
                + 'installed. Through elected officials and votes. Never vandalism.',
            slides: [
                {
                    id: 'ask-1',
                    ground: INK_GROUND,
                    ink: PAPER,
                    accent: readable(secondary, INK_GROUND),
                    eyebrow: 'The ask',
                    headline: 'Removal, and no new installations.',
                    body: 'Not audits. Not retention limits. Not transparency reports.',
                    footer: 'Never vandalism',
                },
            ],
        },
        {
            id: 'act',
            purpose: 'The closing slide. Send people to the page.',
            caption:
                `Writing to your representatives about the cameras around ${schoolName} takes `
                + `about a minute. Every letter is different, so nobody gets a form email. ${address}`,
            slides: [
                {
                    id: 'act-1',
                    ground: primary,
                    ink: onPrimary,
                    accent: onPrimary,
                    eyebrow: 'Two taps',
                    headline: 'Send a letter to the people who decide.',
                    body: 'Every letter is different. Nobody receives the same one twice.',
                    footer: address,
                },
            ],
        },
    ];
}

/**
 * The meme set: a photo, one line shouted over it, and a payoff on the swipe.
 *
 * Modelled on how accounts like Polymarket's actually post — the picture does
 * the work and the line is a single breath, usually one word. It travels a long
 * way further than a tidy infographic, and reaching people who have never
 * thought about this is the whole job.
 *
 * The setup is deliberately a bait: it reads like it is about to be crude or
 * shocking, and the payoff is a plain fact about the cameras. The joke lands on
 * the surveillance, never on a person — partly because that is funnier, and
 * partly because a chapter that punches at somebody's body hands the other side
 * the only story they want.
 *
 * Every payoff is a real figure from this campus. A meme that invents its
 * number is just a lie in a bigger font.
 */
export function buildMemes(input: PostInput): Post[] {
    const { shortName, address } = input;
    const nearby = input.readersWithinMile;
    const counted = typeof nearby === 'number' && nearby > 0;

    const posts: Post[] = [];

    if (counted) {
        posts.push({
            id: 'meme-count',
            purpose: 'Bait and payoff. The number does the work.',
            caption:
                `${nearby} automated plate readers within a mile of ${shortName}. Every one of `
                + `them photographs your car and keeps the record. ${address}`,
            slides: [
                {
                    id: 'meme-count-1',
                    layout: 'meme',
                    photo: '/posts/street.jpg',
                    overlay: 'GUESS HOW MANY',
                    ground: INK_GROUND,
                    ink: PAPER,
                    accent: PAPER,
                    eyebrow: shortName,
                    headline: 'Guess how many',
                    footer: 'Swipe',
                },
                {
                    id: 'meme-count-2',
                    layout: 'meme',
                    photo: '/posts/camera.jpg',
                    overlay: `${nearby}`,
                    ground: INK_GROUND,
                    ink: PAPER,
                    accent: PAPER,
                    eyebrow: 'Within a mile of campus',
                    headline: `${nearby}`,
                    footer: address,
                },
            ],
        });
    }

    posts.push({
        id: 'meme-nobody',
        purpose: 'For when a camera goes up with no announcement.',
        caption:
            `Nobody was asked. Plate readers get bought by a council vote or a campus contract, `
            + `and the first most people hear about it is when the pole is already up. ${address}`,
        slides: [
            {
                id: 'meme-nobody-1',
                layout: 'meme',
                photo: '/posts/pole.jpg',
                overlay: 'WHO VOTED FOR THIS',
                ground: INK_GROUND,
                ink: PAPER,
                accent: PAPER,
                eyebrow: shortName,
                headline: 'Who voted for this',
                footer: 'Swipe',
            },
            {
                id: 'meme-nobody-2',
                layout: 'meme',
                photo: '/posts/meeting.jpg',
                overlay: 'NOBODY. THAT IS THE POINT.',
                ground: INK_GROUND,
                ink: PAPER,
                accent: PAPER,
                eyebrow: 'A contract, not a ballot',
                headline: 'Nobody. That is the point.',
                footer: address,
            },
        ],
    });

    posts.push({
        id: 'meme-break',
        purpose: 'The reaction post. Put the news screenshot behind it.',
        caption:
            `Put the screenshot of whatever just happened behind this one and say what it is in `
            + `the caption. Keep it to what you can link to. ${address}`,
        slides: [
            {
                id: 'meme-break-1',
                layout: 'meme',
                photo: '/posts/breaking.jpg',
                overlay: 'HOLY ****',
                ground: INK_GROUND,
                ink: PAPER,
                accent: PAPER,
                eyebrow: 'Breaking',
                headline: 'Holy ****',
                footer: address,
            },
        ],
    });

    return posts;
}

/** The lead slide of each post: what the grid and the feed actually show. */
export function coverSlides(posts: Post[]): PostSlide[] {
    return posts.map((post) => post.slides[0]);
}
