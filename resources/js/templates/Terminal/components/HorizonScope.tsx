import { COMPASS } from '../data';

const SECTORS = 24;
const SECTOR_DEGREES = 360 / SECTORS;
const SIZE = 320;
const CENTRE = SIZE / 2;
const OUTER = 132;
const INNER = 86;

interface Props {
    /** Share of the horizon covered, 0 to 1, computed on the server. */
    coverage: number;
    bearings: number[];
}

function wedge(index: number): string {
    // Screen angles run clockwise from north, which is how a compass reads.
    const gap = 1.1;
    const start = ((index * SECTOR_DEGREES - 90 - SECTOR_DEGREES / 2 + gap) * Math.PI) / 180;
    const end = ((index * SECTOR_DEGREES - 90 + SECTOR_DEGREES / 2 - gap) * Math.PI) / 180;
    const x = (r: number, a: number) => (CENTRE + Math.cos(a) * r).toFixed(2);
    const y = (r: number, a: number) => (CENTRE + Math.sin(a) * r).toFixed(2);

    return [
        `M ${x(OUTER, start)} ${y(OUTER, start)}`,
        `A ${OUTER} ${OUTER} 0 0 1 ${x(OUTER, end)} ${y(OUTER, end)}`,
        `L ${x(INNER, end)} ${y(INNER, end)}`,
        `A ${INNER} ${INNER} 0 0 0 ${x(INNER, start)} ${y(INNER, start)}`,
        'Z',
    ].join(' ');
}

/**
 * A scope, not a pie chart.
 *
 * Every mapped reader carries a compass bearing, which is unusual for
 * surveillance data, so the page can answer a question a dot map cannot: which
 * way can you leave campus without being recorded? Each 15 degree sector a
 * camera faces is lit. The number in the middle is the answer, and it is in the
 * DOM before the sweep line ever moves.
 */
export default function HorizonScope({ coverage, bearings }: Props) {
    const lit = new Set(
        bearings
            .filter((bearing) => bearing >= 0)
            .map((bearing) => Math.floor((((bearing % 360) + 360) % 360) / SECTOR_DEGREES)),
    );

    const percent = Math.round(coverage * 100);
    const points = Array.from(
        new Set(
            bearings.filter((bearing) => bearing >= 0).map((bearing) => COMPASS[Math.round(bearing / 45) % 8]),
        ),
    ).sort((a, b) => COMPASS.indexOf(a) - COMPASS.indexOf(b));

    return (
        <figure className="tt__scope">
            <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="tt__scope-svg"
                role="img"
                aria-label={`${percent} percent of the compass around this campus is covered by outward-facing plate readers.`}
            >
                <circle cx={CENTRE} cy={CENTRE} r={OUTER + 14} fill="none" stroke="var(--t-line)" strokeWidth="1" />
                <circle
                    cx={CENTRE}
                    cy={CENTRE}
                    r={INNER - 10}
                    fill="none"
                    stroke="var(--t-line)"
                    strokeWidth="1"
                    strokeDasharray="3 5"
                />
                <line x1={CENTRE} y1="14" x2={CENTRE} y2={SIZE - 14} stroke="var(--t-line)" strokeWidth="1" />
                <line x1="14" y1={CENTRE} x2={SIZE - 14} y2={CENTRE} stroke="var(--t-line)" strokeWidth="1" />

                {Array.from({ length: SECTORS }, (_, index) => (
                    <path
                        key={index}
                        d={wedge(index)}
                        fill={lit.has(index) ? 'var(--t-signal)' : 'transparent'}
                        fillOpacity={lit.has(index) ? 0.82 : 0}
                        stroke={lit.has(index) ? 'var(--t-signal)' : 'var(--t-line)'}
                        strokeWidth="1"
                    />
                ))}

                <g className="tt__scope-sweep" aria-hidden="true">
                    <line
                        x1={CENTRE}
                        y1={CENTRE}
                        x2={CENTRE}
                        y2={CENTRE - OUTER - 14}
                        stroke="var(--t-ink)"
                        strokeWidth="1.5"
                        opacity="0.5"
                    />
                </g>

                {(['N', 'E', 'S', 'W'] as const).map((label, i) => {
                    const angle = ((i * 90 - 90) * Math.PI) / 180;

                    return (
                        <text
                            key={label}
                            x={CENTRE + Math.cos(angle) * (OUTER + 26)}
                            y={CENTRE + Math.sin(angle) * (OUTER + 26)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="var(--t-ink-soft)"
                            style={{ font: '500 11px var(--t-data)', letterSpacing: '0.16em' }}
                        >
                            {label}
                        </text>
                    );
                })}

                <text
                    x={CENTRE}
                    y={CENTRE - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--t-ink)"
                    style={{ font: '500 52px var(--t-data)', letterSpacing: '-0.05em' }}
                >
                    {percent}%
                </text>
                <text
                    x={CENTRE}
                    y={CENTRE + 26}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--t-ink-soft)"
                    style={{ font: '400 10px var(--t-data)', letterSpacing: '0.2em' }}
                >
                    OF HORIZON
                </text>
            </svg>
            <figcaption className="tt__status">
                Lit sectors are bearings a mapped reader faces.{' '}
                {points.length > 0 ? (
                    <>
                        Recorded headings: <b>{points.join(' ')}</b>.
                    </>
                ) : (
                    <>No reader in this frame records a heading.</>
                )}
            </figcaption>
        </figure>
    );
}
