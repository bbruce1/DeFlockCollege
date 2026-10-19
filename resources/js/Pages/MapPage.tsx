import { useCallback, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Head } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import CoverageField from '@/Chapter/CoverageField';
import { centreOf, groupNearby } from '@/Chapter/groupNearby';

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
 * Marks closer than this on screen are shown as one count instead.
 *
 * About where two pulsing rings start to overlap: closer than that and the two
 * are one smear, and the one underneath cannot be pointed at at all.
 */
const GROUP_RADIUS = 24;

/** A fingertip covers more than a cursor tip, so taps get a wider net. */
const TOUCH_HIT_RADIUS = 40;

/** Movement, in CSS pixels, before a press counts as a drag rather than a tap. */
const TAP_SLOP = 8;

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
    const drag = useRef<{ x: number; y: number; panX: number; panY: number; moved: boolean } | null>(null);
    // Every finger (or the mouse) currently pressed on the map, by pointer id.
    const pointers = useRef(new Map<number, { x: number; y: number }>());
    const pinch = useRef<{
        distance: number;
        zoom: number;
        fieldX: number;
        fieldY: number;
    } | null>(null);
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

    // Regrouped on every layout, so zooming in splits a group apart.
    const groups = useMemo(() => groupNearby(placements, GROUP_RADIUS), [placements]);

    // The active mark stands for its whole group: pointing at any one of the
    // overlapping marks opens the card for all of them.
    const activeGroup = active !== null ? groups.find((group) => group.includes(active)) ?? null : null;
    const hovered = activeGroup ? activeGroup.map((index) => coverage.markers[index]) : null;
    const spot = activeGroup ? centreOf(placements, activeGroup) : null;

    /** The mark nearest a point on screen, if one is within reach. */
    const nearest = useCallback(
        (clientX: number, clientY: number, radius: number): number | null => {
            let closest: number | null = null;
            let best = radius;

            placements.forEach((placement, index) => {
                const distance = Math.hypot(clientX - placement.x, clientY - placement.y);

                if (distance < best) {
                    best = distance;
                    closest = index;
                }
            });

            return closest;
        },
        [placements],
    );

    /** Hover, for a mouse only: a finger has no hover, so it taps instead. */
    const hover = useCallback(
        (clientX: number, clientY: number) => {
            const closest = nearest(clientX, clientY, HIT_RADIUS);

            if (closest !== null) {
                cancelClose();
                setActive(closest);

                return;
            }

            // Nothing is close, but the pointer may be on its way to the card.
            // Closing is deferred so it can get there.
            scheduleClose();
        },
        [nearest, cancelClose, scheduleClose],
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

    /**
     * The pan that puts a given point of the field under a given screen point
     * at a given zoom. The same solve as zoomAt, used by the pinch so that the
     * spot between two fingers stays between them as they spread.
     */
    const panFor = useCallback(
        (fieldX: number, fieldY: number, clientX: number, clientY: number, nextZoom: number) => {
            const current = transform.current;

            if (!current || current.scale <= 0) {
                return null;
            }

            const scale = current.fitScale * nextZoom;

            return {
                x: clientX - fieldX * scale - (window.innerWidth - current.fieldWidth * scale) / 2,
                y: clientY - fieldY * scale - (window.innerHeight - current.fieldHeight * scale) / 2,
            };
        },
        [],
    );

    const startPinch = useCallback(() => {
        const [a, b] = [...pointers.current.values()];
        const current = transform.current;

        if (!a || !b || !current || current.scale <= 0) {
            return;
        }

        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;

        pinch.current = {
            distance: Math.hypot(a.x - b.x, a.y - b.y) || 1,
            zoom,
            fieldX: (midX - current.offsetX) / current.scale,
            fieldY: (midY - current.offsetY) / current.scale,
        };
        drag.current = null;
    }, [zoom]);

    const onPointerDown = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

            if (pointers.current.size === 2) {
                startPinch();

                return;
            }

            drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y, moved: false };
        },
        [pan.x, pan.y, startPinch],
    );

    const onPointerMove = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (pointers.current.has(event.pointerId)) {
                pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
            }

            if (pinch.current && pointers.current.size >= 2) {
                const [a, b] = [...pointers.current.values()];
                const spread = Math.hypot(a.x - b.x, a.y - b.y);
                const next = Math.min(ZOOM.max, Math.max(ZOOM.min, pinch.current.zoom * (spread / pinch.current.distance)));
                const target = panFor(pinch.current.fieldX, pinch.current.fieldY, (a.x + b.x) / 2, (a.y + b.y) / 2, next);

                setZoom(next);
                setPan(next === ZOOM.min ? { x: 0, y: 0 } : (target ?? pan));

                return;
            }

            if (drag.current) {
                const dx = event.clientX - drag.current.x;
                const dy = event.clientY - drag.current.y;

                if (!drag.current.moved && Math.hypot(dx, dy) < TAP_SLOP) {
                    return;
                }

                drag.current.moved = true;
                setPan({ x: drag.current.panX + dx, y: drag.current.panY + dy });

                return;
            }

            if (event.pointerType === 'mouse') {
                hover(event.clientX, event.clientY);
            }
        },
        [hover, pan, panFor],
    );

    const onPointerEnd = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            const wasDrag = drag.current;
            const wasPinch = pinch.current !== null;

            pointers.current.delete(event.pointerId);

            if (pointers.current.size < 2) {
                pinch.current = null;
            }

            // A finger lifted mid-pinch leaves one down: carry on as a drag from
            // where it is, rather than jumping back to where it started.
            if (wasPinch && pointers.current.size === 1) {
                const [rest] = [...pointers.current.values()];
                drag.current = { x: rest.x, y: rest.y, panX: pan.x, panY: pan.y, moved: true };

                return;
            }

            drag.current = null;

            // A touch or pen tap that did not move selects the nearest mark, or
            // closes the open card when it lands on bare map.
            if (event.type === 'pointerup' && event.pointerType !== 'mouse' && wasDrag && !wasDrag.moved && !wasPinch) {
                const closest = nearest(event.clientX, event.clientY, TOUCH_HIT_RADIUS);

                cancelClose();
                setActive(closest);
            }
        },
        [nearest, cancelClose, pan.x, pan.y],
    );

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
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                onWheel={(event) =>
                    zoomAt(
                        event.deltaY < 0 ? ZOOM.step : 1 / ZOOM.step,
                        event.clientX,
                        event.clientY,
                    )
                }
                onPointerLeave={(event) => {
                    if (event.pointerType !== 'mouse') {
                        return;
                    }

                    // Deferred, never immediate: the pointer leaving this sheet
                    // is usually the pointer arriving at the card, and clearing
                    // here destroyed the card before it could be reached.
                    scheduleClose();
                }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1,
                    cursor: hovered ? 'pointer' : drag.current?.moved ? 'grabbing' : 'grab',
                    // The page itself must not scroll or zoom under a finger:
                    // every drag and pinch here belongs to the map.
                    touchAction: 'none',
                }}
                aria-hidden="true"
            />

            {/*
              * A count over each group, covering the marks it stands for. It
              * takes no pointer events: the sheet underneath still does the
              * hit testing, the same as for a single mark.
              */}
            {groups
                .filter((group) => group.length > 1)
                .map((group) => {
                    const centre = centreOf(placements, group);

                    return (
                        <div
                            key={group.join('-')}
                            aria-hidden="true"
                            className="grid place-items-center rounded-full border-2 border-signal bg-void font-data text-xs font-600 text-glow"
                            style={{
                                position: 'fixed',
                                left: centre.x - GROUP_BADGE / 2,
                                top: centre.y - GROUP_BADGE / 2,
                                width: GROUP_BADGE,
                                height: GROUP_BADGE,
                                zIndex: 2,
                                pointerEvents: 'none',
                            }}
                        >
                            {group.length}
                        </div>
                    );
                })}

            {hovered && spot ? (
                <Card
                    markers={hovered}
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

/** Diameter of a group's count, in CSS pixels: wide enough to hide the rings under it. */
const GROUP_BADGE = 28;

/** Roughly how tall a card gets, for keeping it on screen before it is measured. */
const CARD = { width: 250, height: 240, gap: 16, margin: 8 } as const;

/** Roughly what each further chapter adds to a group's card. */
const CARD_ENTRY_HEIGHT = 110;

/**
 * Placed beside the mark, then clamped into the viewport.
 *
 * Flipping alone is not enough on a short window: a mark near the top has no
 * room above it either, and the card was landing at a negative offset, half of
 * it off the screen. Clamping keeps every edge reachable, which matters because
 * the card is the only way to reach a chapter from the map by pointer.
 */
function place(at: { x: number; y: number }, height: number): { left: number; top: number } {
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
        top: clamp(at.y - 12, viewportHeight - height),
    };
}

function Card({
    markers,
    at,
    onEnter,
    onLeave,
}: {
    markers: Marker[];
    at: { x: number; y: number };
    onEnter: () => void;
    onLeave: () => void;
}) {
    const isGroup = markers.length > 1;
    const { left, top } = place(at, CARD.height + (markers.length - 1) * CARD_ENTRY_HEIGHT);

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
                // Measured from where the card starts, so a long group list
                // scrolls inside the card rather than running off the screen.
                maxHeight: `calc(100dvh - ${top + CARD.margin}px)`,
                overflowY: 'auto',
                zIndex: 4,
            }}
        >
            {isGroup ? (
                <p className="annot mb-3 text-faint">{markers.length} chapters here</p>
            ) : null}

            {markers.map((marker, index) => (
                <div
                    key={marker.slug}
                    className={index > 0 ? 'mt-3 border-t border-hair pt-3' : undefined}
                >
                    {isGroup ? <CompactEntry marker={marker} /> : <Entry marker={marker} />}
                </div>
            ))}
        </div>
    );
}

/** One chapter among several on the card: the same facts, folded onto fewer lines. */
function CompactEntry({ marker }: { marker: Marker }) {
    return (
        <>
            <p className="font-600 leading-tight text-glow">{marker.schoolName}</p>
            <p className="annot mt-1 text-faint">
                {marker.city} · <span className="text-signal">{marker.readersWithinMile}</span> readers
                within a mile
            </p>

            <Links marker={marker} className="mt-2" />
        </>
    );
}

/** One chapter on the card: where it is, what is near it, and the way in. */
function Entry({ marker }: { marker: Marker }) {
    return (
        <>
            <p className="font-600 leading-tight text-glow">{marker.schoolName}</p>
            <p className="annot mt-1 text-faint">
                {marker.city}, {marker.stateName}
            </p>

            <p className="mt-3 text-sm text-dim">
                <strong className="text-signal">{marker.readersWithinMile}</strong> readers within a
                mile · {marker.readersInState.toLocaleString()} in {marker.state}
            </p>

            <Links marker={marker} className="mt-4" />
        </>
    );
}

/** The way into a chapter: its page, and its Instagram when it has one. */
function Links({ marker, className }: { marker: Marker; className: string }) {
    return (
        <div className={`${className} flex flex-wrap gap-2`}>
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
    );
}
