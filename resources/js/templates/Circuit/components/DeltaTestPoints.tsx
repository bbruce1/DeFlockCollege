/**
 * What changed since the last fabrication run.
 *
 * Two test points with a trace between them. A count is a measurement, not a
 * fact: units get installed, and volunteers add ones that were always standing
 * there. Both readings are printed, so which of those happened stays an open
 * question the reader can go and check.
 */
export default function DeltaTestPoints({ from, to }: { from: number; to: number }) {
    const rising = to > from;
    const change = Math.abs(to - from);

    return (
        <figure className="ckt-figure">
            <svg
                viewBox="0 0 520 150"
                role="img"
                aria-label={rising ? `Up from ${from} to ${to} readers.` : `Down from ${from} to ${to} readers.`}
                style={{ maxWidth: '32rem' }}
            >
                <path
                    d="M 90 62 H 430"
                    fill="none"
                    stroke="var(--t-accent)"
                    strokeWidth="4"
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d={rising ? 'M 400 48 L 430 62 L 400 76 Z' : 'M 120 48 L 90 62 L 120 76 Z'}
                    fill="var(--t-accent)"
                />

                <circle cx="90" cy="62" r="26" fill="none" stroke="var(--t-accent)" strokeWidth="4" />
                <circle cx="90" cy="62" r="9" fill="var(--ckt-hole)" />
                <circle cx="430" cy="62" r="26" fill="none" stroke="var(--t-signal)" strokeWidth="4" />
                <circle cx="430" cy="62" r="9" fill="var(--ckt-hole)" />

                <text x="90" y="122" textAnchor="middle" fill="var(--t-ink-soft)"
                      style={{ font: '600 34px var(--t-display)' }}>
                    {from}
                </text>
                <text x="430" y="122" textAnchor="middle" fill="var(--t-signal)"
                      style={{ font: '700 34px var(--t-display)' }}>
                    {to}
                </text>
                <text x="90" y="20" textAnchor="middle" fill="var(--t-ink-soft)"
                      style={{ font: '500 11px var(--t-data)', letterSpacing: '0.18em' }}>
                    TP1 PREVIOUS
                </text>
                <text x="430" y="20" textAnchor="middle" fill="var(--t-ink-soft)"
                      style={{ font: '500 11px var(--t-data)', letterSpacing: '0.18em' }}>
                    TP2 CURRENT
                </text>
                <text x="260" y="46" textAnchor="middle" fill="var(--t-accent)"
                      style={{ font: '600 15px var(--t-data)', letterSpacing: '0.14em' }}>
                    {rising ? `+${change}` : `-${change}`}
                </text>
            </svg>
        </figure>
    );
}
