/**
 * What changed since the last check.
 *
 * Reader counts are a measurement, not a fact: cameras get installed, and
 * volunteers add ones that were always there. Showing movement is the difference
 * between a number and a trend.
 */
export default function DeltaFigure({ from, to }: { from: number; to: number }) {
    const rising = to > from;

    return (
        <div className="flex items-baseline justify-center gap-6">
            <span className="font-display text-6xl font-bold tabular-nums tracking-tight text-ink-faint">{from}</span>
            <span className="annot text-survey" aria-hidden="true">{rising ? '→' : '←'}</span>
            <span className="font-display text-6xl font-bold tabular-nums tracking-tight text-signal">{to}</span>
            <span className="sr-only">
                {rising ? `Up from ${from} to ${to}.` : `Down from ${from} to ${to}.`}
            </span>
        </div>
    );
}
