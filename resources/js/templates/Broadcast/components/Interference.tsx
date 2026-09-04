/**
 * Scanlines, a rolling tracking band, and a tube vignette.
 *
 * Fixed and pointer-events: none, so it never intercepts a click and never
 * repaints on scroll. It carries no information: if the whole layer failed to
 * render, the page would lose its texture and nothing else. Reduced motion
 * removes the rolling band entirely.
 */
export default function Interference() {
    return (
        <div className="bcast-fx" aria-hidden="true">
            <div className="bcast-fx-scan" />
            <div className="bcast-fx-track" />
            <div className="bcast-fx-vig" />
        </div>
    );
}
