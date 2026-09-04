import { useMemo, useState } from 'react';
import type { Reader } from '../../contract';
import BearingGlyph from './BearingGlyph';
import { compassPoint, formatCount, normaliseBearing } from './data';

type SortKey = 'id' | 'position' | 'bearing' | 'face' | 'operator';

type Direction = 'asc' | 'desc';

interface Row {
    id: number;
    x: number;
    y: number;
    bearing: number;
    isFlock: boolean;
}

interface Props {
    readers: Reader[];
}

const COLUMNS: Array<{ key: SortKey; label: string; width: string }> = [
    { key: 'id', label: 'ID', width: '13%' },
    { key: 'position', label: 'Position', width: '29%' },
    { key: 'bearing', label: 'Brg', width: '19%' },
    { key: 'face', label: 'Faces', width: '17%' },
    { key: 'operator', label: 'Operator', width: '22%' },
];

function compare(a: Row, b: Row, key: SortKey): number {
    if (key === 'position') {
        return a.x - b.x || a.y - b.y;
    }

    if (key === 'bearing' || key === 'face') {
        // Unrecorded headings are a fact about the map, not a zero, so they sort
        // to the end in either direction rather than pretending to face north.
        if (a.bearing < 0 || b.bearing < 0) {
            return (a.bearing < 0 ? 1 : 0) - (b.bearing < 0 ? 1 : 0);
        }

        return a.bearing - b.bearing;
    }

    if (key === 'operator') {
        return Number(b.isFlock) - Number(a.isFlock) || a.id - b.id;
    }

    return a.id - b.id;
}

/**
 * The book.
 *
 * The argument this template makes is that a plate reader network is a database,
 * and the honest way to show a database is as rows. Every reader in the frame is
 * one line with its coordinates, its heading and who operates it — the same
 * shape the system holds you in.
 *
 * Sorting is enhancement: the full set is in the DOM in map order before any
 * click, and re-ordering never adds or removes a row.
 */
export default function ReaderTable({ readers }: Props) {
    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [direction, setDirection] = useState<Direction>('asc');

    const rows = useMemo<Row[]>(
        () =>
            readers.map((reader, index) => ({
                id: index + 1,
                x: Math.round(reader[0]),
                y: Math.round(reader[1]),
                bearing: reader[2],
                isFlock: reader[3] === 1,
            })),
        [readers],
    );

    const sorted = useMemo(() => {
        const copy = [...rows];
        copy.sort((a, b) => compare(a, b, sortKey) * (direction === 'asc' ? 1 : -1));

        return copy;
    }, [rows, sortKey, direction]);

    const toggle = (key: SortKey) => {
        if (key === sortKey) {
            setDirection(direction === 'asc' ? 'desc' : 'asc');
            return;
        }

        setSortKey(key);
        setDirection('asc');
    };

    const withBearing = rows.filter((row) => row.bearing >= 0).length;

    return (
        <section className="lg-panel" aria-labelledby="lg-book">
            <div className="lg-panel-bar">
                <span id="lg-book">The book &mdash; every reader in frame</span>
                <em>
                    {formatCount(rows.length)} rows &middot; {formatCount(withBearing)} with a heading
                </em>
            </div>

            <p className="lg-quote-sub" style={{ padding: '0.55rem 0.75rem 0.65rem' }}>
                Coordinates are in the frame this chapter drew, north up. Click a column to
                re-order; nothing is added or hidden by doing so.
            </p>

            <div className="lg-scroll">
                <table className="lg-table">
                    <colgroup>
                        {COLUMNS.map((column, index) => (
                            <col key={`${column.label}-${index}`} style={{ width: column.width }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            {COLUMNS.map((column, index) => {
                                const active = sortKey === column.key;
                                const sort = active
                                    ? direction === 'asc'
                                        ? 'ascending'
                                        : 'descending'
                                    : 'none';

                                return (
                                    <th key={`${column.label}-${index}`} scope="col" aria-sort={sort}>
                                        <button
                                            type="button"
                                            className="lg-sort"
                                            data-active={active ? 'true' : 'false'}
                                            onClick={() => toggle(column.key)}
                                        >
                                            {column.label}
                                            <i aria-hidden="true">
                                                {active ? (direction === 'asc' ? '▲' : '▼') : '·'}
                                            </i>
                                        </button>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((row) => (
                            <tr key={row.id}>
                                <td className="lg-idx">{String(row.id).padStart(3, '0')}</td>
                                <td>
                                    {row.x}, {row.y}
                                </td>
                                <td>
                                    {row.bearing >= 0 ? (
                                        `${Math.round(normaliseBearing(row.bearing))}°`
                                    ) : (
                                        <span className="lg-dash">n/r</span>
                                    )}
                                </td>
                                <td>
                                    <span className="lg-face">
                                        {row.bearing >= 0 ? compassPoint(row.bearing) : '—'}
                                        <BearingGlyph bearing={row.bearing} />
                                    </span>
                                </td>
                                <td className={row.isFlock ? 'lg-flock' : undefined}>
                                    {row.isFlock ? 'Flock' : 'Unlisted'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
