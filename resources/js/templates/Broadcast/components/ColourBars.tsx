/**
 * SMPTE bars, the thing a channel shows when it is not showing you anything.
 *
 * Used as the station's punctuation: above the hero, between the announcements,
 * and at sign-off. Purely decorative, so it is hidden from assistive tech.
 */
const BARS = ['#c0c0c0', '#ffe23d', '#2ef2ff', '#3ddc84', '#ff2bd6', '#ff3b3b', '#3b5bff'];

interface Props {
    height?: number;
}

export default function ColourBars({ height = 10 }: Props) {
    return (
        <div className="bcast-bars" style={{ height: `${height}px` }} aria-hidden="true">
            {BARS.map((colour) => (
                <span key={colour} style={{ background: colour }} />
            ))}
        </div>
    );
}
