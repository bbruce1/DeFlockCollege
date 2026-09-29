import type { PostSlide } from '@/Posts/postTemplates';
import { useEffect, useRef } from 'react';
import { usePhoto } from '@/Posts/usePhoto';
import { drawSlide } from '@/Posts/renderSlide';
import { loadPostFonts, POST_FONTS } from '@/Posts/exportSlide';

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
/**
 * The square itself, drawn by the same renderer that saves the PNG.
 *
 * Previewing with HTML and saving with canvas meant two drawings of every post
 * that had to be kept in step by hand. Now there is one, so the post in the
 * catalogue is byte-for-byte the post that gets saved.
 */
function SlideSquare({ slide, badge }: { slide: PostSlide; badge: string | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const photo = usePhoto(slide.photo);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        // Waits for the webfonts, or the first draw measures fallback metrics
        // and wraps the headline in the wrong places. The slide is drawn again
        // once its photo arrives, and the earlier wait can finish second, so
        // only the latest draw is allowed to paint.
        let isCurrent = true;

        loadPostFonts().then(() => {
            if (isCurrent) {
                drawSlide(canvas, slide, POST_FONTS, photo);
            }
        });

        return () => {
            isCurrent = false;
        };
    }, [slide, photo]);

    return (
        <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#000' }}>
            <canvas
                ref={canvasRef}
                role="img"
                aria-label={slide.alt}
                style={{ display: 'block', width: '100%', height: '100%' }}
            />
            {badge ? (
                <span
                    style={{
                        position: 'absolute',
                        top: '4%',
                        right: '4%',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 999,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        fontFamily: 'var(--font-data)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.08em',
                    }}
                >
                    {badge}
                </span>
            ) : null}
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
                        background: `linear-gradient(45deg, ${accent}, ${slide.palette?.secondary ?? accent})`,
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

            <SlideSquare slide={slide} badge={slideCount > 1 ? `${slideIndex + 1}/${slideCount}` : null} />

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
