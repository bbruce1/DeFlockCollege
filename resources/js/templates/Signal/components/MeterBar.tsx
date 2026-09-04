interface Props {
    label: string;
    value: number;
    /** The value the bar is drawn against. */
    of: number;
    tone?: 'accent' | 'signal';
    valueText?: string;
}

/** A hairline gauge whose number is written beside it, never only inside it. */
export default function MeterBar({ label, value, of, tone = 'accent', valueText }: Props) {
    const share = of > 0 ? Math.min(Math.max(value / of, 0), 1) : 0;

    return (
        <div className="sig-bar-row">
            <div className="sig-bar-label">
                <span>{label}</span>
                <span style={{ color: 'var(--t-ink)' }}>{valueText ?? value.toLocaleString('en-US')}</span>
            </div>
            <div
                className="sig-bar-track"
                role="img"
                aria-label={`${label}: ${value} of ${of}.`}
            >
                {/* A floor of 2px, so a genuinely tiny share still reads as present
                    rather than as a rendering failure. */}
                <div
                    className={tone === 'signal' ? 'sig-bar-fill sig-bar-fill-signal' : 'sig-bar-fill'}
                    style={{ width: `max(2px, ${(share * 100).toFixed(2)}%)` }}
                />
            </div>
        </div>
    );
}
