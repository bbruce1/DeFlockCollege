import type { Chapter } from '../../contract';

interface Props {
    chapter: Chapter;
    stateName: string;
}

/**
 * The strip a desk keeps pinned above everything: which book is open, where it
 * came from, and when it was last marked. The bounding box is printed because it
 * is the one string that lets a reader re-run the query themselves.
 */
export default function SessionBar({ chapter, stateName }: Props) {
    return (
        <div className="lg-session">
            <span className="lg-live">
                <i aria-hidden="true" />
                {chapter.status === 'live' ? 'Book open' : 'No positions'}
            </span>
            <span>
                Desk <b>{chapter.slug}</b>
            </span>
            <span className="lg-session-name">{chapter.schoolName}</span>
            <span>
                Region <b>{stateName || chapter.state}</b>
            </span>
            <span>
                Marked <b>{chapter.map.generatedAt}</b>
            </span>
            <span>
                Frame <b>{chapter.map.bbox}</b>
            </span>
        </div>
    );
}
