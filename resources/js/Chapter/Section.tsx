/** The shared frame every section sits in, so spacing never drifts between them. */
export default function Section({
    id,
    label,
    children,
    bleed = false,
}: {
    id?: string;
    label?: string;
    children: React.ReactNode;
    bleed?: boolean;
}) {
    return (
        <section
            id={id}
            style={{
                borderTop: bleed ? 'none' : '1px solid var(--line)',
                padding: 'clamp(2.5rem, 7vw, 5rem) clamp(1.1rem, 5vw, 3rem)',
            }}
        >
            <div style={{ maxWidth: '68rem', margin: '0 auto' }}>
                {label ? (
                    <p
                        style={{
                            fontFamily: 'var(--data)',
                            fontSize: '0.72rem',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: 'var(--ink-soft)',
                            margin: '0 0 1.1rem',
                        }}
                    >
                        {label}
                    </p>
                ) : null}
                {children}
            </div>
        </section>
    );
}
