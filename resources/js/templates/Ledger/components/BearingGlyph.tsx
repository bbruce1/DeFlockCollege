interface Props {
    /** Degrees clockwise from north, or -1 when OpenStreetMap has no heading. */
    bearing: number;
    size?: number;
}

const DEFAULT_SIZE = 11;

/**
 * A row's heading, drawn rather than spelled. It repeats the number in the cell
 * beside it on purpose: the glyph is the scannable version, the number is the
 * checkable one, and neither is the only copy.
 */
export default function BearingGlyph({ bearing, size = DEFAULT_SIZE }: Props) {
    if (bearing < 0) {
        return (
            <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                <line x1="2" y1="6" x2="10" y2="6" stroke="var(--t-ink-soft)" strokeWidth="1" />
            </svg>
        );
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 12 12"
            aria-hidden="true"
            focusable="false"
            style={{ transform: `rotate(${bearing}deg)` }}
        >
            <path d="M6 1 L9.5 10.5 L6 8.2 L2.5 10.5 Z" fill="var(--t-signal)" />
        </svg>
    );
}
