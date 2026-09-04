import { useReducedMotion } from './useReducedMotion';

export interface TickerItem {
    key: string;
    value: string;
    note?: string;
}

interface Props {
    items: TickerItem[];
}

/**
 * The tape. Every figure is printed once in real markup before any animation is
 * considered; the second run exists only so the scroll can loop seamlessly, is
 * hidden from assistive technology, and is dropped entirely when the reader has
 * asked for less motion — at which point the tape simply wraps and sits still.
 */
export default function Ticker({ items }: Props) {
    const reduced = useReducedMotion();

    if (items.length === 0) {
        return null;
    }

    const run = (
        <div className="lg-tape-run">
            {items.map((item) => (
                <span key={item.key}>
                    {item.key} <b>{item.value}</b>
                    {item.note ? <span> {item.note}</span> : null}
                </span>
            ))}
        </div>
    );

    return (
        <div className="lg-tape">
            <div className="lg-tape-track">
                {run}
                {reduced ? null : <div aria-hidden="true">{run}</div>}
            </div>
        </div>
    );
}
