import { count } from '../data';

interface Props {
    from: number;
    to: number;
    /** Timestamps of the two snapshots being compared. */
    before: string;
    after: string;
}

/**
 * The change since the last refresh, printed as a unified diff.
 *
 * More cameras is the removed line and fewer is the added one only in the sense
 * that a diff has two sides; the colour follows the direction of travel instead,
 * so a rising count reads in the signal colour the cameras own.
 */
export default function DeltaDiff({ from, to, before, after }: Props) {
    const change = to - from;
    const rising = change > 0;

    return (
        <div className="tt__diff" role="group" aria-label="Change in reader count since the previous map refresh">
            <div className="meta">--- snapshot {before || 'previous'}</div>
            <div className="meta">+++ snapshot {after || 'current'}</div>
            <div className="meta">@@ readers_within_mile @@</div>
            <div className="del">- {count(from)}</div>
            <div className={rising ? 'add' : 'del'}>+ {count(to)}</div>
            <div className={rising ? 'add' : 'del'}>
                {rising ? '+' : ''}
                {count(change)} {rising ? 'appeared' : 'removed'}
            </div>
        </div>
    );
}
