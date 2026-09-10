import { Link } from '@inertiajs/react';
import type { Chapter } from '@/templates/contract';

export default function PageFooter({ chapter }: { chapter: Chapter }) {
    return (
        <footer
            style={{
                borderTop: '1px solid var(--line)',
                padding: 'clamp(2rem, 5vw, 3rem) clamp(1.1rem, 5vw, 3rem)',
                fontSize: '0.85rem',
                color: 'var(--ink-soft)',
                lineHeight: 1.7,
            }}
        >
            <div style={{ maxWidth: '68rem', margin: '0 auto' }}>
                <p style={{ margin: '0 0 0.6rem' }}>
                    <Link href="/" style={{ color: 'var(--ink)', fontWeight: 700 }}>
                        DeFlock Campus
                    </Link>{' '}
                    · {chapter.schoolName} · {chapter.city}, {chapter.state}
                </p>
                <p style={{ margin: 0 }}>
                    Reader locations and counts from OpenStreetMap contributors, available
                    under the ODbL. This chapter is run by students and is not affiliated
                    with, endorsed by, or operated by the school.
                </p>

                <p style={{ margin: '0.8rem 0 0', display: 'flex', flexWrap: 'wrap', gap: '1.2rem' }}>
                    {[
                        ['/about', 'About'],
                        ['/terms', 'Terms'],
                        ['/privacy', 'Privacy'],
                    ].map(([href, label]) => (
                        <Link key={href} href={href} style={{ color: 'var(--ink-soft)' }}>
                            {label}
                        </Link>
                    ))}
                </p>
                {/*
                  * Bottom left, on every chapter, in the same place every time —
                  * the creator was told at setup that this is where they edit
                  * from, so it must not move or hide.
                  */}
                <p style={{ margin: '1.2rem 0 0' }}>
                    <Link
                        href={`/${chapter.slug}/edit`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            border: '1px solid var(--line)',
                            borderRadius: 'var(--radius)',
                            color: 'var(--ink)',
                            textDecoration: 'none',
                            fontFamily: 'var(--data)',
                            fontSize: '0.78rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Edit this chapter
                    </Link>
                </p>
            </div>
        </footer>
    );
}
