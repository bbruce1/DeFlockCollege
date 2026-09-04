/**
 * The vendor split as a pin map.
 *
 * One pad per reader, lit for the ones belonging to a single vendor. A contract
 * is the thing a council can decline to renew, and seeing most of the pins wired
 * to one supplier is that argument without a sentence.
 */
interface Props {
    flock: number;
    other: number;
}

const MAX_PADS = 160;

export default function VendorPins({ flock, other }: Props) {
    const total = flock + other;
    const shown = Math.min(total, MAX_PADS);
    const flockShown = total > 0 ? Math.round((flock / total) * shown) : 0;
    const share = total > 0 ? Math.round((flock / total) * 100) : 0;

    return (
        <figure className="ckt-figure">
            <div
                role="img"
                aria-label={`${flock} of ${total} readers within a mile are Flock Safety units, ${share} percent.`}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(16px, 1fr))',
                    gap: '5px',
                    padding: '0.9rem',
                    border: '1px solid var(--t-line)',
                    background: '#061a10',
                }}
            >
                {Array.from({ length: shown }, (_, index) => (
                    <span
                        key={index}
                        style={{
                            aspectRatio: '1 / 1',
                            background: index < flockShown ? 'var(--t-signal)' : '#1b4b31',
                            boxShadow: index < flockShown ? 'inset 0 0 0 3px #061a10' : 'inset 0 0 0 3px #061a10',
                        }}
                    />
                ))}
            </div>

            <figcaption className="ckt-readout" style={{ display: 'flex' }}>
                <div>
                    <dt>Flock Safety</dt>
                    <dd className="ckt-signal">{flock.toLocaleString('en-US')}</dd>
                </div>
                <div>
                    <dt>Everyone else</dt>
                    <dd>{other.toLocaleString('en-US')}</dd>
                </div>
                <div>
                    <dt>One supplier</dt>
                    <dd>{share}%</dd>
                </div>
            </figcaption>
            {total > MAX_PADS && (
                <p className="ckt-silk" style={{ marginTop: '0.75rem' }}>
                    Pads shown to scale, {MAX_PADS} of {total.toLocaleString('en-US')}
                </p>
            )}
        </figure>
    );
}
