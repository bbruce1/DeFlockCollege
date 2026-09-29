import type { TextBlock } from '@/Posts/postTemplates';

/**
 * The handful of text treatments every family uses.
 *
 * Kept deliberately few. A feed looks like one account when the same four
 * treatments recur, and looks like a scrapbook when every post invents its own.
 */

/** The shout. Wide, white, black outline, bottom of the square. Keep it to ~3 words. */
export function hook(text: string, overrides: Partial<TextBlock> = {}): TextBlock {
    return { text, at: 'bottom', size: 'huge', width: 'expanded', colour: 'white', stroke: 'black', ...overrides };
}

/** A condensed shout, for longer hooks that still need to read as one line. */
export function shout(text: string, overrides: Partial<TextBlock> = {}): TextBlock {
    return { text, at: 'bottom', size: 'huge', width: 'condensed', colour: 'white', stroke: 'black', ...overrides };
}

/** A small tag in the school's colour, like the "Flock CEO" label. */
export function tag(text: string, overrides: Partial<TextBlock> = {}): TextBlock {
    return { text, at: 'top', size: 'label', width: 'normal', colour: 'white', box: 'primary', ...overrides };
}

/** A second line under or over the hook. */
export function sub(text: string, overrides: Partial<TextBlock> = {}): TextBlock {
    return { text, at: 'upper', size: 'big', width: 'normal', colour: 'white', stroke: 'black', ...overrides };
}

/** A sentence, for the informative slides. Sits on a box so it reads over any photo. */
export function note(text: string, overrides: Partial<TextBlock> = {}): TextBlock {
    return { text, at: 'lower', size: 'medium', width: 'normal', colour: 'white', box: 'black', align: 'left', ...overrides };
}

/** Formats a count the way people read it, e.g. 9,846. */
export function count(value: number): string {
    return value.toLocaleString('en-US');
}
