/**
 * The posts a chapter is handed.
 *
 * Every post is a photograph with words set over it. There is deliberately no
 * layout for text on a flat colour: a feed of coloured squares is a feed nobody
 * stops on, and the picture is what earns the second look the words need.
 * `photo` is required on the type, so a slide without one does not compile.
 *
 * Posts are written one family per file in ./sets and collected here at build
 * time, so adding a family is dropping a file in. Nothing shared has to change,
 * which is what lets several people write them at once.
 *
 * Colours are named by role — primary, secondary — and never written as hex.
 * They are resolved against the chapter when the post is built, so every post
 * arrives in every school's own colours without anybody redrawing it.
 *
 * No figure is invented. Numbers come from the chapter's own survey, and where
 * one is not known the post says so, or is not offered, rather than printing a
 * nought or a guess.
 */

export interface PostInput {
    schoolName: string;
    shortName: string;
    primary: string;
    secondary: string;
    /** Null before the campus has been surveyed. */
    readersWithinMile?: number | null;
    /** Every mapped reader in the state. Null when unknown. */
    readersInState?: number | null;
    /** "Georgia", not "GA". Null when unknown. */
    stateName?: string | null;
    /** Where the chapter lives, e.g. "deflock.school/gatech". */
    address: string;
}

/**
 * A soundtrack cue sheet for a carousel.
 *
 * The timings are ours: they say when each slide should land, which is a fact
 * about the post rather than a claim about any particular record. The track is
 * described by character instead of named, because we cannot check that a
 * given song still has the edit these timings assume.
 */
export interface PostAudio {
    style: string;
    title?: string | null;
    artist?: string | null;
    cues: { atSeconds: number; slide: number; note: string }[];
}

/** Colours by what they are for. Resolved per chapter, never written as hex. */
export type ColourRole = 'white' | 'black' | 'primary' | 'secondary';

/** One run of words over the photo. */
export interface TextBlock {
    text: string;
    /**
     * Where it sits. `top` and `upper` hang down from that line; `lower` and
     * `bottom` sit up on it; `middle` is centred.
     */
    at: 'top' | 'upper' | 'middle' | 'lower' | 'bottom';
    /**
     * `huge` is the hook — grown to fill the width, three lines at most.
     * `big` a second line, `medium` a sentence, `label` a tag.
     */
    size: 'huge' | 'big' | 'medium' | 'label';
    /**
     * Archivo's width axis. `expanded` is the classic wide meme shout;
     * `condensed` the sports-account one. Both are the same font.
     */
    width?: 'condensed' | 'normal' | 'expanded';
    /** Defaults to white. */
    colour?: ColourRole;
    /** Outline. Defaults to black on huge and big, none otherwise. */
    stroke?: ColourRole | null;
    /** A solid box behind the words, for labels that must read on anything. */
    box?: ColourRole | null;
    /** Defaults to centre. */
    align?: 'left' | 'center';
}

export interface PostSlide {
    id: string;
    /**
     * The photograph, served from /posts. Required: a slide is a picture.
     * Missing files fall back to black so a post still renders, but a family
     * should never ship pointing at art it does not include.
     */
    photo: string;
    /** Describes the finished slide for anybody who cannot see it. */
    alt: string;
    /** Attribution for the photo, drawn small on the image. Required by CC BY. */
    credit?: string;
    /**
     * How the school's colours touch the photo itself. `duotone` remaps it into
     * the two colours; `wash` tints it with the primary; `none` leaves it be.
     */
    tint?: 'none' | 'duotone' | 'wash';
    /** Where to keep in frame when cropping to square, 0–1 from top-left. */
    focus?: [number, number];
    blocks: TextBlock[];
    /** Filled in when the post is built. Families never set this. */
    palette?: { primary: string; secondary: string };
}

/** One post as Instagram counts them: a caption, and one or more slides. */
export interface Post {
    id: string;
    /**
     * `meme` travels; `info` explains; `news` reacts to something that happened.
     * The catalogue shows them apart.
     */
    kind: 'meme' | 'info' | 'news';
    /**
     * When the story broke, as YYYY-MM-DD. Required on news: a win from two
     * years ago posted as if it were this morning is how an account loses trust.
     */
    date?: string;
    /** What the post is for, shown to the creator, never on the post. */
    purpose: string;
    slides: PostSlide[];
    /** Ready to paste into the caption box. Explains the joke if it baits. */
    caption: string;
    audio?: PostAudio;
}

/** What a family file exports. */
export type PostFamily = (input: PostInput) => Post[];

const FAMILIES = import.meta.glob<{ default: PostFamily }>('./sets/*.ts', { eager: true });

/** Every post, in every family, in this chapter's colours. */
export function allPosts(input: PostInput): Post[] {
    const palette = { primary: input.primary, secondary: input.secondary };

    return Object.keys(FAMILIES)
        .sort()
        .flatMap((path) => FAMILIES[path].default(input))
        .map((post) => ({
            ...post,
            slides: post.slides.map((slide) => ({ ...slide, palette })),
        }));
}

export function buildPosts(input: PostInput): Post[] {
    return allPosts(input).filter((post) => post.kind === 'info');
}

export function buildMemes(input: PostInput): Post[] {
    return allPosts(input).filter((post) => post.kind === 'meme');
}

/** News, newest first. */
export function buildNews(input: PostInput): Post[] {
    return allPosts(input)
        .filter((post) => post.kind === 'news')
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

/** The lead slide of each post: what the grid and the feed actually show. */
export function coverSlides(posts: Post[]): PostSlide[] {
    return posts.map((post) => post.slides[0]);
}
