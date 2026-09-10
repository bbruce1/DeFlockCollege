import type { Texture as TextureKind } from '@/templates/skins';

/**
 * The atmosphere behind a page, in CSS alone.
 *
 * Purely decorative and marked as such, so it is skipped by assistive
 * technology and never carries meaning a reader could miss.
 */
export default function Texture({ kind }: { kind: TextureKind }) {
    if (kind === 'none') {
        return null;
    }

    const styles: Record<Exclude<TextureKind, 'none'>, React.CSSProperties> = {
        scanlines: {
            backgroundImage:
                'repeating-linear-gradient(to bottom, color-mix(in srgb, var(--ink) 6%, transparent) 0 1px, transparent 1px 3px)',
        },
        grid: {
            backgroundImage:
                'linear-gradient(color-mix(in srgb, var(--line) 55%, transparent) 1px, transparent 1px),' +
                'linear-gradient(90deg, color-mix(in srgb, var(--line) 55%, transparent) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
        },
        dots: {
            backgroundImage:
                'radial-gradient(color-mix(in srgb, var(--line) 80%, transparent) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
        },
        noise: {
            backgroundImage:
                'radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 45%),' +
                'radial-gradient(circle at 82% 70%, color-mix(in srgb, var(--signal) 12%, transparent), transparent 50%)',
        },
    };

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                ...styles[kind],
            }}
        />
    );
}
