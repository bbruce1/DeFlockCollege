import { useCallback, useEffect, useRef, useState } from 'react';
import type { Card } from '@/Chapter/content';
import Section from '@/Chapter/Section';

/**
 * A run of short arguments, turned one at a time.
 *
 * Six of these in a grid wrapped to four and two, which left the second row
 * stranded against the left edge and made the set read as a list of leftovers.
 * One card at a time, held in the middle with its neighbours falling away
 * behind it, gives each argument the whole width and a reason to be looked at.
 *
 * The depth is decoration. Every card is in the markup at first paint and stays
 * in the accessibility tree, so a reader with scripting off, or a crawler, gets
 * all six stacked rather than one and a pair of dead buttons.
 */

/** How far to either side a card is still drawn. Beyond this it is hidden. */
const VISIBLE_DEPTH = 2;

export default function Carousel({
    id,
    label,
    headline,
    standfirst,
    cards,
}: {
    id: string;
    label: string;
    headline: string;
    standfirst?: string;
    cards: Card[];
}) {
    const [active, setActive] = useState(0);
    const [enhanced, setEnhanced] = useState(false);
    const stageRef = useRef<HTMLDivElement>(null);

    // The 3D treatment only turns on once React is running. Until then the
    // markup is a plain stack, which is what a reader without scripting keeps.
    useEffect(() => setEnhanced(true), []);

    const go = useCallback(
        (direction: number) => {
            setActive((current) => (current + direction + cards.length) % cards.length);
        },
        [cards.length],
    );

    function onKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            go(1);
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            go(-1);
        }
    }

    // Swipe, because on a phone this is the obvious thing to try.
    const touchStart = useRef<number | null>(null);

    return (
        <Section id={id} label={label}>
            <h2 style={headlineStyle}>{headline}</h2>

            {standfirst ? <p style={standfirstStyle}>{standfirst}</p> : null}

            <div
                ref={stageRef}
                role="group"
                aria-roledescription="carousel"
                aria-label={headline}
                tabIndex={enhanced ? 0 : -1}
                onKeyDown={onKeyDown}
                onTouchStart={(e) => {
                    touchStart.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                    if (touchStart.current === null) {
                        return;
                    }

                    const travelled = e.changedTouches[0].clientX - touchStart.current;
                    touchStart.current = null;

                    if (Math.abs(travelled) > 44) {
                        go(travelled < 0 ? 1 : -1);
                    }
                }}
                style={
                    enhanced
                        ? {
                              position: 'relative',
                              marginTop: '2.4rem',
                              height: 'clamp(19rem, 40vw, 21rem)',
                              perspective: '1200px',
                              outline: 'none',
                          }
                        : { marginTop: '2.4rem', display: 'grid', gap: '1rem' }
                }
            >
                {cards.map((card, index) => {
                    // Shortest way round the ring, so turning past the last card
                    // brings the first in from the right rather than sweeping
                    // every card backwards across the stage.
                    const half = cards.length / 2;
                    let offset = index - active;

                    if (offset > half) {
                        offset -= cards.length;
                    }

                    if (offset < -half) {
                        offset += cards.length;
                    }

                    const distance = Math.abs(offset);
                    const beyond = distance > VISIBLE_DEPTH;

                    return (
                        <article
                            key={card.heading}
                            aria-hidden={enhanced && offset !== 0}
                            style={
                                enhanced
                                    ? {
                                          position: 'absolute',
                                          top: 0,
                                          left: '50%',
                                          width: 'min(100%, 26rem)',
                                          height: '100%',
                                          // Centre first, then push out and back.
                                          transform: `translateX(-50%) translateX(${offset * 54}%) translateZ(${distance * -190}px) rotateY(${offset * -26}deg) scale(${1 - distance * 0.06})`,
                                          opacity: beyond ? 0 : 1 - distance * 0.42,
                                          // Blurred with depth. Without it the
                                          // cards behind stay legible and the
                                          // stage reads as overlapping text
                                          // rather than as one card in front.
                                          filter:
                                              distance > 0
                                                  ? `blur(${distance * 2.5}px) saturate(0.45)`
                                                  : 'none',
                                          pointerEvents: beyond || offset !== 0 ? 'none' : 'auto',
                                          transition:
                                              'transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 420ms ease',
                                          zIndex: cards.length - distance,
                                          ...cardSurface,
                                      }
                                    : cardSurface
                            }
                        >
                            <span style={indexStyle}>
                                {String(index + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
                            </span>

                            <h3 style={cardHeadingStyle}>{card.heading}</h3>
                            <p style={cardBodyStyle}>{card.body}</p>

                            {card.source ? (
                                <a
                                    href={card.source.url}
                                    target="_blank"
                                    rel="noopener nofollow"
                                    style={sourceStyle}
                                >
                                    {card.source.label} ↗
                                </a>
                            ) : null}
                        </article>
                    );
                })}
            </div>

            {enhanced ? (
                <div style={controlsStyle}>
                    <button type="button" onClick={() => go(-1)} style={arrowStyle} aria-label="Previous">
                        ←
                    </button>

                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                        {cards.map((card, index) => (
                            <button
                                key={card.heading}
                                type="button"
                                onClick={() => setActive(index)}
                                aria-label={card.heading}
                                aria-current={index === active}
                                style={{
                                    width: index === active ? '1.6rem' : '0.5rem',
                                    height: '0.5rem',
                                    padding: 0,
                                    border: 0,
                                    cursor: 'pointer',
                                    borderRadius: 'var(--radius)',
                                    background:
                                        index === active ? 'var(--accent)' : 'var(--line)',
                                    transition: 'width 320ms ease, background 320ms ease',
                                }}
                            />
                        ))}
                    </div>

                    <button type="button" onClick={() => go(1)} style={arrowStyle} aria-label="Next">
                        →
                    </button>
                </div>
            ) : null}
        </Section>
    );
}

const headlineStyle: React.CSSProperties = {
    fontFamily: 'var(--display)',
    fontSize: 'clamp(1.8rem, 5.5vw, 3rem)',
    lineHeight: 1.03,
    letterSpacing: '-0.02em',
    margin: 0,
    textWrap: 'balance',
};

const standfirstStyle: React.CSSProperties = {
    margin: '1rem 0 0',
    maxWidth: '46rem',
    color: 'var(--ink-soft)',
    fontSize: '1.02rem',
    lineHeight: 1.65,
};

const cardSurface: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: 'clamp(1.4rem, 3vw, 1.9rem)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
    boxSizing: 'border-box',
};

const indexStyle: React.CSSProperties = {
    fontFamily: 'var(--data)',
    fontSize: '0.68rem',
    letterSpacing: '0.16em',
    color: 'var(--accent)',
};

const cardHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--display)',
    fontSize: 'clamp(1.1rem, 2.6vw, 1.35rem)',
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.22,
};

const cardBodyStyle: React.CSSProperties = {
    margin: 0,
    color: 'var(--ink-soft)',
    fontSize: '0.95rem',
    lineHeight: 1.62,
};

const sourceStyle: React.CSSProperties = {
    marginTop: 'auto',
    paddingTop: '0.8rem',
    fontFamily: 'var(--data)',
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    textDecoration: 'none',
};

const controlsStyle: React.CSSProperties = {
    marginTop: '1.4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.1rem',
};

const arrowStyle: React.CSSProperties = {
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    background: 'transparent',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    color: 'var(--ink)',
    fontFamily: 'var(--data)',
    fontSize: '1rem',
};
