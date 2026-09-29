import type { PostSlide } from '@/Posts/postTemplates';
import { drawSlide } from '@/Posts/renderSlide';

/**
 * Turning a slide into something you can actually put somewhere.
 *
 * The posts are drawn in the browser, so "copy this post" has to mean producing
 * a real PNG rather than pointing at a picture on a page. Shared between the
 * catalogue and the single-post screen so the file somebody saves from either
 * is the same file.
 */

export const POST_FONTS = {
    display: '"Archivo Variable", Archivo, system-ui, sans-serif',
    data: '"IBM Plex Mono", ui-monospace, monospace',
};

/**
 * Makes sure the faces the slides use are loaded, not merely declared.
 *
 * `document.fonts.ready` only waits for fonts the page has already asked for.
 * The heavy, wide and narrow cuts of Archivo appear nowhere but on the canvas,
 * so without asking for them by name the first draw measures a fallback face
 * and breaks lines in different places from the second.
 */
export function loadPostFonts(): Promise<unknown> {
    if (typeof document === 'undefined' || !document.fonts) {
        return Promise.resolve();
    }

    return Promise.all([
        document.fonts.load(`900 100px ${POST_FONTS.display}`),
        document.fonts.load(`600 100px ${POST_FONTS.display}`),
        document.fonts.load(`500 100px ${POST_FONTS.data}`),
    ]).then(() => document.fonts.ready);
}

/** Whether this browser can be handed an image directly. */
export function canCopyImages(): boolean {
    return (
        typeof ClipboardItem !== 'undefined'
        && typeof navigator !== 'undefined'
        && typeof navigator.clipboard?.write === 'function'
    );
}

/**
 * Draws a slide off-screen and hands back the PNG.
 *
 * Waits on the webfonts first: drawing before they load measures fallback
 * metrics and wraps the headline in the wrong places, which is not obvious
 * until somebody has already posted it.
 */
export async function slideToBlob(
    slide: PostSlide,
    photo?: HTMLImageElement | null,
): Promise<Blob> {
    await loadPostFonts();

    const canvas = document.createElement('canvas');

    drawSlide(canvas, slide, POST_FONTS, photo);

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('The post could not be drawn.'))),
            'image/png',
        );
    });
}

/**
 * Puts the post on the clipboard.
 *
 * The blob is handed over as a promise rather than awaited first, because Safari
 * ends the user gesture at the first await and refuses a write that arrives
 * after it. Chrome accepts either.
 */
export async function copySlide(slide: PostSlide, photo?: HTMLImageElement | null): Promise<void> {
    if (!canCopyImages()) {
        throw new Error('This browser cannot be handed an image.');
    }

    await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': slideToBlob(slide, photo) }),
    ]);
}

/** Saves the post as a file, for anywhere a clipboard will not do. */
export async function downloadSlide(
    slide: PostSlide,
    filename: string,
    photo?: HTMLImageElement | null,
): Promise<void> {
    const blob = await slideToBlob(slide, photo);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();

    // Revoked on the next tick: revoking immediately races the download in
    // Safari and saves an empty file.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** A filename somebody can find again, rather than "download (3).png". */
export function slideFilename(postId: string, index: number, total: number, slug?: string): string {
    const where = slug ? `${slug}-` : '';

    return total > 1
        ? `${where}${postId}-${index + 1}-of-${total}.png`
        : `${where}${postId}.png`;
}
