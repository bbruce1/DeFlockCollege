import { SECTOR_COUNT, SECTOR_DEGREES, polar } from '../geometry';

interface Props {
    /** Share of the horizon covered, 0 to 1. Computed on the server. */
    coverage: number;
    /** Camera headings in degrees; negative entries have no recorded heading. */
    headings: number[];
}

const SIZE = 320;
const CENTRE = SIZE / 2;
const OUTER = 128;
const INNER = 92;

/**
 * The horizon, sliced into 15 degree sectors and lit where a camera looks.
 *
 * The percentage is server-derived and printed as text, so it is right whether or
 * not the ring beside it ever draws.
 */
export default function BearingRose({ coverage, headings }: Props) {
    const lit = new Set(
        headings
            .filter((heading) => heading >= 0)
            .map((heading) => Math.floor((((heading % 360) + 360) % 360) / SECTOR_DEGREES) % SECTOR_COUNT),
    );

    const percent = Math.round(coverage * 100);

    return (
        <svg
            className="sig-scope"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={`${percent} percent of the compass around this campus is covered by outward-facing readers.`}
        >
            {Array.from({ length: SECTOR_COUNT }, (_, index) => {
                const start = index * SECTOR_DEGREES - SECTOR_DEGREES / 2;
                const a = polar(CENTRE, start, OUTER);
                const b = polar(CENTRE, start + SECTOR_DEGREES, OUTER);
                const c = polar(CENTRE, start + SECTOR_DEGREES, INNER);
                const d = polar(CENTRE, start, INNER);

                return (
                    <path
                        key={index}
                        d={`M ${a.x} ${a.y} A ${OUTER} ${OUTER} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${INNER} ${INNER} 0 0 0 ${d.x} ${d.y} Z`}
                        fill={lit.has(index) ? 'var(--t-accent)' : 'rgba(255,255,255,0.045)'}
                        stroke="var(--t-bg)"
                        strokeWidth="2"
                    />
                );
            })}

            {Array.from({ length: 72 }, (_, index) => {
                const long = index % 6 === 0;
                const from = polar(CENTRE, index * 5, OUTER + 5);
                const to = polar(CENTRE, index * 5, OUTER + (long ? 14 : 9));

                return (
                    <line
                        key={index}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="var(--t-line)"
                        strokeWidth={long ? 1.4 : 1}
                    />
                );
            })}

            <text
                x={CENTRE}
                y={CENTRE - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--t-accent)"
                style={{ font: '600 54px var(--t-data)', letterSpacing: '-0.04em' }}
            >
                {percent}%
            </text>
            <text
                x={CENTRE}
                y={CENTRE + 30}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--t-ink-soft)"
                style={{ font: '500 9px var(--t-data)', letterSpacing: '0.2em' }}
            >
                OF THE HORIZON
            </text>
        </svg>
    );
}
