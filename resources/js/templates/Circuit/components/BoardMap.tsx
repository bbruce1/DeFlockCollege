import { compassPoint } from '../board';
import type { Reader, StreetWay } from '../../contract';

/**
 * The campus, drawn as the layout it already is.
 *
 * Streets are the routing and readers are the parts sitting on it, which is not
 * a metaphor stretched to fit: both are a network laid out in a plane with
 * things wired onto it. Every reader with a recorded bearing gets a stub in the
 * direction it faces, so the plot answers which way rather than only how many.
 *
 * SVG, so all of it is in the DOM before a script runs.
 */

const TIER_WIDTH = [7, 4.6, 3, 2] as const;
const STUB_LENGTH = 42;

interface Props {
    streets: StreetWay[];
    readers: Reader[];
    aspect: number;
}

function pointsFor(flat: number[]): string {
    const pairs: string[] = [];

    for (let i = 0; i + 1 < flat.length; i += 2) {
        pairs.push(`${flat[i]},${flat[i + 1]}`);
    }

    return pairs.join(' ');
}

export default function BoardMap({ streets, readers, aspect }: Props) {
    const width = 1000 * (aspect > 0 ? aspect : 1);
    const flockCount = readers.filter((reader) => reader[3] === 1).length;

    return (
        <figure className="ckt-figure">
            <svg
                viewBox={`0 0 ${width} 1000`}
                role="img"
                aria-label={`Layout of ${readers.length} plate readers on the street network around this campus, ${flockCount} of them Flock units.`}
                style={{ border: '1px solid var(--t-line)', background: '#061a10' }}
            >
                <g fill="none" stroke="var(--ckt-copper)" strokeLinecap="round" strokeLinejoin="round">
                    {streets.map((way, index) => (
                        <polyline
                            key={index}
                            points={pointsFor(way[1])}
                            strokeWidth={TIER_WIDTH[Math.min(Math.max(way[0], 0), 3)]}
                            opacity={way[0] <= 1 ? 0.85 : 0.5}
                        />
                    ))}
                </g>

                {readers.map((reader, index) => {
                    const [x, y, bearing, isFlock] = reader;
                    const colour = isFlock === 1 ? 'var(--t-signal)' : 'var(--t-accent)';
                    const radians = ((bearing - 90) * Math.PI) / 180;

                    return (
                        <g key={index}>
                            <title>
                                {isFlock === 1 ? 'Flock Safety unit' : 'Reader'}
                                {bearing >= 0 ? `, facing ${compassPoint(bearing)} (${bearing} degrees)` : ', no recorded bearing'}
                            </title>
                            {bearing >= 0 && (
                                <line
                                    x1={x}
                                    y1={y}
                                    x2={x + Math.cos(radians) * STUB_LENGTH}
                                    y2={y + Math.sin(radians) * STUB_LENGTH}
                                    stroke={colour}
                                    strokeWidth="4"
                                    opacity="0.75"
                                />
                            )}
                            <rect x={x - 9} y={y - 9} width="18" height="18" fill={colour} />
                            <rect x={x - 3} y={y - 3} width="6" height="6" fill="#061a10" />
                        </g>
                    );
                })}
            </svg>

            <figcaption className="ckt-readout" style={{ display: 'flex' }}>
                <div>
                    <dt>Parts placed</dt>
                    <dd>{readers.length.toLocaleString('en-US')}</dd>
                </div>
                <div>
                    <dt>Flock units</dt>
                    <dd className="ckt-signal">{flockCount.toLocaleString('en-US')}</dd>
                </div>
                <div>
                    <dt>Ways routed</dt>
                    <dd>{streets.length.toLocaleString('en-US')}</dd>
                </div>
            </figcaption>
        </figure>
    );
}
