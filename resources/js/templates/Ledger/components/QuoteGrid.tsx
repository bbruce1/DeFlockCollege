import type { ChapterMap } from '../../contract';
import { formatCount } from './data';

interface Props {
    map: ChapterMap;
    coverage: number;
    stateName: string;
}

interface Quote {
    key: string;
    value: string;
    accent?: boolean;
    change: { amount: number; since: string } | null;
    note?: string;
}

/** A move is only printed when there is a previous mark to move from. */
function changeFrom(current: number, before: number | undefined, since: string) {
    if (typeof before !== 'number' || before === current) {
        return null;
    }

    return { amount: current - before, since };
}

export default function QuoteGrid({ map, coverage, stateName }: Props) {
    const previous = map.previous;

    const quotes: Quote[] = [
        {
            key: 'Readers within 1 mi',
            value: formatCount(map.readersWithinMile),
            accent: true,
            change: changeFrom(map.readersWithinMile, previous?.readersWithinMile, previous?.generatedAt ?? ''),
            note: 'mapped, not censused',
        },
        {
            key: 'Flock units',
            value: formatCount(map.flockCount),
            change: null,
            note: 'one vendor, one contract',
        },
        {
            key: 'Horizon covered',
            value: `${Math.round(coverage * 100)}%`,
            change: null,
            note: 'of 360 degrees',
        },
        {
            key: `Readers in ${stateName}`,
            value: formatCount(map.readersInState),
            change: changeFrom(map.readersInState, previous?.readersInState, previous?.generatedAt ?? ''),
            note: 'the book this sits in',
        },
    ];

    return (
        <div className="lg-quotes">
            {quotes.map((quote) => (
                <div className="lg-quote" key={quote.key}>
                    <div className="lg-quote-key">{quote.key}</div>
                    <div className={quote.accent ? 'lg-quote-val is-accent' : 'lg-quote-val'}>
                        {quote.value}
                    </div>
                    <div className="lg-quote-sub">
                        {quote.change ? (
                            <span className={quote.change.amount > 0 ? 'lg-up' : 'lg-down'}>
                                {quote.change.amount > 0 ? '▲' : '▼'}{' '}
                                {formatCount(Math.abs(quote.change.amount))} since {quote.change.since}
                            </span>
                        ) : (
                            quote.note
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
