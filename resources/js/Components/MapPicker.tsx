import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Framing a campus.
 *
 * The creator pans and zooms a plain world map, then drags a box. Those four
 * numbers drive every query the chapter needs, so this is the only place a
 * campus is defined.
 *
 * Automatic derivation from the school name was tried and rejected: it fails
 * silently, and a wrong frame looks plausible to everyone except the person who
 * walks the campus daily.
 *
 * Two implementation notes that matter:
 *  - Panning transforms ONE layer and reuses tiles. Rebuilding the grid on every
 *    pointermove re-requests every image and stutters badly.
 *  - Zoom is fractional: tiles render at the nearest integer level and the layer
 *    is scaled for the remainder, so a wheel gesture is continuous. The rate
 *    scales with how far out you are, because a constant rate makes the trip
 *    from the whole country down to a campus take about 45 notches.
 *
 * Dependency free. Leaflet is ~40KB for pan, zoom and a tile grid.
 */

const TILE_PX = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const DEFAULT_ZOOM = 4;
const DEFAULT_LAT = 39.5;
const DEFAULT_LON = -98.35;
const MAX_LAT = 85.05112878;

const WHEEL_RATE_FAR = 0.026;
const WHEEL_RATE_NEAR = 0.0032;
const MAX_ZOOM_PER_EVENT = 3.5;
const LINES_TO_PIXELS = 16;
const PAGES_TO_PIXELS = 100;

const MIN_DRAG_PX = 12;
/** The chapter hero is a wide banner, so a frame is locked to that shape. */
const SELECTION_ASPECT = 16 / 9;

export interface Bounds {
    south: number;
    west: number;
    north: number;
    east: number;
}

interface Props {
    onChange: (bounds: Bounds | null) => void;
    height?: number;
}

const lonToWorldX = (lon: number, z: number) => ((lon + 180) / 360) * TILE_PX * 2 ** z;

function latToWorldY(lat: number, z: number): number {
    const clamped = Math.max(Math.min(lat, MAX_LAT), -MAX_LAT);
    const sin = Math.sin((clamped * Math.PI) / 180);
    return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * TILE_PX * 2 ** z;
}

const worldXToLon = (x: number, z: number) => (x / (TILE_PX * 2 ** z)) * 360 - 180;

function worldYToLat(y: number, z: number): number {
    const n = Math.PI - (2 * Math.PI * y) / (TILE_PX * 2 ** z);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

/** Zoom per notch scales with distance out, so crossing a country is not 45 notches. */
function wheelRate(zoom: number): number {
    const t = Math.max(0, Math.min(1, (zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)));
    return WHEEL_RATE_FAR + (WHEEL_RATE_NEAR - WHEEL_RATE_FAR) * t;
}

export default function MapPicker({ onChange, height = 460 }: Props) {
    const container = useRef<HTMLDivElement>(null);
    const layer = useRef<HTMLDivElement>(null);
    const tiles = useRef(new Map<string, HTMLImageElement>());
    const view = useRef({ lat: DEFAULT_LAT, lon: DEFAULT_LON, zoom: DEFAULT_ZOOM });
    const renderedZoom = useRef(-1);
    const drag = useRef({ panning: false, drawing: false, x: 0, y: 0, anchorX: 0, anchorY: 0 });

    const [mode, setMode] = useState<'pan' | 'select'>('pan');
    const [box, setBox] = useState<Bounds | null>(null);
    const modeRef = useRef(mode);
    modeRef.current = mode;

    const size = useCallback(() => {
        const rect = container.current?.getBoundingClientRect();
        return { width: rect?.width ?? 0, height: rect?.height ?? 0 };
    }, []);

    const baseZoom = () => Math.round(view.current.zoom);
    const scale = () => 2 ** (view.current.zoom - baseZoom());

    const project = useCallback((lat: number, lon: number) => {
        const z = baseZoom();
        const s = scale();
        const { width, height: h } = size();
        return {
            x: (lonToWorldX(lon, z) - lonToWorldX(view.current.lon, z)) * s + width / 2,
            y: (latToWorldY(lat, z) - latToWorldY(view.current.lat, z)) * s + h / 2,
        };
    }, [size]);

    const unproject = useCallback((x: number, y: number) => {
        const z = baseZoom();
        const s = scale();
        const { width, height: h } = size();
        return {
            lat: worldYToLat(latToWorldY(view.current.lat, z) + (y - h / 2) / s, z),
            lon: worldXToLon(lonToWorldX(view.current.lon, z) + (x - width / 2) / s, z),
        };
    }, [size]);

    const renderTiles = useCallback(() => {
        const host = layer.current;
        if (!host) return;

        const z = baseZoom();
        const s = scale();
        const { width, height: h } = size();
        if (width === 0 || h === 0) return;

        // A zoom level change means a different tile set; drop the old one.
        if (z !== renderedZoom.current) {
            tiles.current.forEach((tile) => tile.remove());
            tiles.current.clear();
            renderedZoom.current = z;
        }

        const span = 2 ** z;
        const cx = lonToWorldX(view.current.lon, z);
        const cy = latToWorldY(view.current.lat, z);
        const firstX = Math.floor((cx - width / 2 / s) / TILE_PX) - 1;
        const lastX = Math.floor((cx + width / 2 / s) / TILE_PX) + 1;
        const firstY = Math.max(Math.floor((cy - h / 2 / s) / TILE_PX) - 1, 0);
        const lastY = Math.min(Math.floor((cy + h / 2 / s) / TILE_PX) + 1, span - 1);

        for (let y = firstY; y <= lastY; y += 1) {
            for (let x = firstX; x <= lastX; x += 1) {
                const key = `${z}/${x}/${y}`;
                if (tiles.current.has(key)) continue;

                const wrapped = ((x % span) + span) % span;
                const img = document.createElement('img');
                img.className = 'absolute left-0 top-0 h-64 w-64 select-none';
                img.alt = '';
                img.draggable = false;
                img.style.transform = `translate3d(${x * TILE_PX}px, ${y * TILE_PX}px, 0)`;
                img.src = `https://tile.openstreetmap.org/${z}/${wrapped}/${y}.png`;
                tiles.current.set(key, img);
                host.appendChild(img);
            }
        }

        // Drop tiles well outside the view so the layer does not grow forever.
        tiles.current.forEach((tile, key) => {
            const [, tx, ty] = key.split('/').map(Number);
            if (tx < firstX - 2 || tx > lastX + 2 || ty < firstY - 2 || ty > lastY + 2) {
                tile.remove();
                tiles.current.delete(key);
            }
        });

        // One transform moves the whole grid: this is the pan path.
        host.style.transform =
            `translate3d(${width / 2 - cx * s}px, ${h / 2 - cy * s}px, 0) scale(${s})`;
    }, [size]);

    const zoomTo = useCallback((next: number, ax: number, ay: number) => {
        const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));
        if (clamped === view.current.zoom) return;

        const before = unproject(ax, ay);
        view.current.zoom = clamped;
        const after = unproject(ax, ay);

        // Hold whatever was under the cursor in place.
        view.current.lon += before.lon - after.lon;
        view.current.lat = Math.max(
            Math.min(view.current.lat + before.lat - after.lat, MAX_LAT),
            -MAX_LAT,
        );
        renderTiles();
    }, [renderTiles, unproject]);

    /** Locked to the page's aspect, applied in screen pixels. Mercator is conformal,
        so a shape fixed on screen keeps its proportions when panned or zoomed. */
    const boxFromDrag = useCallback((fromX: number, fromY: number, toX: number, toY: number): Bounds => {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const width = Math.max(Math.abs(dx), Math.abs(dy) * SELECTION_ASPECT);
        const boxHeight = width / SELECTION_ASPECT;
        const right = fromX + (dx < 0 ? -width : width);
        const bottom = fromY + (dy < 0 ? -boxHeight : boxHeight);

        const topLeft = unproject(Math.min(fromX, right), Math.min(fromY, bottom));
        const bottomRight = unproject(Math.max(fromX, right), Math.max(fromY, bottom));

        return {
            north: topLeft.lat,
            west: topLeft.lon,
            south: bottomRight.lat,
            east: bottomRight.lon,
        };
    }, [unproject]);

    useEffect(() => {
        renderTiles();
        const onResize = () => renderTiles();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [renderTiles]);

    const local = (e: React.PointerEvent) => {
        const rect = container.current!.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e: React.PointerEvent) => {
        const p = local(e);
        container.current?.setPointerCapture(e.pointerId);

        // Shift always draws, so the toggle is a convenience rather than a trap.
        if (modeRef.current === 'select' || e.shiftKey) {
            drag.current = { ...drag.current, drawing: true, panning: false, anchorX: p.x, anchorY: p.y };
        } else {
            drag.current = { ...drag.current, panning: true, drawing: false };
        }
        drag.current.x = p.x;
        drag.current.y = p.y;
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const p = local(e);

        if (drag.current.drawing) {
            const next = boxFromDrag(drag.current.anchorX, drag.current.anchorY, p.x, p.y);
            setBox(next);
            onChange(next);
            return;
        }

        if (!drag.current.panning) return;

        const s = scale();
        const z = baseZoom();
        view.current.lon = worldXToLon(lonToWorldX(view.current.lon, z) - (p.x - drag.current.x) / s, z);
        view.current.lat = worldYToLat(latToWorldY(view.current.lat, z) - (p.y - drag.current.y) / s, z);
        drag.current.x = p.x;
        drag.current.y = p.y;
        renderTiles();
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (container.current?.hasPointerCapture(e.pointerId)) {
            container.current.releasePointerCapture(e.pointerId);
        }

        // A stray click should not leave a zero-sized box behind.
        if (drag.current.drawing) {
            const p = local(e);
            if (
                Math.abs(p.x - drag.current.anchorX) < MIN_DRAG_PX &&
                Math.abs(p.y - drag.current.anchorY) < MIN_DRAG_PX
            ) {
                setBox(null);
                onChange(null);
            }
        }

        drag.current.panning = false;
        drag.current.drawing = false;
    };

    useEffect(() => {
        const el = container.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            // deltaMode varies by device: pixels, lines, or pages.
            const unit = e.deltaMode === 1 ? LINES_TO_PIXELS : e.deltaMode === 2 ? PAGES_TO_PIXELS : 1;
            const raw = -e.deltaY * unit * wheelRate(view.current.zoom);
            const step = Math.max(-MAX_ZOOM_PER_EVENT, Math.min(MAX_ZOOM_PER_EVENT, raw));
            const rect = el.getBoundingClientRect();
            zoomTo(view.current.zoom + step, e.clientX - rect.left, e.clientY - rect.top);
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [zoomTo]);

    // Re-project the box on every render so it stays pinned to the world.
    const visual = box
        ? (() => {
              const tl = project(box.north, box.west);
              const br = project(box.south, box.east);
              return { left: tl.x, top: tl.y, width: Math.max(br.x - tl.x, 0), height: Math.max(br.y - tl.y, 0) };
          })()
        : null;

    return (
        <div>
            <div className="flex">
                {(['pan', 'select'] as const).map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setMode(value)}
                        aria-pressed={mode === value}
                        className={`annot border px-4 py-2 ${
                            mode === value
                                ? 'border-net bg-net text-void'
                                : 'border-hair-lit bg-panel text-dim hover:text-glow'
                        } ${value === 'select' ? 'border-l-0' : ''}`}
                    >
                        {value === 'pan' ? 'Move map' : 'Draw area'}
                    </button>
                ))}
            </div>

            <div
                ref={container}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="relative -mt-px overflow-hidden border border-hair-lit bg-panel"
                style={{
                    height,
                    touchAction: 'none',
                    cursor: mode === 'select' ? 'crosshair' : 'grab',
                    filter: 'saturate(0.45) brightness(0.72) contrast(1.1)',
                }}
            >
                <div ref={layer} className="absolute left-0 top-0 origin-top-left will-change-transform" />

                {visual && (
                    <div
                        className="pointer-events-none absolute border-2 border-net"
                        style={{
                            left: visual.left,
                            top: visual.top,
                            width: visual.width,
                            height: visual.height,
                            background: 'rgba(34, 211, 238, 0.14)',
                            boxShadow: '0 0 0 9999px rgba(8, 9, 10, 0.55)',
                        }}
                    />
                )}

                <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener"
                    className="annot absolute bottom-0 right-0 bg-void/80 px-2 py-1 text-[10px] no-underline"
                >
                    © OpenStreetMap contributors
                </a>
            </div>

            <p className="annot mt-3">
                {mode === 'select'
                    ? 'Drag a box around your campus. It locks to the shape of your page.'
                    : 'Drag to move, scroll to zoom. Then switch to Draw area.'}
            </p>
        </div>
    );
}
