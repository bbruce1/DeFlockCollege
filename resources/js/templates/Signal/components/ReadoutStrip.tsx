import type { ChapterMap } from '../../contract';

interface Props {
    map: ChapterMap;
    coverage: number;
    stateName: string;
}

interface Readout {
    figure: string;
    label: string;
    note: string;
    lit: boolean;
}

/**
 * The station's fixed panel. Values are printed, not counted up: a figure that
 * animates is a figure that can be wrong when the animation does not run.
 */
export default function ReadoutStrip({ map, coverage, stateName }: Props) {
    const previous = map.previous;
    const delta = previous === null ? null : map.readersWithinMile - previous.readersWithinMile;

    const readouts: Readout[] = [
        {
            figure: String(map.readersWithinMile),
            label: 'Within one mile',
            note: 'Mapped readers, a floor not a census',
            lit: true,
        },
        {
            figure: String(map.flockCount),
            label: 'Flock units',
            note: 'One vendor, one contract',
            lit: false,
        },
        {
            figure: `${Math.round(coverage * 100)}%`,
            label: 'Horizon covered',
            note: 'Sectors an outward-facing camera holds',
            lit: true,
        },
        {
            figure: String(map.readersInState),
            label: `Across ${stateName}`,
            note: 'Why this ends at the legislature',
            lit: false,
        },
    ];

    if (delta !== null && delta !== 0) {
        readouts.push({
            figure: `${delta > 0 ? '+' : '−'}${Math.abs(delta)}`,
            label: 'Since last sweep',
            note: `Previous count ${previous?.readersWithinMile ?? 0} on ${previous?.generatedAt ?? 'an earlier date'}`,
            lit: delta > 0,
        });
    }

    return (
        <div className="sig-readouts">
            {readouts.map((readout) => (
                <div className="sig-readout" key={readout.label}>
                    <strong className={readout.lit ? 'sig-figure' : 'sig-figure sig-figure-quiet'}>{readout.figure}</strong>
                    <span className="sig-readout-note" style={{ color: 'var(--t-ink)' }}>
                        {readout.label}
                    </span>
                    <span className="sig-readout-note">{readout.note}</span>
                </div>
            ))}
        </div>
    );
}
