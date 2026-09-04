import { count } from './values';

/**
 * This campus against the whole state, on a waveform monitor.
 *
 * A ring around one campus is easy for an office to file as a local complaint.
 * Drawn against the state total it becomes a procurement pattern, which is the
 * step from "our school" to "the legislature".
 *
 * The campus trace is given a visible floor, because a real share is often a
 * fraction of one percent and a zero-pixel bar reads as an error rather than as
 * a small number. The caption says so, and both true figures are printed.
 */
const WIDTH = 620;
const HEIGHT = 150;
const TRACK = 44;
const FLOOR = 5;

interface Props {
    here: number;
    state: number;
    stateName: string;
}

export default function WaveformMonitor({ here, state, stateName }: Props) {
    const share = state > 0 ? here / state : 0;
    const drawn = Math.max(share * WIDTH, here > 0 ? FLOOR : 0);
    const ratio = here > 0 && state > 0 ? Math.round(state / here) : 0;

    return (
        <figure className="bcast-figure" style={{ justifyItems: 'stretch' }}>
            <div className="bcast-monitor-head">
                <span className="bcast-mono">Waveform &middot; campus over state</span>
                <span className="bcast-mono">{(share * 100).toFixed(share < 0.01 ? 2 : 1)}% of the state</span>
            </div>

            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                role="img"
                aria-label={`${here} readers mapped within a mile of this campus, out of ${state} mapped in ${stateName}.`}
            >
                {[0, 25, 50, 75, 100].map((mark) => (
                    <g key={mark}>
                        <line
                            x1={(mark / 100) * WIDTH}
                            y1="0"
                            x2={(mark / 100) * WIDTH}
                            y2={HEIGHT - 22}
                            stroke="var(--t-line)"
                            strokeWidth="1"
                        />
                        <text
                            x={mark === 100 ? WIDTH - 4 : (mark / 100) * WIDTH + 4}
                            y={HEIGHT - 6}
                            textAnchor={mark === 100 ? 'end' : 'start'}
                            fill="var(--t-ink-soft)"
                            style={{ font: '400 11px var(--t-data)', letterSpacing: '0.1em' }}
                        >
                            {mark}
                        </text>
                    </g>
                ))}

                <rect x="0" y="8" width={WIDTH} height={TRACK} fill="rgba(142,155,180,0.22)" />
                <text
                    x="10"
                    y={8 + TRACK / 2 + 4}
                    fill="var(--t-ink)"
                    style={{ font: '500 12px var(--t-data)', letterSpacing: '0.14em' }}
                >
                    {stateName.toUpperCase()} &middot; {count(state)}
                </text>

                <rect x="0" y={16 + TRACK} width={drawn} height={TRACK} fill="var(--bc-yellow)" />
                <text
                    x={drawn + 10}
                    y={16 + TRACK + TRACK / 2 + 4}
                    fill="var(--t-ink)"
                    style={{ font: '500 12px var(--t-data)', letterSpacing: '0.14em' }}
                >
                    THIS CAMPUS &middot; {count(here)}
                </text>
            </svg>

            <figcaption className="bcast-readout">
                <b>{count(here)}</b> within a mile of campus, <b>{count(state)}</b> mapped across {stateName}.
                {ratio > 1 ? ` One in every ${count(ratio)} in the state stands around this one campus.` : ''} The
                campus trace is drawn with a minimum width so a small share is still visible; the printed figures
                are the counted ones.
            </figcaption>
        </figure>
    );
}
