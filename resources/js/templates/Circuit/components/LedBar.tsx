/**
 * This campus against the whole state, as a bar-graph LED array.
 *
 * One campus is a rounding error on a state total, so a proportional bar alone
 * would show nothing. The array keeps a floor of one lit segment and prints both
 * counts beside it, because the point is the ratio and the ratio is unreadable
 * without the raw numbers.
 */

const SEGMENTS = 40;

interface Props {
    here: number;
    state: number;
    stateName: string;
}

export default function LedBar({ here, state, stateName }: Props) {
    const share = state > 0 ? here / state : 0;
    const lit = Math.max(1, Math.min(SEGMENTS, Math.round(share * SEGMENTS)));
    const percent = state > 0 ? (share * 100).toFixed(share < 0.01 ? 2 : 1) : '0';

    return (
        <figure className="ckt-figure">
            <div
                role="img"
                aria-label={`${here} readers within a mile of campus, out of ${state} mapped across ${stateName}.`}
                style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}
            >
                {Array.from({ length: SEGMENTS }, (_, index) => (
                    <span
                        key={index}
                        style={{
                            flex: '1 1 8px',
                            minWidth: '6px',
                            height: '34px',
                            background: index < lit ? 'var(--t-signal)' : '#10361f',
                            boxShadow: index < lit ? '0 0 12px rgba(255, 90, 77, 0.55)' : 'none',
                            border: '1px solid #061a10',
                        }}
                    />
                ))}
            </div>

            <figcaption className="ckt-readout" style={{ display: 'flex' }}>
                <div>
                    <dt>Within one mile</dt>
                    <dd className="ckt-signal">{here.toLocaleString('en-US')}</dd>
                </div>
                <div>
                    <dt>Across {stateName}</dt>
                    <dd>{state.toLocaleString('en-US')}</dd>
                </div>
                <div>
                    <dt>This board&rsquo;s share</dt>
                    <dd>{percent}%</dd>
                </div>
            </figcaption>
        </figure>
    );
}
