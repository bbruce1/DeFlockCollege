import { useCallback, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Head } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import CoverageField from '@/Chapter/CoverageField';

interface Marker {
    x: number;
    y: number;
    slug: string;
    shortName: string;
    schoolName: string;
    city: string;
    state: string;
    stateName: string;
    instagram: string | null;
    readersWithinMile: number;
    readersInState: number;
}

interface Props {
    coverage: { url: string; markers: Marker[]; readersNearby: number };
}

/** The same proportion of the viewport the front page gives the country. */
const NATION_INSET = 0.74;

/**
 * How close a pointer has to get to a mark, in CSS pixels.
 *
 * Generous next to the dot it stands for. The drawn mark is a few pixels
 * across, and asking somebody to land on that exactly is asking them to work
 * for the thing the page exists to show them.
 */
const HIT_RADIUS = 26;

/**
 * How long the card survives the pointer leaving the mark.
 *
 * Reaching the card means crossing bare map, and the pointer can cross it in a
 * single event. Anything that closes on the first move away closes before the
 * card can be clicked, which no distance threshold fixes — so closing is
 * deferred, and entering the card cancels it.
 */
const CLOSE_DELAY_MS = 220;

/*
 * A gentler step than feels right in isolation. A trackpad fires a burst of
 * wheel events for one flick, so anything that looks reasonable per tick
 * overshoots badly per gesture.
 */
const ZOOM = { min: 1, max: 8, step: 1.16 } as const;

/**
 * The field is shared with the chapter pages, which theme themselves with
 * --accent and --signal. The network chrome has no such tokens, so they are
 * declared here from its own palette: cyan for the readers, red for us.
 */
const FIELD_TOKENS = {
    '--accent': 'var(--color-net)',
    '--signal': 'var(--color-signal)',
    '--bg': 'var(--color-void)',
} as CSSProperties;

/**
 * Every chapter in the network, on the front page's own map.
 *
 * The map is not redrawn here. It is the same component, the same borders and
 * the same red marks; this page only makes those marks answer to a pointer.
 */
export default function MapPage({ coverage }: Props) {
    const [placements, setPlacements] = useState<{ x: number; y: number }[]>([]);
    const [active, setActive] = useState<number | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const transform = useRef<{
        scale: number;
        offsetX: number;
        offsetY: number;
        fitScale: number;
        fieldWidth: number;
        fieldHeight: number;
    } | null>(null);

    const cancelClose = useCallback(() => {
        if (closeTimer.current !== null) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);

    const scheduleClose = useCallback(() => {
        cancelClose();
        closeTimer.current = setTimeout(() => setActive(null), CLOSE_DELAY_MS);
    }, [cancelClose]);

    // Identity has to hold across renders: the field keys its effect on this
    // object, and a fresh one per render would re-fetch the country endlessly.
    const onLayout = useCallback(
        (next: { x: number; y: number }[]) => setPlacements(next),
        [],
    );

    const onTransform = useCallback((next: NonNullable<typeof transform.current>) => {
        transform.current = next;
    }, []);

    const field = useMemo(
        () => ({
            ...coverage,
            inset: NATION_INSET,
            maxPx: null,
            zoom,
            panX: pan.x,
            panY: pan.y,
            onLayout,
            onTransform,
        }),
        [coverage, onLayout, onTransform, zoom, pan.x, pan.y],
    );

    const hovered = active !== null ? coverage.markers[active] : null;
    const spot = active !== null ? placements[active] : null;

    const track = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            if (drag.current) {
                setPan({
                    x: drag.current.panX + (event.clientX - drag.current.x),
                    y: drag.current.panY + (event.clientY - drag.current.y),
                });

                return;
            }

            let closest: number | null = null;
            let best = HIT_RADIUS;

            placements.forEach((placement, index) => {
                const distance = Math.hypot(
                    event.clientX - placement.x,
                    event.clientY - placement.y,
                );

                if (distance < best) {
                    best = distance;
                    closest = index;
                }
            });

            if (closest !== null) {
                cancelClose();
                setActive(closest);

                return;
            }

            // Nothing is close, but the pointer may be on its way to the card.
            // Closing is deferred so it can get there.
            scheduleClose();
        },
        [placements, cancelClose, scheduleClose],
    );

    /**
     * Zooms towards a point on screen, keeping whatever is under it still.
     *
     * The point is converted into the field's own coordinates at the current
     * scale, then the pan is solved so that the same field coordinate lands
     * back under the same pixel at the new scale. Without this the map pulls
     * towards its centre and the thing being looked at slides away.
     */
    const zoomAt = useCallback((factor: number, clientX: number, clientY: number) => {
        const current = transform.current;

        setZoom((was) => {
            const next = Math.min(ZOOM.max, Math.max(ZOOM.min, was * factor));

            if (next === ZOOM.min) {
                setPan({ x: 0, y: 0 });

                return next;
            }

            // Nothing drawn yet means nothing to anchor to; the plain zoom is
            // still correct, just centred.
            if (current && current.scale > 0) {
                const fieldX = (clientX - current.offsetX) / current.scale;
                const fieldY = (clientY - current.offsetY) / current.scale;
                const scale = current.fitScale * next;

                setPan({
                    x: clientX - fieldX * scale - (window.innerWidth - current.fieldWidth * scale) / 2,
                    y: clientY - fieldY * scale - (window.innerHeight - current.fieldHeight * scale) / 2,
                });
            }

            return next;
        });
    }, []);

    const zoomBy = useCallback((factor: number) => {
        setZoom((current) => {
            const next = Math.min(ZOOM.max, Math.max(ZOOM.min, current * factor));

            // Back at the fitted size the pan is meaningless, so it is dropped
            // rather than left holding the country off to one side.
            if (next === ZOOM.min) {
                setPan({ x: 0, y: 0 });
            }

            return next;
        });
    }, []);

    return (
        <Shell bare>
            <Head title="The network" />

            <div style={FIELD_TOKENS}>
                <CoverageField coverage={field} />
            </div>

            {/*
              * A transparent sheet over the fixed field, catching the pointer so
              * the marks can answer to it. The canvas itself stays inert, and
              * the list below is what works without a pointer at all.
              */}
            <div
                onMouseMove={track}
                onMouseDown={(event) => {
                    drag.current = {
                        x: event.clientX,
                        y: event.clientY,
                        panX: pan.x,
                        panY: pan.y,
                    };
                }}
                onMouseUp={() => {
                    drag.current = null;
                }}
                onWheel={(event) =>
                    zoomAt(
                        event.deltaY < 0 ? ZOOM.step : 1 / ZOOM.step,
                        event.clientX,
                        event.clientY,
                    )
                }
                onMouseLeave={() => {
                    drag.current = null;
                    // Deferred, never immediate: the pointer leaving this sheet
                    // is usually the pointer arriving at the card, and clearing
                    // here destroyed the card before it could be reached.
                    scheduleClose();
                }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1,
                    cursor: hovered ? 'pointer' : 'default',
                }}
                aria-hidden="true"
            />

            {hovered && spot ? (
                <Card
                    marker={hovered}
                    at={spot}
                    onEnter={cancelClose}
                    onLeave={scheduleClose}
                />
            ) : null}

            {/* Zoom sits over the map, clear of the chapter list below it. */}
            <div
                style={{
                    position: 'fixed',
                    right: '1.25rem',
                    bottom: '1.25rem',
                    zIndex: 5,
                    display: 'grid',
                    gap: '0.4rem',
                }}
            >
                {zoom > ZOOM.min ? (
                    <button
                        type="button"
                        onClick={() => {
                            setZoom(ZOOM.min);
                            setPan({ x: 0, y: 0 });
                        }}
                        aria-label="Reset the map"
                        className="map-zoom"
                        style={{ fontSize: '0.62rem' }}
                    >
                        RESET
                    </button>
                ) : null}
                <button type="button" onClick={() => zoomBy(ZOOM.step)} aria-label="Zoom in" className="map-zoom">
                    +
                </button>
                <button type="button" onClick={() => zoomBy(1 / ZOOM.step)} aria-label="Zoom out" className="map-zoom">
                    −
                </button>
            </div>

        </Shell>
    );
}

/** Roughly how tall a card gets, for keeping it on screen before it is measured. */
const CARD = { width: 250, height: 240, gap: 16, margin: 8 } as const;

/**
 * Placed beside the mark, then clamped into the viewport.
 *
 * Flipping alone is not enough on a short window: a mark near the top has no
 * room above it either, and the card was landing at a negative offset, half of
 * it off the screen. Clamping keeps every edge reachable, which matters because
 * the card is the only way to reach a chapter from the map by pointer.
 */
function place(at: { x: number; y: number }): { left: number; top: number } {
    const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth;
    const viewportHeight = typeof window === 'undefined' ? 768 : window.innerHeight;

    const preferredLeft =
        at.x + CARD.gap + CARD.width + CARD.margin > viewportWidth
            ? at.x - CARD.width - CARD.gap
            : at.x + CARD.gap;

    const clamp = (value: number, max: number) =>
        Math.max(CARD.margin, Math.min(value, max - CARD.margin));

    return {
        left: clamp(preferredLeft, viewportWidth - CARD.width),
        top: clamp(at.y - 12, viewportHeight - CARD.height),
    };
}

function Card({
    marker,
    at,
    onEnter,
    onLeave,
}: {
    marker: Marker;
    at: { x: number; y: number };
    onEnter: () => void;
    onLeave: () => void;
}) {
    const { left, top } = place(at);

    return (
        <div
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="border border-signal bg-void/95 p-4"
            style={{
                position: 'fixed',
                left,
                top,
                width: CARD.width,
                // A short window must never cut the buttons off the bottom: the
                // card is the only pointer route from a mark to its chapter.
                maxHeight: `calc(100dvh - ${CARD.margin * 2}px)`,
                overflowY: 'auto',
                zIndex: 4,
            }}
        >
            <p className="font-600 leading-tight text-glow">{marker.schoolName}</p>
            <p className="annot mt-1 text-faint">
                {marker.city}, {marker.stateName}
            </p>

            <p className="mt-3 text-sm text-dim">
                <strong className="text-signal">{marker.readersWithinMile}</strong> readers within a
                mile · {marker.readersInState.toLocaleString()} in {marker.state}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
                <a
                    href={`/${marker.slug}`}
                    className="bg-signal px-3 py-1.5 font-data text-xs font-600 text-void no-underline"
                >
                    Visit chapter
                </a>
                {marker.instagram ? (
                    <a
                        href={`https://instagram.com/${marker.instagram}`}
                        target="_blank"
                        rel="noopener nofollow"
                        className="border border-signal px-3 py-1.5 font-data text-xs font-600 text-glow no-underline"
                    >
                        @{marker.instagram}
                    </a>
                ) : null}
            </div>
        </div>
    );
}
