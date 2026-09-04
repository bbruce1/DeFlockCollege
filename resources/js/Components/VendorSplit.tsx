/**
 * How much of the ring belongs to one company.
 *
 * A single vendor means a single contract, and a contract is the thing a council
 * can decline to renew. It turns "surveillance" into a procurement decision with
 * a name on it, which is the most winnable version of this argument.
 */
interface Props {
    flock: number;
    other: number;
}

export default function VendorSplit({ flock, other }: Props) {
    const total = Math.max(flock + other, 1);

    const rows = [
        { label: 'Flock Safety', value: flock, fill: 'var(--color-signal)', tone: 'text-signal' },
        { label: 'Everyone else', value: other, fill: 'var(--color-ink-soft)', tone: 'text-ink-soft' },
    ];

    return (
        <div className="grid gap-4">
            {rows.map((row) => (
                <div key={row.label} className="grid gap-2">
                    <div className="flex items-baseline justify-between gap-5">
                        <span className="annot">{row.label}</span>
                        <span className={`font-display text-3xl font-bold tabular-nums tracking-tight ${row.tone}`}>
                            {row.value}
                        </span>
                    </div>
                    <div className="h-3 border border-rule bg-vellum-deep">
                        <div className="h-full" style={{ width: `${(row.value / total) * 100}%`, background: row.fill }} />
                    </div>
                </div>
            ))}
        </div>
    );
}
