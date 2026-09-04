import { useState } from 'react';
import type { Reader, StreetWay } from '../../contract';
import { compassOf } from '../data';

interface Props {
    readers: Reader[];
    streets: StreetWay[];
    aspect: number;
}

/** Arterials read heavier than service roads, the way a map key would have it. */
const TIER_WIDTH = [3.2, 2.2, 1.4, 0.9];

function pathFor(points: number[]): string {
    let path = '';

    for (let i = 0; i + 1 < points.length; i += 2) {
        path += `${i === 0 ? 'M' : 'L'} ${points[i]} ${points[i + 1]} `;
    }

    return path.trim();
}

/**
 * The frame plotted as query output.
 *
 * SVG rather than canvas, so every reader is a node in the document with its own
 * label: the count is checkable by reading the page rather than by trusting a
 * script. Hovering or tabbing to one prints its bearing on the status line, the
 * way a plotting tool would report the point under the crosshair.
 */
export default function ReaderPlot({ readers, streets, aspect }: Props) {
    const [active, setActive] = useState<number | null>(null);
    const width = Math.round(1000 * (aspect > 0 ? aspect : 1));
    const flockCount = readers.filter((reader) => reader[3] === 1).length;

    const describe = (index: number | null) => {
        if (index === null) {
            return `${readers.length} in frame, ${flockCount} of them Flock Safety. Hover or tab a marker.`;
        }

        const [x, y, bearing, isFlock] = readers[index];
        const heading = bearing >= 0 ? `${compassOf(bearing)} ${bearing}deg` : 'no recorded heading';
        const id = `R-${String(index + 1).padStart(3, '0')}`;

        return `${id}  ${isFlock === 1 ? 'flock safety' : 'reader'}  ${heading}  x=${Math.round(x)} y=${Math.round(y)}`;
    };

    return (
        <figure>
            <svg
                viewBox={`0 0 ${width} 1000`}
                className="tt__plot"
                role="img"
                aria-label={`Plot of ${readers.length} plate readers around this campus, with the street network behind them.`}
            >
                <defs>
                    <pattern id="tt-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--t-line)" strokeWidth="0.8" />
                    </pattern>
                </defs>
                <rect width={width} height="1000" fill="url(#tt-grid)" opacity="0.55" />

                <g stroke="var(--t-ink-soft)" fill="none" opacity="0.4" strokeLinecap="square">
                    {streets.map((way, index) => (
                        <path
                            key={index}
                            d={pathFor(way[1] ?? [])}
                            strokeWidth={TIER_WIDTH[way[0]] ?? 1}
                        />
                    ))}
                </g>

                {readers.map((reader, index) => {
                    const [x, y, bearing, isFlock] = reader;
                    const isActive = active === index;
                    const size = isActive ? 20 : 13;
                    const reach = isActive ? 110 : 66;
                    const radians = ((bearing - 90) * Math.PI) / 180;
                    const colour = isFlock === 1 ? 'var(--t-signal)' : 'var(--t-ink)';

                    return (
                        <g
                            key={index}
                            tabIndex={0}
                            role="img"
                            aria-label={describe(index)}
                            onMouseEnter={() => setActive(index)}
                            onMouseLeave={() => setActive(null)}
                            onFocus={() => setActive(index)}
                            onBlur={() => setActive(null)}
                        >
                            {bearing >= 0 ? (
                                <path
                                    d={[
                                        `M ${x} ${y}`,
                                        `L ${x + Math.cos(radians - 0.36) * reach} ${y + Math.sin(radians - 0.36) * reach}`,
                                        `A ${reach} ${reach} 0 0 1 ${x + Math.cos(radians + 0.36) * reach} ${y + Math.sin(radians + 0.36) * reach}`,
                                        'Z',
                                    ].join(' ')}
                                    fill={colour}
                                    opacity={isActive ? 0.32 : 0.14}
                                />
                            ) : null}
                            <rect
                                x={x - size / 2}
                                y={y - size / 2}
                                width={size}
                                height={size}
                                fill={isActive ? colour : 'none'}
                                stroke={colour}
                                strokeWidth="2.5"
                            />
                            {/* A larger invisible target, so a 13px square is still hoverable. */}
                            <circle cx={x} cy={y} r="30" fill="transparent" />
                        </g>
                    );
                })}
            </svg>
            <figcaption className="tt__status" aria-live="polite">
                <b>&gt;</b> {describe(active)}
            </figcaption>
        </figure>
    );
}
