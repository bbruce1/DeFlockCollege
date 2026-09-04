/**
 * A blinking block cursor.
 *
 * Decoration only: it carries no text, so nothing on the page depends on it
 * rendering, and it stops blinking under prefers-reduced-motion.
 */
export default function Cursor() {
    return <span className="tt__cursor" aria-hidden="true" />;
}
