import type { PostSlide } from '@/Posts/postTemplates';

/** Instagram's square, at the size it wants for a full-quality post. */
const SIZE = 1080;

const PAD = SIZE * 0.09;

/**
 * Draws a slide to a canvas so it can be saved as a real file.
 *
 * The posts are HTML everywhere else, which cannot be right-clicked and saved —
 * "screenshot it" was the honest instruction before this existed, and it is a
 * bad one: it hands somebody a cropped, half-resolution picture of their own
 * post. This redraws the same slide at full size instead.
 *
 * Kept deliberately close to the HTML version. Where the two drift the HTML is
 * the preview and this is what actually gets posted, so this is the one that
 * has to be right.
 */
export function drawSlide(
    canvas: HTMLCanvasElement,
    slide: PostSlide,
    fonts: { display: string; data: string },
    photo?: HTMLImageElement | null,
): void {
    const context = canvas.getContext('2d');

    if (!context) {
        return;
    }

    canvas.width = SIZE;
    canvas.height = SIZE;

    if (slide.layout === 'meme') {
        drawMeme(context, slide, fonts, photo);

        return;
    }

    context.fillStyle = slide.ground;
    context.fillRect(0, 0, SIZE, SIZE);

    // Eyebrow, top left.
    context.fillStyle = slide.accent;
    context.font = `600 ${SIZE * 0.022}px ${fonts.data}`;
    context.textBaseline = 'top';
    context.fillText(spaced(slide.eyebrow.toUpperCase()), PAD, PAD);

    // Footer, bottom left.
    context.fillStyle = withAlpha(slide.ink, 0.7);
    context.font = `500 ${SIZE * 0.02}px ${fonts.data}`;
    context.textBaseline = 'alphabetic';
    context.fillText(spaced(slide.footer.toUpperCase()), PAD, SIZE - PAD);

    // The block that carries the message sits on the lower third.
    let cursor = SIZE - PAD - SIZE * 0.09;
    const width = SIZE - PAD * 2;

    if (slide.body) {
        context.fillStyle = withAlpha(slide.ink, 0.82);
        const size = SIZE * 0.032;
        context.font = `400 ${size}px ${fonts.display}`;
        const lines = wrap(context, slide.body, width);
        cursor -= lines.length * size * 1.45;
        lines.forEach((line, index) => {
            context.fillText(line, PAD, cursor + index * size * 1.45);
        });
        cursor -= size * 0.9;
    }

    context.fillStyle = slide.ink;
    const headlineSize = SIZE * (slide.figure ? 0.058 : 0.072);
    context.font = `700 ${headlineSize}px ${fonts.display}`;
    const headlineLines = wrap(context, slide.headline, width);
    cursor -= headlineLines.length * headlineSize * 1.12;
    headlineLines.forEach((line, index) => {
        context.fillText(line, PAD, cursor + index * headlineSize * 1.12);
    });

    if (slide.figure) {
        const figureSize = SIZE * 0.2;
        context.fillStyle = slide.accent;
        context.font = `700 ${figureSize}px ${fonts.data}`;
        context.fillText(slide.figure, PAD, cursor - figureSize * 0.28);
    }
}

/**
 * A photo with one line shouted over it.
 *
 * The picture carries the post and the line is the joke, so the type is set as
 * large as it can be and pinned to the bottom, over a scrim heavy enough that a
 * bright photo cannot swallow it. With no photo chosen the ground stands in, so
 * the slide is still a finished thing rather than a blank waiting on an upload.
 */
function drawMeme(
    context: CanvasRenderingContext2D,
    slide: PostSlide,
    fonts: { display: string; data: string },
    photo?: HTMLImageElement | null,
): void {
    context.fillStyle = slide.ground;
    context.fillRect(0, 0, SIZE, SIZE);

    if (photo && photo.complete && photo.naturalWidth > 0) {
        // Cover, not contain: a letterboxed meme looks like a mistake.
        const scale = Math.max(SIZE / photo.naturalWidth, SIZE / photo.naturalHeight);
        const width = photo.naturalWidth * scale;
        const height = photo.naturalHeight * scale;

        context.drawImage(photo, (SIZE - width) / 2, (SIZE - height) / 2, width, height);
    }

    // Enough scrim to hold white type over anything, weighted to the bottom.
    const scrim = context.createLinearGradient(0, SIZE * 0.35, 0, SIZE);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(0.55, 'rgba(0,0,0,0.55)');
    scrim.addColorStop(1, 'rgba(0,0,0,0.88)');
    context.fillStyle = scrim;
    context.fillRect(0, 0, SIZE, SIZE);

    const text = (slide.overlay ?? slide.headline).toUpperCase();
    const margin = SIZE * 0.06;
    const maxWidth = SIZE - margin * 2;

    // Grown until it fills the width, then capped so one short word does not
    // become taller than the square.
    let size = SIZE * 0.2;
    let lines = wrapAt(context, text, maxWidth, size, fonts.display);

    while (lines.length > 3 && size > SIZE * 0.075) {
        size -= SIZE * 0.008;
        lines = wrapAt(context, text, maxWidth, size, fonts.display);
    }

    context.font = `800 ${size}px ${fonts.display}`;
    context.textBaseline = 'alphabetic';
    context.fillStyle = '#ffffff';

    const leading = size * 0.94;
    let baseline = SIZE - margin - (lines.length - 1) * leading;

    for (const line of lines) {
        context.fillText(line, margin, baseline);
        baseline += leading;
    }

    // The chip, so a reposted screenshot still says whose it is.
    context.font = `600 ${SIZE * 0.022}px ${fonts.data}`;
    context.textBaseline = 'top';
    const chip = spaced(slide.eyebrow.toUpperCase());
    const chipWidth = context.measureText(chip).width + SIZE * 0.032;

    context.fillStyle = 'rgba(0,0,0,0.55)';
    context.fillRect(margin, margin, chipWidth, SIZE * 0.048);
    context.fillStyle = '#ffffff';
    context.fillText(chip, margin + SIZE * 0.016, margin + SIZE * 0.014);
}

/** @return the lines this text wraps to at a given size. */
function wrapAt(
    context: CanvasRenderingContext2D,
    text: string,
    max: number,
    size: number,
    font: string,
): string[] {
    context.font = `800 ${size}px ${font}`;

    return wrap(context, text, max);
}

/** Canvas has no letter-spacing, so the spacing is put into the string. */
function spaced(text: string): string {
    return text.split('').join(' ');
}

function wrap(context: CanvasRenderingContext2D, text: string, max: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = '';

    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;

        if (context.measureText(candidate).width > max && line) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }

    if (line) {
        lines.push(line);
    }

    return lines;
}

/** Hex to rgba, so ink can be softened without a second colour in the data. */
function withAlpha(hex: string, alpha: number): string {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;

    return `rgba(${parseInt(full.slice(0, 2), 16) || 0}, ${parseInt(full.slice(2, 4), 16) || 0}, ${
        parseInt(full.slice(4, 6), 16) || 0
    }, ${alpha})`;
}
