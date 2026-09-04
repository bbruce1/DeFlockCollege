import { compassOf } from './values';

/**
 * Coverage of the horizon, drawn on the instrument a broadcast engineer would
 * use to look at colour: a vectorscope.
 *
 * The fit is not a pun. Every reader in OpenStreetMap carries the compass
 * bearing it faces, which most surveillance data does not, so the question this
 * campus can actually answer is directional: which way can you leave without
 * being photographed? Each 15-degree sector a camera faces is lit. Unlit
 * sectors are the answer.
 *
 * SVG, and every value is <text> in the DOM at first paint.
 */
const SECTORS = 24;
const SECTOR_DEGREES = 360 / SECTORS;
const SIZE = 360;
const CENTRE = SIZE / 2;
const OUTER = 150;
const INNER = 104;

interface Props {
    coverage: number;
    bearings: number[];
}

function point(radius: number, radians: number): [number, number] {
    return [CENTRE + Math.cos(radians) * radius, CENTRE + Math.sin(radians) * radius];
}

function sectorPath(index: number): string {
    // Clockwise from north, so the plot reads like a compass rather than a graph.
    const start = ((index * SECTOR_DEGREES - 90 - SECTOR_DEGREES / 2) * Math.PI) / 180;
    const end = start + (SECTOR_DEGREES * Math.PI) / 180;
    const [ox, oy] = point(OUTER, start);
    const [oex, oey] = point(OUTER, end);
    const [iex, iey] = point(INNER, end);
    const [ix, iy] = point(INNER, start);

    return [
        `M ${ox} ${oy}`,
        `A ${OUTER} ${OUTER} 0 0 1 ${oex} ${oey}`,
        `L ${iex} ${iey}`,
        `A ${INNER} ${INNER} 0 0 0 ${ix} ${iy}`,
        'Z',
    ].join(' ');
}

export default function Vectorscope({ coverage, bearings }: Props) {
    const usable = bearings.filter((bearing) => bearing >= 0);
    const lit = new Set(
        usable.map((bearing) => Math.floor((((bearing % 360) + 360) % 360) / SECTOR_DEGREES)),
    );
    const percent = Math.round(coverage * 100);

    const dark: string[] = [];

    for (let index = 0; index < SECTORS; index++) {
        if (!lit.has(index)) {
            dark.push(compassOf(index * SECTOR_DEGREES));
        }
    }

    const uniqueDark = Array.from(new Set(dark));

    return (
        <figure className="bcast-figure">
            <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                style={{ maxWidth: '25rem' }}
                role="img"
                aria-label={`Vectorscope: ${percent} percent of the compass around this campus is covered by outward-facing plate readers, from ${usable.length} readers reporting a bearing.`}
            >
                <circle cx={CENTRE} cy={CENTRE} r={OUTER + 18} fill="none" stroke="var(--t-line)" strokeWidth="1" />
                <line x1={CENTRE} y1="12" x2={CENTRE} y2={SIZE - 12} stroke="var(--t-line)" strokeWidth="1" />
                <line x1="12" y1={CENTRE} x2={SIZE - 12} y2={CENTRE} stroke="var(--t-line)" strokeWidth="1" />

                {Array.from({ length: SECTORS }, (unused, index) => (
                    <path
                        key={index}
                        d={sectorPath(index)}
                        fill={lit.has(index) ? 'var(--bc-yellow)' : 'transparent'}
                        stroke={lit.has(index) ? 'var(--t-bg)' : 'var(--t-line)'}
                        strokeWidth="1.5"
                    />
                ))}

                {(['N', 'E', 'S', 'W'] as const).map((label, quarter) => {
                    const [x, y] = point(OUTER + 30, ((quarter * 90 - 90) * Math.PI) / 180);

                    return (
                        <text
                            key={label}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="var(--t-ink-soft)"
                            style={{ font: '500 12px var(--t-data)', letterSpacing: '0.14em' }}
                        >
                            {label}
                        </text>
                    );
                })}

                <text
                    x={CENTRE}
                    y={CENTRE - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--t-ink)"
                    style={{ font: '700 62px var(--t-display)', letterSpacing: '-0.05em' }}
                >
                    {percent}%
                </text>
                <text
                    x={CENTRE}
                    y={CENTRE + 32}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--t-accent)"
                    style={{ font: '500 11px var(--t-data)', letterSpacing: '0.2em' }}
                >
                    OF THE HORIZON
                </text>
            </svg>

            <figcaption className="bcast-readout">
                <b>{lit.size}</b> of {SECTORS} fifteen-degree sectors lit, from <b>{usable.length}</b> readers
                that report which way they point.{' '}
                {uniqueDark.length > 0
                    ? `Unlit toward ${uniqueDark.join(', ')}.`
                    : 'No sector is unlit.'}
            </figcaption>
        </figure>
    );
}
