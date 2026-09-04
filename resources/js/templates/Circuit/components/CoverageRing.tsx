/**
 * Coverage as a rotary encoder pad ring.
 *
 * Each reader carries a compass bearing, which most surveillance data does not,
 * so the question the ring answers is not how many but which way out. A filled
 * segment is a heading somebody is already recording. The percentage is text in
 * the middle of the SVG, correct at first paint.
 */

const SEGMENTS = 24;
const SEGMENT_DEGREES = 360 / SEGMENTS;
const SIZE = 360;
const CENTRE = SIZE / 2;
const OUTER = 152;
const INNER = 112;

function segmentPath(index: number): string {
    const start = ((index * SEGMENT_DEGREES - 90 - SEGMENT_DEGREES / 2) * Math.PI) / 180;
    const end = start + (SEGMENT_DEGREES * Math.PI) / 180;
    const x = (r: number, a: number) => CENTRE + Math.cos(a) * r;
    const y = (r: number, a: number) => CENTRE + Math.sin(a) * r;

    return [
        `M ${x(OUTER, start)} ${y(OUTER, start)}`,
        `A ${OUTER} ${OUTER} 0 0 1 ${x(OUTER, end)} ${y(OUTER, end)}`,
        `L ${x(INNER, end)} ${y(INNER, end)}`,
        `A ${INNER} ${INNER} 0 0 0 ${x(INNER, start)} ${y(INNER, start)}`,
        'Z',
    ].join(' ');
}

export default function CoverageRing({ coverage, bearings }: { coverage: number; bearings: number[] }) {
    const covered = new Set(
        bearings
            .filter((bearing) => bearing >= 0)
            .map((bearing) => Math.floor((((bearing % 360) + 360) % 360) / SEGMENT_DEGREES)),
    );

    const percent = Math.round(coverage * 100);

    return (
        <figure className="ckt-figure" style={{ maxWidth: '22rem' }}>
            <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label={`${percent} percent of the compass around this campus is covered by outward-facing plate readers.`}
            >
                {Array.from({ length: SEGMENTS }, (_, index) => (
                    <path
                        key={index}
                        d={segmentPath(index)}
                        fill={covered.has(index) ? 'var(--t-accent)' : '#0e3221'}
                        stroke="#061a10"
                        strokeWidth="2"
                    />
                ))}

                <circle cx={CENTRE} cy={CENTRE} r={INNER - 10} fill="none" stroke="var(--t-line)" strokeWidth="1.5" />

                {(['N', 'E', 'S', 'W'] as const).map((label, i) => {
                    const angle = ((i * 90 - 90) * Math.PI) / 180;
                    return (
                        <text
                            key={label}
                            x={CENTRE + Math.cos(angle) * (OUTER + 16)}
                            y={CENTRE + Math.sin(angle) * (OUTER + 16)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="var(--t-ink-soft)"
                            style={{ font: '500 12px var(--t-data)', letterSpacing: '0.12em' }}
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
                    style={{ font: '700 62px var(--t-display)', letterSpacing: '-0.05em' }}
                >
                    {percent}%
                </text>
                <text
                    x={CENTRE}
                    y={CENTRE + 32}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--t-ink-soft)"
                    style={{ font: '500 10px var(--t-data)', letterSpacing: '0.2em' }}
                >
                    OF THE HORIZON
                </text>
            </svg>
        </figure>
    );
}
