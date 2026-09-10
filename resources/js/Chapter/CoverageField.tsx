import { useEffect, useRef } from 'react';

/** The field is inset so it never runs off the top or bottom of the viewport. */
const INSET = 0.74;

/** Past this a state stops growing, so a large monitor does not get a mural. */
const MAX_FIELD_PX = 900;

/** However small the field gets, the readers stay faintly visible. */
const MIN_DENSITY = 0.3;

/** Resting ink for a reader, before the sweep and the density correction. */
const DOT_ALPHA = 0.11;

export interface Coverage {
    /** Where to fetch the field from. */
    url: string;
    /**
     * Places to mark on it, in the field's own space. A chapter page marks its
     * own campus; the network's front page marks every chapter.
     */
    markers: { x: number; y: number }[];
    /** Fraction of the viewport the field may occupy. */
    inset?: number;
    /** Cap on the field's longest edge in CSS pixels, or null for none. */
    maxPx?: number | null;
}

interface Field {
    points: number[];
    outline: number[][];
    /** The projected extent. Not square: it carries the state's proportions. */
    width: number;
    height: number;
}

/**
 * Everything the drawing divides by, checked once at the boundary.
 *
 * Points may be empty: the national map carries only borders, because the front
 * page marks where the chapters are rather than every camera in the country.
 * An outline with no extent, though, is not drawable at any scale.
 */
function isDrawable(data: Field | null): data is Field {
    return (
        data !== null &&
        Array.isArray(data.points) &&
        Array.isArray(data.outline) &&
        data.outline.length > 0 &&
        Number.isFinite(data.width) &&
        Number.isFinite(data.height) &&
        data.width > 0 &&
        data.height > 0
    );
}

/**
 * Every mapped plate reader in the state, drawn behind the page, inside the
 * state's own border so the shape is recognisable rather than an abstract haze.
 *
 * This is atmosphere, not instrumentation: it is decorative, hidden from
 * assistive technology, and carries no figure the page does not also state in
 * its own text. If the fetch fails or the canvas never paints, nothing is lost
 * but the mood.
 *
 * A slow sweep crosses the field and brightens the readers it passes, which is
 * the surveillance the page is about, pointed back at itself. Reduced motion
 * gets the same field, drawn once and left alone.
 */
export default function CoverageField({ coverage }: { coverage: Coverage }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
            return;
        }

        let field: Field | null = null;
        let raf = 0;
        let stopped = false;

        /**
         * The border and the readers at rest, drawn once.
         *
         * Everything here except the sweep and the marker pulse is identical
         * frame to frame, and the national map is thirty-four thousand border
         * points. Re-stroking all of it sixty times a second pinned a core and
         * froze the tab; blitting a bitmap costs nothing.
         */
        let stillLayer: HTMLCanvasElement | null = null;

        const styles = getComputedStyle(canvas);
        const accent = styles.getPropertyValue('--accent').trim() || '#22d3ee';
        const signal = styles.getPropertyValue('--signal').trim() || '#f43f5e';
        const ground = styles.getPropertyValue('--bg').trim() || '#08090a';

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let reduceMotion = motionQuery.matches;

        let frame = 0;
        let scale = 1;
        let offsetX = 0;
        let offsetY = 0;
        let density = 1;

        function resize(): boolean {
            // Compared as "greater than zero" rather than "not zero": the
            // response is cached for a day, so a payload that gains or loses a
            // field is served to returning readers long after it changed. An
            // absent extent used to pass a !== 0 check and make the scale NaN,
            // which paints nothing and reports nothing.
            if (!field || !(field.width > 0) || !(field.height > 0)) {
                return false;
            }

            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            const width = canvas!.clientWidth;
            const height = canvas!.clientHeight;

            // A canvas can mount before it has been given a size. Drawing into a
            // zero-width buffer silently produces nothing, so wait to be measured.
            if (width === 0 || height === 0) {
                return false;
            }

            canvas!.width = Math.floor(width * ratio);
            canvas!.height = Math.floor(height * ratio);
            context!.setTransform(ratio, 0, 0, ratio, 0, 0);

            // Fit rather than fill: cropping a state to the viewport is what
            // turns a recognisable shape into scattered dots. Inset so it clears
            // the edges, and capped so it stays a backdrop on a large display.
            //
            // Each axis is measured against its own side of the viewport, so a
            // wide shape uses the width it has. Scaling both axes by the same
            // factor is what keeps the proportions; fitting them to a square is
            // what made Massachusetts look wrong.
            const inset = coverage.inset ?? INSET;
            const cap = coverage.maxPx === undefined ? MAX_FIELD_PX : coverage.maxPx;

            scale = Math.min((width * inset) / field.width, (height * inset) / field.height);

            if (cap !== null) {
                scale = Math.min(scale, cap / Math.max(field.width, field.height));
            }

            offsetX = (width - field.width * scale) / 2;
            offsetY = (height - field.height * scale) / 2;

            // Dots are drawn at a fixed pixel radius, so when the field is
            // scaled down the grid falls closer together than the dots are
            // wide and their alpha stacks into bright clusters. On a phone that
            // put a glare behind the standfirst. Thinning the ink by the same
            // factor keeps the apparent density even at any size.
            density = Math.min(1, Math.max(scale, MIN_DENSITY));

            stillLayer = renderStill();

            return true;
        }

        /**
         * The border and the readers at rest, on their own bitmap.
         *
         * Null when there is nothing to draw or the browser will not give us a
         * second canvas, in which case the field is simply absent.
         */
        function renderStill(): HTMLCanvasElement | null {
            if (!field) {
                return null;
            }

            const layer = document.createElement('canvas');
            layer.width = canvas!.width;
            layer.height = canvas!.height;

            const paint = layer.getContext('2d');

            if (!paint) {
                return null;
            }

            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            paint.setTransform(ratio, 0, 0, ratio, 0, 0);

            // The border first, so the readers sit inside the state.
            paint.strokeStyle = accent;
            paint.globalAlpha = 0.3 * Math.min(1, 0.5 + density / 2);
            paint.lineWidth = 1;

            for (const path of field.outline) {
                paint.beginPath();

                for (let i = 0; i < path.length; i += 2) {
                    const x = path[i] * scale + offsetX;
                    const y = path[i + 1] * scale + offsetY;

                    if (i === 0) {
                        paint.moveTo(x, y);
                    } else {
                        paint.lineTo(x, y);
                    }
                }

                paint.stroke();
            }

            // Dense enough to read as a state, faint enough that a headline
            // sitting over the Atlanta cluster is still comfortable.
            paint.globalAlpha = DOT_ALPHA * density;
            paint.fillStyle = accent;

            const points = field.points;

            for (let i = 0; i < points.length; i += 2) {
                paint.beginPath();
                paint.arc(points[i] * scale + offsetX, points[i + 1] * scale + offsetY, 0.8, 0, Math.PI * 2);
                paint.fill();
            }

            return layer;
        }

        function draw() {
            if (!field) {
                return;
            }

            const width = canvas!.clientWidth;
            const height = canvas!.clientHeight;

            context!.clearRect(0, 0, width, height);

            if (stillLayer) {
                context!.globalAlpha = 1;
                context!.drawImage(stillLayer, 0, 0, width, height);
            }

            const sweepSpan = field.width * 0.09;
            const sweep =
                reduceMotion || field.points.length === 0
                    ? -1
                    : ((frame % 900) / 900) * (field.width * 1.2) - field.width * 0.1;

            // Only the readers the sweep is touching are redrawn, over the ones
            // already on the bitmap. Everything else is untouched.
            if (sweep >= 0) {
                const points = field.points;

                context!.fillStyle = accent;

                for (let i = 0; i < points.length; i += 2) {
                    const distance = Math.abs(points[i] - sweep);

                    if (distance >= sweepSpan) {
                        continue;
                    }

                    const lit = 1 - distance / sweepSpan;

                    context!.globalAlpha = (DOT_ALPHA + lit * 0.5) * density;
                    context!.beginPath();
                    context!.arc(
                        points[i] * scale + offsetX,
                        points[i + 1] * scale + offsetY,
                        0.8 + lit * 1.5,
                        0,
                        Math.PI * 2,
                    );
                    context!.fill();
                }
            }

            const pulse = reduceMotion ? 0.5 : (Math.sin(frame / 34) + 1) / 2;
            // Rings shrink as the number of marks grows, so a map with fifty
            // chapters does not become a field of overlapping circles.
            const many = coverage.markers.length > 12;
            const dot = many ? 2.5 : 3.5;
            const ring = many ? 5 + pulse * 6 : 7 + pulse * 13;

            for (const marker of coverage.markers) {
                const x = marker.x * scale + offsetX;
                const y = marker.y * scale + offsetY;

                // A ground disc under the mark, so a chapter reads clearly even
                // where it sits on a state border.
                context!.globalAlpha = 0.9;
                context!.fillStyle = ground;
                context!.beginPath();
                context!.arc(x, y, dot + 2, 0, Math.PI * 2);
                context!.fill();

                context!.globalAlpha = 1;
                context!.fillStyle = signal;
                context!.beginPath();
                context!.arc(x, y, dot, 0, Math.PI * 2);
                context!.fill();

                context!.globalAlpha = 0.2 + pulse * 0.45;
                context!.strokeStyle = signal;
                context!.lineWidth = 1.5;
                context!.beginPath();
                context!.arc(x, y, ring, 0, Math.PI * 2);
                context!.stroke();
            }

            context!.globalAlpha = 1;
        }

        function tick() {
            frame++;
            draw();
            raf = requestAnimationFrame(tick);
        }

        function start() {
            cancelAnimationFrame(raf);

            if (stopped || !resize()) {
                return;
            }

            // Painted once, immediately, before any animation frame is asked
            // for. A tab that never schedules a frame — hidden, throttled,
            // backgrounded — still shows the field rather than nothing.
            draw();

            if (!reduceMotion) {
                raf = requestAnimationFrame(tick);
            }
        }

        // The element's own size can arrive after mount — a hidden pane, a late
        // layout, a font swap. A window resize listener misses all of those.
        const observer = new ResizeObserver(start);

        function onMotionChange() {
            reduceMotion = motionQuery.matches;
            start();
        }

        fetch(coverage.url)
            .then((response) => (response.ok ? response.json() : null))
            .then((data: Field | null) => {
                if (stopped) {
                    return;
                }

                if (!isDrawable(data)) {
                    throw new Error('The coverage field is missing its points or its extent.');
                }

                field = data;
                observer.observe(canvas);
                start();
            })
            .catch((error: unknown) => {
                // Decoration that cannot be fetched is simply absent, and the
                // page is unchanged. It is still reported: a fetch chain that
                // swallows everything also swallows a bug in the drawing, and
                // that has already cost this project a blank field once.
                console.error('Coverage field unavailable:', error);
            });

        motionQuery.addEventListener('change', onMotionChange);

        return () => {
            stopped = true;
            cancelAnimationFrame(raf);
            observer.disconnect();
            motionQuery.removeEventListener('change', onMotionChange);
        };
    }, [coverage]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
}
