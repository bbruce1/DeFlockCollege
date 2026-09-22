import type { PostSlide } from '@/Posts/postTemplates';
import { usePhoto } from '@/Posts/usePhoto';

/**
 * One generated post, inside the chrome Instagram wraps around it.
 *
 * The chrome is here so a student recognises what they are being handed at a
 * glance: this is not a diagram of a post, it is the post. Only the square is
 * theirs — everything around it is a drawing of somebody else's app and never
 * leaves this page.
 *
 * No engagement is invented. Real mockups tend to print a like count, and a
 * fabricated one would be the single number on this project that came from
 * nowhere, so the row simply carries the actions.
 */
function MemeSquare({ slide }: { slide: PostSlide }) {
    const photo = usePhoto(slide.photo);

    return (
        <div
            style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                background: photo ? `#000 url(${slide.photo}) center/cover` : slide.ground,
                display: 'flex',
                alignItems: 'flex-end',
                padding: '6%',
                overflow: 'hidden',
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.88) 100%)',
                }}
            />

            <span
                style={{
                    position: 'absolute',
                    top: '6%',
                    left: '6%',
                    padding: '0.22rem 0.5rem',
                    background: 'rgba(0,0,0,0.55)',
                    color: '#fff',
                    fontFamily: 'var(--font-data)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                }}
            >
                {slide.eyebrow}
            </span>

            <p
                style={{
                    position: 'relative',
                    margin: 0,
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 'clamp(1.1rem, 11cqw, 2.6rem)',
                    lineHeight: 0.94,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                }}
            >
                {slide.overlay ?? slide.headline}
            </p>
        </div>
    );
}

export default function InstagramPost({
    slide,
    handle,
    accent,
    caption,
    slideCount = 1,
    slideIndex = 0,
}: {
    slide: PostSlide;
    handle: string;
    accent: string;
    caption: string;
    /** Instagram marks a carousel; so does this, for the same reason. */
    slideCount?: number;
    slideIndex?: number;
}) {
    return (
        <article
            style={{
                width: '100%',
                background: '#000',
                border: '1px solid #262626',
                borderRadius: 10,
                overflow: 'hidden',
                color: '#f5f5f5',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
        >
            <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                <span
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        background: `linear-gradient(45deg, ${accent}, ${slide.accent})`,
                        color: '#000',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                    aria-hidden="true"
                >
                    {handle.slice(0, 1).toUpperCase()}
                </span>

                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.1 }}>{handle}</span>

                <span style={{ marginLeft: 'auto', letterSpacing: 2, color: '#a8a8a8' }} aria-hidden="true">
                    •••
                </span>
            </header>

            {slide.layout === 'meme' ? (
                <MemeSquare slide={slide} />
            ) : (
                <div
                style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    background: slide.ground,
                    color: slide.ink,
                    padding: '9%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                {slideCount > 1 ? (
                    <span
                        style={{
                            position: 'absolute',
                            top: '4%',
                            right: '4%',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 999,
                            background: 'rgba(0,0,0,0.55)',
                            color: '#fff',
                            fontFamily: 'var(--font-data)',
                            fontSize: '0.6rem',
                            letterSpacing: '0.08em',
                        }}
                    >
                        {slideIndex + 1}/{slideCount}
                    </span>
                ) : null}

                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-data)',
                        fontSize: '0.62rem',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: slide.accent,
                    }}
                >
                    {slide.eyebrow}
                </p>

                <div>
                    {slide.figure ? (
                        <p
                            style={{
                                margin: '0 0 0.3rem',
                                fontFamily: 'var(--font-data)',
                                fontSize: 'clamp(2.2rem, 13cqw, 3.4rem)',
                                fontWeight: 700,
                                lineHeight: 0.9,
                                color: slide.accent,
                            }}
                        >
                            {slide.figure}
                        </p>
                    ) : null}

                    <h3
                        style={{
                            margin: 0,
                            fontSize: 'clamp(0.95rem, 6cqw, 1.35rem)',
                            lineHeight: 1.1,
                            letterSpacing: '-0.01em',
                            textWrap: 'balance',
                        }}
                    >
                        {slide.headline}
                    </h3>

                    {slide.body ? (
                        <p
                            style={{
                                margin: '0.5rem 0 0',
                                fontSize: 'clamp(0.6rem, 3.4cqw, 0.78rem)',
                                lineHeight: 1.45,
                                opacity: 0.82,
                            }}
                        >
                            {slide.body}
                        </p>
                    ) : null}
                </div>

                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--font-data)',
                        fontSize: '0.58rem',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        opacity: 0.7,
                    }}
                >
                    {slide.footer}
                </p>
            </div>

            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px 4px' }} aria-hidden="true">
                <Heart />
                <Comment />
                <Share />
                <span style={{ marginLeft: 'auto' }}>
                    <Bookmark />
                </span>
            </div>

            {/*
              * Clamped to three lines so every post is the same height. In a deck
              * of turned cards an uneven edge reads as a mistake, and the full
              * caption is printed under each post in the grid below.
              */}
            <p
                style={{
                    margin: 0,
                    padding: '2px 12px 12px',
                    fontSize: 12.5,
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '3.9em',
                }}
            >
                <strong style={{ fontWeight: 600 }}>{handle}</strong>{' '}
                <span style={{ color: '#d8d8d8' }}>{caption}</span>
            </p>
        </article>
    );
}

const stroke = {
    fill: 'none',
    stroke: '#f5f5f5',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

function Heart() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
            <path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1z" />
        </svg>
    );
}

function Comment() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-4-.9L3 20.5l1.6-4.6A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
        </svg>
    );
}

function Share() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
            <path d="M22 2 11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
    );
}

function Bookmark() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
    );
}
