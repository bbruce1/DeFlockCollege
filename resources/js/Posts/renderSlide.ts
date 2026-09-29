import type { ColourRole, PostSlide, TextBlock } from '@/Posts/postTemplates';

/** Instagram's square, at the size it wants for a full-quality post. */
const SIZE = 1080;

const MARGIN = SIZE * 0.055;

/** Where each anchor sits, as a fraction of the square from the top. */
const ANCHOR: Record<TextBlock['at'], number> = {
    top: 0.07,
    upper: 0.21,
    middle: 0.5,
    lower: 0.78,
    // Held clear of the credit line and of Instagram's own carousel dots.
    bottom: 0.915,
};

/**
 * Font size for each tier. `huge` is a ceiling; it shrinks to fit.
 *
 * Meme accounts set the shout at roughly a tenth of the frame: big enough to
 * read in the grid, small enough that the photo is still the joke. Anything
 * larger turns the picture into a background for a poster.
 */
const SIZES: Record<TextBlock['size'], number> = {
    huge: SIZE * 0.115,
    big: SIZE * 0.062,
    medium: SIZE * 0.036,
    // Labels now carry context ("the camera on your street"), so they have
    // to survive being read on a phone at arm's length.
    label: SIZE * 0.032,
};

/** The shout never runs edge to edge; it keeps a column the photo frames. */
const HUGE_MEASURE = SIZE * 0.8;

/** Two lines of shout is a meme; three is a paragraph. */
const HUGE_MAX_LINES = 2;

const WEIGHT: Record<TextBlock['size'], number> = {
    huge: 900,
    big: 800,
    medium: 600,
    label: 700,
};

/** Keywords the canvas font shorthand accepts, mapped onto Archivo's 62–125% axis. */
const STRETCH: Record<NonNullable<TextBlock['width']>, string> = {
    condensed: 'condensed',
    normal: 'normal',
    expanded: 'expanded',
};

/**
 * Draws a slide: the photo, the school's colours on it, the words over it.
 *
 * This one function is what the catalogue previews, what the copy screen
 * shows, and what gets saved as a PNG — so what somebody sees is exactly what
 * they post. There is one renderer on purpose; two would drift.
 */
export function drawSlide(
    canvas: HTMLCanvasElement,
    slide: PostSlide,
    fonts: { display: string; data: string },
    photo?: HTMLImageElement | null,
): void {
    const context = canvas.getContext('2d', { willReadFrequently: slide.tint === 'duotone' });

    if (!context) {
        return;
    }

    canvas.width = SIZE;
    canvas.height = SIZE;

    const palette = slide.palette ?? { primary: '#ffffff', secondary: '#000000' };
    const colour = (role: ColourRole | null | undefined, fallback: string): string => {
        switch (role) {
            case 'primary':
                return palette.primary;
            case 'secondary':
                return palette.secondary;
            case 'black':
                return '#000000';
            case 'white':
                return '#ffffff';
            default:
                return fallback;
        }
    };

    context.fillStyle = '#000000';
    context.fillRect(0, 0, SIZE, SIZE);

    if (photo && photo.complete && photo.naturalWidth > 0) {
        drawCover(context, photo, slide.focus ?? [0.5, 0.5]);
        tint(context, slide.tint ?? 'none', palette);
    }

    shade(context);

    for (const block of slide.blocks) {
        drawBlock(context, block, fonts.display, colour);
    }

    if (slide.credit) {
        context.font = `500 ${SIZE * 0.016}px ${fonts.data}`;
        context.textAlign = 'right';
        context.textBaseline = 'bottom';
        context.fillStyle = 'rgba(255,255,255,0.55)';
        context.fillText(slide.credit, SIZE - SIZE * 0.015, SIZE - SIZE * 0.01);
    }
}

/** Cover, never contain: a letterboxed meme looks like a mistake. */
function drawCover(context: CanvasRenderingContext2D, photo: HTMLImageElement, focus: [number, number]): void {
    const scale = Math.max(SIZE / photo.naturalWidth, SIZE / photo.naturalHeight);
    const width = photo.naturalWidth * scale;
    const height = photo.naturalHeight * scale;
    const x = clamp((SIZE - width) * focus[0], SIZE - width, 0);
    const y = clamp((SIZE - height) * focus[1], SIZE - height, 0);

    context.drawImage(photo, x, y, width, height);
}

/**
 * Puts the school's colours onto the photograph itself.
 *
 * Duotone maps each pixel's brightness onto a ramp between the darker and the
 * lighter of the two colours, which is what makes one stock photo read as
 * Georgia Tech in navy and gold and as another school in theirs.
 */
function tint(
    context: CanvasRenderingContext2D,
    mode: NonNullable<PostSlide['tint']>,
    palette: { primary: string; secondary: string },
): void {
    if (mode === 'wash') {
        context.save();
        context.globalCompositeOperation = 'color';
        context.globalAlpha = 0.65;
        context.fillStyle = palette.primary;
        context.fillRect(0, 0, SIZE, SIZE);
        context.restore();

        return;
    }

    if (mode !== 'duotone') {
        return;
    }

    const a = rgb(palette.primary);
    const b = rgb(palette.secondary);
    const [light, dark] = luminance(a) >= luminance(b) ? [a, b] : [b, a];
    // The shadow end is pulled toward black so white text still has somewhere
    // to stand, however pale the school's darker colour is.
    const shadow = mix([0, 0, 0], dark, 0.55);
    const image = context.getImageData(0, 0, SIZE, SIZE);
    const data = image.data;

    for (let i = 0; i < data.length; i += 4) {
        const t = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;

        data[i] = shadow[0] + (light[0] - shadow[0]) * t;
        data[i + 1] = shadow[1] + (light[1] - shadow[1]) * t;
        data[i + 2] = shadow[2] + (light[2] - shadow[2]) * t;
    }

    context.putImageData(image, 0, 0);
}

/** A vignette and a bottom scrim, so white type holds over any photo. */
function shade(context: CanvasRenderingContext2D): void {
    const vignette = context.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.32, SIZE / 2, SIZE / 2, SIZE * 0.78);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
    context.fillStyle = vignette;
    context.fillRect(0, 0, SIZE, SIZE);

    const scrim = context.createLinearGradient(0, SIZE * 0.55, 0, SIZE);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(1, 'rgba(0,0,0,0.6)');
    context.fillStyle = scrim;
    context.fillRect(0, 0, SIZE, SIZE);
}

function drawBlock(
    context: CanvasRenderingContext2D,
    block: TextBlock,
    family: string,
    colour: (role: ColourRole | null | undefined, fallback: string) => string,
): void {
    const align = block.align ?? 'center';
    const width = STRETCH[block.width ?? 'normal'];
    const weight = WEIGHT[block.size];
    const text = block.size === 'medium' ? block.text : block.text.toUpperCase();
    const maxWidth = block.size === 'huge'
        ? HUGE_MEASURE
        : SIZE - MARGIN * 2 - (block.box ? SIZE * 0.04 : 0);

    let size = SIZES[block.size];
    let lines = wrapAt(context, text, maxWidth, size, weight, width, family);

    // The hook shrinks until it fits in two lines; everything else just wraps
    // at its tier.
    if (block.size === 'huge') {
        while ((lines.length > HUGE_MAX_LINES || widest(context, lines) > maxWidth) && size > SIZE * 0.06) {
            size *= 0.93;
            lines = wrapAt(context, text, maxWidth, size, weight, width, family);
        }

        // A family that breaks the line itself has chosen where it goes.
        if (!text.includes('\n')) {
            lines = balance(context, lines);
        }
    }

    setFont(context, size, weight, width, family);

    const leading = size * (block.size === 'medium' ? 1.25 : 0.98);
    const blockHeight = size + leading * (lines.length - 1);
    const anchor = ANCHOR[block.at] * SIZE;
    const top = block.at === 'middle'
        ? anchor - blockHeight / 2
        : block.at === 'lower' || block.at === 'bottom'
            ? anchor - blockHeight
            : anchor;

    context.textAlign = align;
    context.textBaseline = 'top';
    context.lineJoin = 'round';

    const x = align === 'center' ? SIZE / 2 : MARGIN;

    let fill = colour(block.colour, '#ffffff');

    if (block.box) {
        const pad = size * 0.28;
        const boxWidth = widest(context, lines) + pad * 2;
        const boxLeft = align === 'center' ? SIZE / 2 - boxWidth / 2 : MARGIN - pad;
        const boxColour = colour(block.box, '#000000');

        context.fillStyle = boxColour;
        context.fillRect(boxLeft, top - pad * 0.7, boxWidth, blockHeight + pad * 1.4);

        // Families write "white on primary" without knowing the school. When the
        // primary turns out to be pale — white, gold, light blue — the label
        // would vanish, so the words flip to whichever of black or white reads.
        fill = readableOn(boxColour, fill);
    }

    const stroke = block.stroke === undefined
        ? (block.size === 'huge' || block.size === 'big' ? 'black' : null)
        : block.stroke;

    lines.forEach((line, index) => {
        const y = top + index * leading;

        if (stroke) {
            context.strokeStyle = colour(stroke, '#000000');
            context.lineWidth = size * 0.11;
            context.strokeText(line, x, y);
        }

        context.fillStyle = fill;
        context.fillText(line, x, y);
    });
}

function setFont(context: CanvasRenderingContext2D, size: number, weight: number, stretch: string, family: string): void {
    context.font = `${stretch} ${weight} ${size}px ${family}`;

    // Chromium honours the property but not always the shorthand keyword, and
    // other engines the reverse; setting both costs nothing.
    if ('fontStretch' in context) {
        context.fontStretch = stretch as CanvasFontStretch;
    }
}

function wrapAt(
    context: CanvasRenderingContext2D,
    text: string,
    max: number,
    size: number,
    weight: number,
    stretch: string,
    family: string,
): string[] {
    setFont(context, size, weight, stretch, family);

    const lines: string[] = [];

    for (const paragraph of text.split('\n')) {
        let line = '';

        for (const word of paragraph.split(/\s+/).filter(Boolean)) {
            const candidate = line ? `${line} ${word}` : word;

            if (context.measureText(candidate).width > max && line) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        }

        lines.push(line);
    }

    return lines;
}

/**
 * Re-splits a two-line shout so the lines are as even as they can be.
 *
 * Greedy wrapping fills the first line and leaves "IT" alone on the second,
 * which reads as a typo on a meme. The font must already be set.
 */
function balance(context: CanvasRenderingContext2D, lines: string[]): string[] {
    if (lines.length !== 2) {
        return lines;
    }

    const words = lines.join(' ').split(' ');
    let best = lines;
    let bestWidth = widest(context, lines);

    for (let split = 1; split < words.length; split++) {
        const candidate = [words.slice(0, split).join(' '), words.slice(split).join(' ')];
        const width = widest(context, candidate);

        if (width < bestWidth) {
            best = candidate;
            bestWidth = width;
        }
    }

    return best;
}

function widest(context: CanvasRenderingContext2D, lines: string[]): number {
    return Math.max(...lines.map((line) => context.measureText(line).width));
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function rgb(hex: string): [number, number, number] {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;

    return [parseInt(full.slice(0, 2), 16) || 0, parseInt(full.slice(2, 4), 16) || 0, parseInt(full.slice(4, 6), 16) || 0];
}

/** Minimum luminance gap (0–255) between words and their box before we override. */
const MIN_BOX_CONTRAST = 110;

/** Above this luminance a box counts as light and takes black words. */
const LIGHT_BOX = 140;

function readableOn(background: string, text: string): string {
    const behind = luminance(rgb(background));

    if (Math.abs(behind - luminance(rgb(text))) >= MIN_BOX_CONTRAST) {
        return text;
    }

    return behind > LIGHT_BOX ? '#000000' : '#ffffff';
}

function luminance([r, g, b]: [number, number, number]): number {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
