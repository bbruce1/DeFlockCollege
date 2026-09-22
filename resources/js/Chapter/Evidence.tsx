import { useEffect, useRef, useState } from 'react';
import { EVIDENCE } from '@/Chapter/content';
import Section from '@/Chapter/Section';

/**
 * What has already gone wrong, with somewhere to go and check.
 *
 * The argument on the rest of the page is ours. This section is deliberately
 * not: every claim here belongs to somebody who reported it, is attributed to
 * them by name, and links out so a sceptical reader can leave and verify it.
 *
 * Shown one at a time, advancing on its own, because three stacked cards were
 * scrolled past as a block. A panel that changes while you are looking at it
 * gets read. The timer stops the moment a reader touches the section, and never
 * starts at all for somebody who asked for reduced motion — an argument that
 * moves out from under the person reading it is worse than one that sits still.
 */

/** How long each source holds the panel. Long enough to read the body. */
const DWELL_MS = 7000;

/** How often the bar is redrawn while it fills. */
const TICK_MS = 50;

export default function Evidence() {
    const [active, setActive] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [running, setRunning] = useState(false);

    // Off until React is running, so the markup a crawler sees is all three.
    const [enhanced, setEnhanced] = useState(false);

    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

        setEnhanced(true);
        setRunning(!reduced.matches);

        const onChange = () => setRunning(!reduced.matches);
        reduced.addEventListener('change', onChange);

        return () => reduced.removeEventListener('change', onChange);
    }, []);

    const total = EVIDENCE.length;
    const activeRef = useRef(active);
    activeRef.current = active;

    useEffect(() => {
        if (!running) {
            return;
        }

        const timer = window.setInterval(() => {
            setElapsed((previous) => {
                if (previous + TICK_MS < DWELL_MS) {
                    return previous + TICK_MS;
                }

                setActive((current) => (current + 1) % total);

                return 0;
            });
        }, TICK_MS);

        return () => window.clearInterval(timer);
    }, [running, total]);

    /** Any deliberate choice stops the rotation for good; it is not a slideshow. */
    function choose(index: number) {
        setActive(index);
        setElapsed(0);
        setRunning(false);
    }

    const source = EVIDENCE[active];
    const progress = running ? (elapsed / DWELL_MS) * 100 : 0;

    return (
        <Section id="evidence" label="The evidence">
            <h2 style={headlineStyle}>This is not hypothetical.</h2>

            {enhanced ? (
                <>
                    <div role="tablist" aria-label="Reporting" style={tabListStyle}>
                        {EVIDENCE.map((entry, index) => (
                            <button
                                key={entry.url}
                                type="button"
                                role="tab"
                                id={`evidence-tab-${index}`}
                                aria-selected={index === active}
                                aria-controls={`evidence-panel-${index}`}
                                tabIndex={index === active ? 0 : -1}
                                onClick={() => choose(index)}
                                onKeyDown={(event) => {
                                    if (event.key === 'ArrowRight') {
                                        event.preventDefault();
                                        choose((active + 1) % total);
                                    }
                                    if (event.key === 'ArrowLeft') {
                                        event.preventDefault();
                                        choose((active - 1 + total) % total);
                                    }
                                }}
                                style={{
                                    ...tabStyle,
                                    color: index === active ? 'var(--ink)' : 'var(--ink-soft)',
                                    borderColor: index === active ? 'var(--accent)' : 'var(--line)',
                                }}
                            >
                                {entry.outlet}

                                {/*
                                  * The bar fills only under the panel being
                                  * shown, so it reads as "this one, for this
                                  * long" rather than as a loading state.
                                  */}
                                <span
                                    aria-hidden="true"
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        bottom: 0,
                                        height: '2px',
                                        width: index === active ? `${progress}%` : '0%',
                                        background: 'var(--accent)',
                                        transition: 'width 50ms linear',
                                    }}
                                />
                            </button>
                        ))}
                    </div>

                    <div
                        role="tabpanel"
                        id={`evidence-panel-${active}`}
                        aria-labelledby={`evidence-tab-${active}`}
                        onMouseEnter={() => setRunning(false)}
                        onFocus={() => setRunning(false)}
                        style={panelStyle}
                    >
                        <span style={outletStyle}>{source.outlet}</span>
                        <h3 style={sourceHeadlineStyle}>{source.headline}</h3>
                        <p style={bodyStyle}>{source.body}</p>
                        <a href={source.url} target="_blank" rel="noopener" style={linkStyle}>
                            Read it there ↗
                        </a>
                    </div>
                </>
            ) : (
                // Everything, stacked. This is what ships in the HTML.
                <div style={{ marginTop: '2rem', display: 'grid', gap: '0.9rem' }}>
                    {EVIDENCE.map((entry) => (
                        <a
                            key={entry.url}
                            href={entry.url}
                            target="_blank"
                            rel="noopener"
                            style={{ ...panelStyle, marginTop: 0, display: 'block', textDecoration: 'none', color: 'inherit' }}
                        >
                            <span style={outletStyle}>{entry.outlet}</span>
                            <span style={{ ...sourceHeadlineStyle, display: 'block' }}>
                                {entry.headline}
                            </span>
                            <span style={{ ...bodyStyle, display: 'block' }}>{entry.body}</span>
                            <span style={{ ...linkStyle, display: 'inline-block' }}>Read it there ↗</span>
                        </a>
                    ))}
                </div>
            )}
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

const tabListStyle: React.CSSProperties = {
    marginTop: '2rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
};

const tabStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'transparent',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '0.6rem 0.95rem',
    fontFamily: 'var(--data)',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    transition: 'color 200ms ease, border-color 200ms ease',
};

const panelStyle: React.CSSProperties = {
    marginTop: '0.9rem',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: 'clamp(1.3rem, 3vw, 1.7rem)',
    minHeight: '11rem',
};

const outletStyle: React.CSSProperties = {
    fontFamily: 'var(--data)',
    fontSize: '0.7rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
};

const sourceHeadlineStyle: React.CSSProperties = {
    fontFamily: 'var(--display)',
    fontSize: '1.12rem',
    fontWeight: 700,
    margin: '0.55rem 0 0.5rem',
    lineHeight: 1.25,
};

const bodyStyle: React.CSSProperties = {
    margin: 0,
    color: 'var(--ink-soft)',
    fontSize: '0.93rem',
    lineHeight: 1.6,
};

const linkStyle: React.CSSProperties = {
    marginTop: '0.9rem',
    fontFamily: 'var(--data)',
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    textDecoration: 'none',
};
