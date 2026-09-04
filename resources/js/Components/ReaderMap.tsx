import { useState } from 'react';

/**
 * The readers, with the streets removed.
 *
 * Stripping the map back to just the cameras and the directions they face turns
 * background texture into something countable. Each is drawn with its real
 * bearing as a cone, so the plot shows coverage rather than only position.
 *
 * SVG, so every reader is in the DOM at first paint.
 */

/** [x, y, bearing or -1, isFlock] in the shared 0-1000 space. */
type Reader = [number, number, number, number];

interface Props {
    readers: Reader[];
    aspect: number;
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export default function ReaderMap({ readers, aspect }: Props) {
    const [active, setActive] = useState<number | null>(null);
    const width = 1000 * aspect;
    const flockCount = readers.filter((reader) => reader[3] === 1).length;

    const describe = (index: number | null): string => {
        if (index === null) {
            return `${readers.length} readers in this frame, ${flockCount} of them Flock. Hover one.`;
        }
        const reader = readers[index];
        const facing =
            reader[2] >= 0
                ? `facing ${COMPASS[Math.round(reader[2] / 45) % 8]} (${reader[2]}°)`
                : 'no recorded bearing';
        return `${reader[3] === 1 ? 'Flock Safety unit' : 'Reader'}, ${facing}.`;
    };

    return (
        <div>
            <svg
                viewBox={`0 0 ${width} 1000`}
                className="w-full border border-rule bg-paper"
                role="img"
                aria-label={`Plate readers around this campus, ${readers.length} in frame.`}
            >
                <line x1={width / 2} y1="0" x2={width / 2} y2="1000" stroke="var(--color-graticule)" strokeWidth="2" />
                <line x1="0" y1="500" x2={width} y2="500" stroke="var(--color-graticule)" strokeWidth="2" />

                {readers.map((reader, index) => {
                    const [x, y, bearing, isFlock] = reader;
                    const isActive = active === index;
                    const reach = isActive ? 90 : 55;
                    const spread = 0.4;
                    const radians = ((bearing - 90) * Math.PI) / 180;

                    return (
                        <g
                            key={index}
                            onMouseEnter={() => setActive(index)}
                            onMouseLeave={() => setActive(null)}
                            onFocus={() => setActive(index)}
                            onBlur={() => setActive(null)}
                            tabIndex={0}
                            role="button"
                            aria-label={describe(index)}
                            style={{ cursor: 'crosshair' }}
                        >
                            {bearing >= 0 && (
                                <path
                                    d={[
                                        `M ${x} ${y}`,
                                        `L ${x + Math.cos(radians - spread) * reach} ${y + Math.sin(radians - spread) * reach}`,
                                        `A ${reach} ${reach} 0 0 1 ${x + Math.cos(radians + spread) * reach} ${y + Math.sin(radians + spread) * reach}`,
                                        'Z',
                                    ].join(' ')}
                                    fill="var(--color-signal)"
                                    opacity={isActive ? 0.3 : 0.14}
                                />
                            )}
                            <rect
                                x={x - (isActive ? 11 : 7)}
                                y={y - (isActive ? 11 : 7)}
                                width={isActive ? 22 : 14}
                                height={isActive ? 22 : 14}
                                fill={isFlock === 1 ? 'var(--color-signal)' : 'var(--color-ink-soft)'}
                            />
                            {/* An invisible larger target, so a 14px square is still hoverable. */}
                            <circle cx={x} cy={y} r="26" fill="transparent" />
                        </g>
                    );
                })}
            </svg>
            <p className="annot mt-3 min-h-[2.5em]" aria-live="polite">
                {describe(active)}
            </p>
        </div>
    );
}
