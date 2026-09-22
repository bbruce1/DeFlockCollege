import type { Chapter } from '@/templates/contract';
import { FIXED, SPARSE_MAX } from '@/templates/contract';
import type { Skin } from '@/templates/skins';
import { Link } from '@inertiajs/react';
import { ActionLink } from '@/Chapter/Button';

/**
 * The hero, in four shapes.
 *
 * The wording is identical on every chapter in the network, because a student
 * who has seen one page should recognise the next instantly. Only the
 * arrangement changes. Every number is in the markup at first paint.
 */
export default function Hero({
    chapter,
    stateName,
    skin,
}: {
    chapter: Chapter;
    stateName: string;
    skin: Skin;
}) {
    const { readersWithinMile, readersInState } = chapter.survey;
    // Four states, not two: a real ring, a ring too thin to lead with, counted
    // and found none, and never counted. Each says something different and none
    // may be printed as another.
    const surveyed = readersWithinMile !== null;
    const mapped = surveyed && readersWithinMile > SPARSE_MAX;
    // Zero belongs here too. Opening on "no plate readers are mapped near you"
    // hands the reader a reason to stop reading, and an unmapped campus usually
    // means nobody has surveyed it rather than that it is clear. The numbers
    // section below still says plainly that none are mapped, and offers the
    // link to map one — so the page states it, just not as its first sentence.
    const sparse = surveyed && readersWithinMile <= SPARSE_MAX;
    // Null when OpenStreetMap could not be reached for the statewide figure.
    // Zero is a measurement; absent is not, and the page says neither.
    const statewide = readersInState === null ? null : readersInState.toLocaleString();

    const headline = (
        <h1
            style={{
                fontFamily: 'var(--display)',
                fontSize: 'clamp(2.6rem, 11vw, 6.5rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                margin: 0,
                textWrap: 'balance',
            }}
        >
            {FIXED.heroLead}{' '}
            {/*
              * The school's own colour, not the alert colour. This word names
              * what is happening to their campus, so it should be in their
              * colours; --signal stays reserved for the cameras themselves.
              */}
            <span style={{ color: 'var(--accent)' }}>{FIXED.heroAccent}</span>
        </h1>
    );

    // Never asserts a ring that is not there: with nothing mapped the page says
    // so and points at the statewide figure instead. With the statewide figure
    // unavailable too, it simply says less.
    //
    // One or two readers is the awkward case. Leading on it undersells the
    // argument — "1 automated plate reader is mapped within a mile" reads as
    // reassurance — so the statewide figure leads instead. The campus count is
    // not contradicted, just not the headline: saying "none" here would be a
    // lie, and the numbers section below still reports it exactly.
    const standfirst = mapped ? (
        <p className="hero-standfirst" style={standfirstStyle}>
            <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>
                {readersWithinMile} automated plate readers
            </strong>{' '}
            are mapped within a mile of {chapter.shortName}
            {statewide ? `, and ${statewide} across ${stateName}` : ''}. They photograph
            every passing car and keep the record either way.
        </p>
    ) : sparse && statewide ? (
        <p className="hero-standfirst" style={standfirstStyle}>
            <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>
                {statewide} automated plate readers
            </strong>{' '}
            are mapped across {stateName}, and campuses are where they go next. They
            photograph every passing car and keep the record either way.
        </p>
    ) : sparse && readersWithinMile! > 0 ? (
        <p className="hero-standfirst" style={standfirstStyle}>
            <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>
                {readersWithinMile} automated plate {readersWithinMile === 1 ? 'reader' : 'readers'}
            </strong>{' '}
            {readersWithinMile === 1 ? 'is' : 'are'} mapped within a mile of{' '}
            {chapter.shortName}. They photograph every passing car and keep the record
            either way.
        </p>
    ) : !surveyed ? (
        <p className="hero-standfirst" style={standfirstStyle}>
            Automated plate readers photograph every passing car around{' '}
            {chapter.shortName} and keep the record either way
            {statewide ? `. ${statewide} are mapped across ${stateName}` : ''}. This page
            is where students here organise about it.
        </p>
    ) : (
        // Nothing mapped nearby and no statewide figure either: there is no
        // stronger number to lead with, so the page says what it knows.
        <p className="hero-standfirst" style={standfirstStyle}>
            No plate readers are mapped within a mile of {chapter.shortName} yet. They
            photograph every passing car and keep the record either way, and campuses are
            where they go next.
        </p>
    );

    // With no figure at all there is no number to set large, and a giant blank
    // over the label "cameras within a mile" is worse than no number.
    //
    // Which figure is shown decides the label under it. Deriving both from one
    // flag is what stops a statewide number appearing over "within a mile".
    const figureIsStatewide = !mapped && statewide !== null;

    const headlineFigure = mapped
        ? readersWithinMile!.toLocaleString()
        : (statewide ?? (surveyed ? readersWithinMile!.toLocaleString() : null));

    const bigNumber = headlineFigure === null ? null : (
        <div
            className="hero-figure"
            style={{
                fontFamily: 'var(--data)',
                fontSize: 'clamp(4.5rem, 20vw, 11rem)',
                lineHeight: 0.82,
                color: 'var(--accent)',
                fontWeight: 700,
            }}
        >
            {headlineFigure}
            <div
                style={{
                    fontFamily: 'var(--data)',
                    fontSize: '0.8rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-soft)',
                    marginTop: '0.9rem',
                    lineHeight: 1.5,
                }}
            >
                {figureIsStatewide
                    ? `cameras mapped across ${stateName}`
                    : 'cameras within a mile of campus'}
            </div>
        </div>
    );

    // Spacing lives on the wrapper, never on the button: a button that carries
    // its own margin drags one layout's spacing into every other place it is used.
    const cta = (
        <div className="hero-cta" style={{ marginTop: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            {/*
              * Points at the emails, which is the whole reason the page exists.
              * The target moved when the action rail was folded into that
              * section, and this anchor was left aimed at an id that no longer
              * existed, so the button silently did nothing.
              */}
            <ActionLink href="#officials" large>
                {FIXED.heroCta}
            </ActionLink>

            {/*
              * A way out for somebody who landed on the wrong campus. A chapter
              * page is often the first thing a person sees of the network, and
              * without this the only route onward is the browser's back button.
              */}
            <p style={{ margin: '1rem 0 0' }}>
                <Link
                    href="/"
                    style={{
                        fontFamily: 'var(--data)',
                        fontSize: '0.8rem',
                        letterSpacing: '0.06em',
                        color: 'var(--ink-soft)',
                        textDecorationColor: 'var(--line)',
                        textUnderlineOffset: '0.25em',
                    }}
                >
                    Not your chapter? Go home
                </Link>
            </p>
        </div>
    );

    const eyebrow = (
        <p
            style={{
                fontFamily: 'var(--data)',
                fontSize: '0.74rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ink-soft)',
                margin: '0 0 1.4rem',
            }}
        >
            {chapter.schoolName} · {chapter.city}, {chapter.state}
        </p>
    );

    const split = skin.heroShape === 'split';
    const numberFirst = skin.heroShape === 'number-first';

    return (
        // A full screen on arrival, so the whole state is in view before
        // anything else is. `dvh` rather than `vh` because mobile browsers
        // measure `vh` against a chrome-less viewport that does not exist yet,
        // which would push the fold off the bottom of the phone.
        <header
            style={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 'clamp(2.5rem, 8vw, 6rem) clamp(1.1rem, 5vw, 3rem)',
                borderBottom: skin.heroShape === 'banner' ? '4px solid var(--accent)' : 'none',
            }}
        >
            {/*
              * The two columns live in the stylesheet rather than here because
              * they have to stack on a phone, and an inline style cannot carry
              * a media query — nor be overridden by one.
              */}
            <div
                className={split ? 'hero-frame hero-split' : 'hero-frame'}
                style={{
                    width: '100%',
                    maxWidth: '68rem',
                    margin: '0 auto',
                }}
            >
                <div>
                    {eyebrow}
                    {numberFirst ? bigNumber : headline}
                    {numberFirst ? <div style={{ marginTop: '1.8rem' }}>{headline}</div> : null}
                    {/*
                      * The split shape carries the standfirst in its second
                      * column and number-first carries it under the whole
                      * block, so only the single-column shapes place it here.
                      * Rendering it unconditionally printed the paragraph
                      * twice on every split skin.
                      */}
                    {!numberFirst && !split ? standfirst : null}
                    {!split && cta}
                </div>

                {split ? (
                    <div>
                        {standfirst}
                        {cta}
                    </div>
                ) : null}

                {numberFirst ? standfirst : null}
            </div>
        </header>
    );
}

const standfirstStyle: React.CSSProperties = {
    marginTop: '1.6rem',
    marginBottom: 0,
    maxWidth: '38rem',
    fontSize: 'clamp(1.02rem, 2.7vw, 1.3rem)',
    lineHeight: 1.55,
    color: 'var(--ink-soft)',
};
