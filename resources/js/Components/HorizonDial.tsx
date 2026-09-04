/**
 * The signature instrument.
 *
 * Every reader in OpenStreetMap carries a compass bearing, which is unusual: most
 * surveillance data is points on a map with no orientation. Because these have
 * headings, the page can answer a question a dot map cannot — which way can you
 * leave campus without being recorded? The dial fills each 15 degree sector a
 * camera faces, and the answer is the number in the middle.
 *
 * Drawn as SVG rather than canvas on purpose: the sectors are in the DOM with
 * their correct values at first paint, so nothing here depends on a script
 * running, an observer firing, or a frame landing.
 */

const SECTORS = 24;
const SECTOR_DEGREES = 360 / SECTORS;

interface Props {
    /** Share of the horizon covered, 0 to 1. Computed on the server. */
    coverage: number;
    /** Bearings in degrees, for drawing which sectors are filled. */
    bearings: number[];
    size?: number;
}

function sectorPath(index: number, inner: number, outer: number, centre: number): string {
    // Screen angles run clockwise from north, which is how a compass reads.
    const start = ((index * SECTOR_DEGREES - 90 - SECTOR_DEGREES / 2) * Math.PI) / 180;
    const end = start + (SECTOR_DEGREES * Math.PI) / 180;

    const x = (r: number, a: number) => centre + Math.cos(a) * r;
    const y = (r: number, a: number) => centre + Math.sin(a) * r;

    return [
        `M ${x(outer, start)} ${y(outer, start)}`,
        `A ${outer} ${outer} 0 0 1 ${x(outer, end)} ${y(outer, end)}`,
        `L ${x(inner, end)} ${y(inner, end)}`,
        `A ${inner} ${inner} 0 0 0 ${x(inner, start)} ${y(inner, start)}`,
        'Z',
    ].join(' ');
}

export default function HorizonDial({ coverage, bearings, size = 340 }: Props) {
    const centre = size / 2;
    const outer = size * 0.44;
    const inner = size * 0.31;

    const covered = new Set(
        bearings
            .filter((bearing) => bearing >= 0)
            .map((bearing) => Math.floor((((bearing % 360) + 360) % 360) / SECTOR_DEGREES)),
    );

    const percent = Math.round(coverage * 100);

    return (
        <figure className="m-0">
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full max-w-[380px]"
                role="img"
                aria-label={`${percent} percent of the compass around this campus is covered by outward-facing plate readers.`}
            >
                {Array.from({ length: SECTORS }, (_, index) => (
                    <path
                        key={index}
                        d={sectorPath(index, inner, outer, centre)}
                        fill={covered.has(index) ? 'var(--color-signal)' : 'var(--color-vellum-deep)'}
                        stroke="var(--color-paper)"
                        strokeWidth="1.5"
                    />
                ))}

                <circle
                    cx={centre}
                    cy={centre}
                    r={inner - 7}
                    fill="none"
                    stroke="var(--color-graticule)"
                    strokeWidth="1"
                />

                {(['N', 'E', 'S', 'W'] as const).map((label, i) => {
                    const angle = ((i * 90 - 90) * Math.PI) / 180;
                    return (
                        <text
                            key={label}
                            x={centre + Math.cos(angle) * (outer + 15)}
                            y={centre + Math.sin(angle) * (outer + 15)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-ink-faint"
                            style={{ font: '500 11px var(--font-data)', letterSpacing: '0.1em' }}
                        >
                            {label}
                        </text>
                    );
                })}

                <text
                    x={centre}
                    y={centre - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-ink"
                    style={{ font: '700 46px var(--font-display)', letterSpacing: '-0.04em' }}
                >
                    {percent}%
                </text>
                <text
                    x={centre}
                    y={centre + 24}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-ink-faint"
                    style={{ font: '400 10px var(--font-data)', letterSpacing: '0.14em' }}
                >
                    OF THE HORIZON
                </text>
            </svg>
        </figure>
    );
}
