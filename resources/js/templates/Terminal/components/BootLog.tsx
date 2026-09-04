import type { ChapterMap } from '../../contract';
import { count } from '../data';

interface Props {
    map: ChapterMap;
    coverage: number;
    stateName: string;
    shortName: string;
}

interface Line {
    at: string;
    message: string;
    value?: string;
    /** Camera counts are printed in signal red; everything else is machine green. */
    signal?: boolean;
}

/**
 * The boot sequence, made of the campus's real figures rather than filler.
 *
 * Every value is a text node here at first paint. Nothing types itself in, and
 * nothing waits for a script: this reads as a log because it is laid out like
 * one, not because it is animated like one.
 */
export default function BootLog({ map, coverage, stateName, shortName }: Props) {
    const withBearing = map.readers.filter((reader) => reader[2] >= 0).length;

    const lines: Line[] = [
        { at: '0.000', message: 'deflock-campus: session start' },
        { at: '0.004', message: 'mount openstreetmap ro (odbl)' },
        { at: '0.009', message: `subject ${shortName}` },
        { at: '0.017', message: 'scan alpr nodes in frame', value: count(map.readers.length), signal: true },
        { at: '0.024', message: 'scan alpr nodes within 1 mile', value: count(map.readersWithinMile), signal: true },
        { at: '0.031', message: `scan alpr nodes in ${stateName}`, value: count(map.readersInState), signal: true },
        { at: '0.038', message: 'vendor flock safety', value: count(map.flockCount), signal: true },
        { at: '0.046', message: 'nodes reporting a bearing', value: count(withBearing) },
        { at: '0.053', message: 'horizon covered outward', value: `${Math.round(coverage * 100)}%` },
        { at: '0.061', message: 'street ways loaded', value: count(map.streets.length) },
        { at: '0.068', message: 'ready.' },
    ];

    return (
        <ol className="tt__boot">
            {lines.map((line) => (
                <li key={line.at}>
                    <span className="tt__boot-t">[{line.at}]</span>
                    <span className="tt__boot-msg">{line.message}</span>
                    {line.value !== undefined ? (
                        <span className={line.signal ? 'tt__boot-v tt__boot-v--red' : 'tt__boot-v'}>{line.value}</span>
                    ) : null}
                </li>
            ))}
        </ol>
    );
}
