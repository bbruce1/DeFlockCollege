import { useEffect, useRef, useState } from 'react';
import { BROKER_SEGMENTS, CHAIN, PRICED_IN } from '@/Chapter/content';
import Section from '@/Chapter/Section';

/**
 * The answer to "I have nothing to hide", shown rather than argued.
 *
 * The objection assumes the camera is the whole system: one photograph of one
 * car, which is close to harmless. The answer is the chain it feeds — plate, to
 * name, to a file somebody already keeps — and a chain is a thing to draw, not
 * a thing to describe. An earlier version of this section made the same case in
 * five paragraphs and nobody was going to read them.
 *
 * The file panel fills a row at a time when it comes into view, because that is
 * the argument: the questions are answered one by one, without you.
 *
 * Nothing is hidden behind the animation. `animate` starts false, so the first
 * render is the whole section, plain and visible; the stagger is switched on
 * afterwards in an effect, and only for a reader who has not asked for less
 * motion. A run that never reaches the effect shows everything rather than
 * nothing, which is the way round this project requires.
 */

/** Gap between one row appearing and the next. */
const ROW_STAGGER_MS = 90;

export default function Dossier() {
    const [revealed, setRevealed] = useState(false);
    const [animate, setAnimate] = useState(false);
    const fileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduced || !fileRef.current) {
            return;
        }

        setAnimate(true);

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setRevealed(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 },
        );

        observer.observe(fileRef.current);

        return () => observer.disconnect();
    }, []);

    // Before the observer fires, rows are hidden only when we know we can show
    // them again. Without scripting `animate` stays false and they are plain.
    const hidden = animate && !revealed;

    return (
        <Section id="nothing-to-hide" label="The obvious objection">
            <h2 style={headlineStyle}>{'“But I have nothing to hide.”'}</h2>

            <p style={standfirstStyle}>This is what can happen:</p>

            {/* The chain. */}
            <div style={chainStyle}>
                {CHAIN.map((step, index) => (
                    <div key={step.node} style={chainCellStyle}>
                        <div style={nodeStyle}>
                            <span style={nodeLabelStyle}>{step.node}</span>
                            <span style={nodeCaptionStyle}>{step.caption}</span>
                            {step.source ? (
                                <a
                                    href={step.source.url}
                                    target="_blank"
                                    rel="noopener nofollow"
                                    style={tinyLinkStyle}
                                >
                                    {step.source.label} ↗
                                </a>
                            ) : null}
                        </div>

                        {index < CHAIN.length - 1 ? (
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 60 12"
                                preserveAspectRatio="none"
                                style={connectorStyle}
                            >
                                <line
                                    x1="0"
                                    y1="6"
                                    x2="52"
                                    y2="6"
                                    stroke="var(--line)"
                                    strokeWidth="1"
                                />
                                {/* A dash running the length of the wire, so the
                                    chain reads as something flowing one way. */}
                                <line
                                    x1="0"
                                    y1="6"
                                    x2="52"
                                    y2="6"
                                    stroke="var(--accent)"
                                    strokeWidth="1.5"
                                    strokeDasharray="8 44"
                                    style={animate ? { animation: 'deflock-flow 2.4s linear infinite' } : undefined}
                                />
                                <path d="M52 2 L58 6 L52 10 Z" fill="var(--accent)" />
                            </svg>
                        ) : null}
                    </div>
                ))}
            </div>

            {/* The file. */}
            <div ref={fileRef} style={fileStyle}>
                <div style={fileHeaderStyle}>
                    <span>Sold by data brokers</span>
                    <span>3,000+ segments per person</span>
                </div>

                <dl style={{ margin: 0 }}>
                    {BROKER_SEGMENTS.map((segment, index) => (
                        <div
                            key={segment.label}
                            style={{
                                ...segmentRowStyle,
                                opacity: hidden ? 0 : 1,
                                transform: hidden ? 'translateX(-8px)' : 'none',
                                transition: animate
                                    ? `opacity 380ms ease ${index * ROW_STAGGER_MS}ms, transform 380ms ease ${index * ROW_STAGGER_MS}ms`
                                    : undefined,
                            }}
                        >
                            <dt style={segmentLabelStyle}>{segment.label}</dt>
                            <dd style={segmentValueStyle}>{segment.value}</dd>
                        </div>
                    ))}
                </dl>

                <p style={fileFootnoteStyle}>
                    Real category names from the FTC&rsquo;s data broker report.
                </p>
            </div>

            <h3 style={pricedHeadingStyle}>And then it is priced in.</h3>

            <div style={pricedGridStyle}>
                {PRICED_IN.map((item) => (
                    <div key={item.what} style={pricedCardStyle}>
                        <span aria-hidden="true" style={arrowStyle}>
                            ↑
                        </span>
                        <h4 style={pricedWhatStyle}>{item.what}</h4>
                        <p style={pricedDetailStyle}>{item.detail}</p>
                        {item.source ? (
                            <a
                                href={item.source.url}
                                target="_blank"
                                rel="noopener nofollow"
                                style={{ ...tinyLinkStyle, marginTop: 'auto', paddingTop: '0.8rem' }}
                            >
                                {item.source.label} ↗
                            </a>
                        ) : null}
                    </div>
                ))}
            </div>

            <style>{'@keyframes deflock-flow { to { stroke-dashoffset: -52; } }'}</style>
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
    margin: '0.9rem 0 0',
    color: 'var(--ink-soft)',
    fontSize: 'clamp(1.05rem, 2.6vw, 1.25rem)',
};

const chainStyle: React.CSSProperties = {
    marginTop: '2.2rem',
    display: 'grid',
    gap: '0.6rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
    alignItems: 'stretch',
};

const chainCellStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
};

const nodeStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '1.1rem',
    minHeight: '100%',
};

const nodeLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--display)',
    fontSize: '1.1rem',
    fontWeight: 700,
    lineHeight: 1.2,
};

const nodeCaptionStyle: React.CSSProperties = {
    color: 'var(--ink-soft)',
    fontSize: '0.88rem',
    lineHeight: 1.45,
};

const connectorStyle: React.CSSProperties = {
    width: '2.6rem',
    height: '0.75rem',
    flexShrink: 0,
};

const tinyLinkStyle: React.CSSProperties = {
    fontFamily: 'var(--data)',
    fontSize: '0.66rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    textDecoration: 'none',
};

const fileStyle: React.CSSProperties = {
    marginTop: '1.6rem',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    background: 'var(--surface)',
};

const fileHeaderStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem 1.5rem',
    justifyContent: 'space-between',
    background: 'var(--accent)',
    color: 'var(--accent-ink)',
    padding: '0.65rem 1.05rem',
    fontFamily: 'var(--data)',
    fontSize: '0.71rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontWeight: 600,
};

const segmentRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.2rem 1.2rem',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '0.62rem 1.05rem',
    borderBottom: '1px solid var(--line)',
};

const segmentLabelStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: 'var(--data)',
    fontSize: '0.82rem',
    color: 'var(--ink)',
};

const segmentValueStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: 'var(--data)',
    fontSize: '0.78rem',
    color: 'var(--signal)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
};

const fileFootnoteStyle: React.CSSProperties = {
    margin: 0,
    padding: '0.85rem 1.05rem',
    color: 'var(--ink-soft)',
    fontSize: '0.8rem',
    lineHeight: 1.55,
};

const pricedHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--display)',
    fontSize: 'clamp(1.3rem, 3.4vw, 1.8rem)',
    letterSpacing: '-0.015em',
    margin: '2.4rem 0 0',
};

const pricedGridStyle: React.CSSProperties = {
    marginTop: '1rem',
    display: 'grid',
    gap: '0.8rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 15rem), 1fr))',
};

const pricedCardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '1.2rem',
};

const arrowStyle: React.CSSProperties = {
    fontFamily: 'var(--data)',
    fontSize: '1.1rem',
    lineHeight: 1,
    color: 'var(--signal)',
};

const pricedWhatStyle: React.CSSProperties = {
    fontFamily: 'var(--display)',
    fontSize: '1.02rem',
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.25,
};

const pricedDetailStyle: React.CSSProperties = {
    margin: 0,
    color: 'var(--ink-soft)',
    fontSize: '0.88rem',
    lineHeight: 1.5,
};
