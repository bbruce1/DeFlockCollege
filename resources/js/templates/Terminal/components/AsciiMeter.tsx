const CELLS = 40;
const FILLED = '█';
const EMPTY = '░';

interface Props {
    name: string;
    value: number;
    total: number;
    /** Printed after the count, e.g. "of 8,312 statewide". */
    note?: string;
    tone?: 'signal' | 'accent';
}

/**
 * A bar drawn in block characters.
 *
 * The count is a text node beside the bar, so the figure survives a failed font,
 * a narrow screen, or a screen reader that skips the graphic entirely.
 */
export default function AsciiMeter({ name, value, total, note, tone = 'signal' }: Props) {
    const share = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;
    // A non-zero value never rounds away to an empty bar: it would read as none.
    const filled = value > 0 ? Math.max(1, Math.round(share * CELLS)) : 0;

    return (
        <div className="tt__meter">
            <div className="tt__meter-row">
                <span className="tt__meter-name">{name}</span>
                <span className="tt__meter-val">
                    {value.toLocaleString('en-US')}
                    {note ? <span className="tt__meter-name"> {note}</span> : null}
                </span>
            </div>
            <span
                className={tone === 'accent' ? 'tt__meter-bar tt__meter-bar--accent' : 'tt__meter-bar'}
                aria-hidden="true"
            >
                [<b>{FILLED.repeat(filled)}</b>
                {EMPTY.repeat(CELLS - filled)}] {Math.round(share * 100)}%
            </span>
        </div>
    );
}
