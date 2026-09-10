import type { Chapter } from '@/templates/contract';
import Section from '@/Chapter/Section';
import { ActionLink } from '@/Chapter/Button';

/**
 * The counts, as a readout rather than three matching cards.
 *
 * Three equal boxes in a row is the shape every generated page reaches for, and
 * it flattens a hierarchy that genuinely exists: the number within a mile is
 * the one that concerns a reader standing on this campus, and the statewide
 * figure is context. So the local figure is set large and the rest are ruled
 * off beneath it.
 *
 * Figures are set in the data face and present as text, so they are correct
 * before any script runs and legible if none ever does.
 */
export default function Numbers({ chapter, stateName }: { chapter: Chapter; stateName: string }) {
    const { readersWithinMile, flockCount, readersInState, generatedAt } = chapter.survey;

    /*
     * A section made entirely of figures has nothing to show when none were
     * gathered. It is left out rather than filled with dashes, and the page
     * carries on to the parts a student actually came for.
     */
    if (readersWithinMile === null) {
        return null;
    }

    /*
     * With nothing mapped nearby the page must not lead with a giant zero.
     * A zero reads as "no problem here" when what it actually means is "nobody
     * has surveyed this yet", and the project's own rule is to say so and
     * invite mapping rather than assert a ring that is not there.
     */
    if (readersWithinMile === 0) {
        return (
            <Section>
                <div style={{ display: 'grid', gap: 'clamp(2rem, 5vw, 3.5rem)' }}>
                    {/*
                      * The statewide figure leads here because a giant zero
                      * would not. When it is unavailable too there is no figure
                      * worth setting large, so the section opens on the sentence
                      * instead of on a dash standing in for a number.
                      */}
                    <div>
                        {readersInState !== null && (
                            <div
                                style={{
                                    fontFamily: 'var(--data)',
                                    fontSize: 'clamp(3.5rem, 13vw, 7rem)',
                                    fontWeight: 700,
                                    lineHeight: 0.85,
                                    letterSpacing: '-0.04em',
                                    color: 'var(--accent)',
                                }}
                            >
                                {readersInState.toLocaleString()}
                            </div>
                        )}
                        <p
                            style={{
                                margin: readersInState === null ? 0 : '1rem 0 0',
                                maxWidth: '34rem',
                                fontSize: 'clamp(1.05rem, 3vw, 1.35rem)',
                                lineHeight: 1.45,
                            }}
                        >
                            {readersInState === null
                                ? `No plate readers are mapped within a mile of ${chapter.shortName}.`
                                : `plate readers are mapped across ${stateName}. None of them are within a mile of ${chapter.shortName}.`}
                        </p>
                    </div>

                    <div
                        style={{
                            borderTop: '1px solid var(--line)',
                            paddingTop: '1.4rem',
                            display: 'grid',
                            gap: '0.9rem',
                            maxWidth: '44rem',
                        }}
                    >
                        <p style={{ margin: 0, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
                            That is not the same as there being none. Coverage comes from
                            volunteers, so an unmapped campus usually means nobody has walked it
                            with the map open yet.
                        </p>
                        <p style={{ margin: 0, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
                            If you have seen one near {chapter.shortName}, adding it to
                            OpenStreetMap puts it on this page and on every other map that reads
                            the same data.
                        </p>
                        <span>
                            <ActionLink href="https://deflock.me/report" external variant="quiet">
                                How to map a reader
                            </ActionLink>
                        </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                        Counted from OpenStreetMap on {generatedAt}. This page refreshes as the map
                        does, so a reader added today shows up here without anyone touching it.
                    </p>
                </div>
            </Section>
        );
    }

    const share =
        readersWithinMile > 0 && flockCount !== null
            ? Math.round((flockCount / readersWithinMile) * 100)
            : 0;

    const rows = [
        {
            value: (flockCount ?? 0).toLocaleString(),
            label: 'tagged Flock Safety',
            note: readersWithinMile > 0 ? `${share}% of those nearby` : null,
        },
        // Left out entirely rather than shown as a dash: a statistics block is
        // read as fact, and an empty slot in one reads as zero.
        ...(readersInState === null
            ? []
            : [
                  {
                      value: readersInState.toLocaleString(),
                      label: `mapped across ${stateName}`,
                      note: null,
                  },
              ]),
    ];

    return (
        <Section>
            <div style={{ display: 'grid', gap: 'clamp(2rem, 5vw, 3.5rem)' }}>
                <div>
                    <div
                        style={{
                            fontFamily: 'var(--data)',
                            fontSize: 'clamp(4rem, 16vw, 8.5rem)',
                            fontWeight: 700,
                            lineHeight: 0.85,
                            letterSpacing: '-0.04em',
                            color: 'var(--accent)',
                        }}
                    >
                        {readersWithinMile.toLocaleString()}
                    </div>
                    <p
                        style={{
                            margin: '1rem 0 0',
                            maxWidth: '34rem',
                            fontSize: 'clamp(1.05rem, 3vw, 1.35rem)',
                            lineHeight: 1.45,
                        }}
                    >
                        automated plate readers are mapped within a mile of {chapter.shortName}.
                    </p>
                </div>

                <dl style={{ margin: 0, borderTop: '1px solid var(--line)' }}>
                    {rows.map((row) => (
                        <div
                            key={row.label}
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'baseline',
                                gap: '0.4rem 1.4rem',
                                padding: '1.1rem 0',
                                borderBottom: '1px solid var(--line)',
                            }}
                        >
                            <dt
                                style={{
                                    fontFamily: 'var(--data)',
                                    fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    minWidth: '5.5ch',
                                }}
                            >
                                {row.value}
                            </dt>
                            <dd style={{ margin: 0, flex: 1, minWidth: '12rem', color: 'var(--ink-soft)' }}>
                                {row.label}
                            </dd>
                            {row.note ? (
                                <dd
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--data)',
                                        fontSize: '0.82rem',
                                        letterSpacing: '0.06em',
                                        color: 'var(--ink-soft)',
                                    }}
                                >
                                    {row.note}
                                </dd>
                            ) : null}
                        </div>
                    ))}
                </dl>

                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                    Counted from OpenStreetMap on {generatedAt}. Coverage is contributed by
                    volunteers, so every figure is a floor rather than a census. If one looks wrong,
                    anyone can check it and correct it at the source.
                </p>
            </div>
        </Section>
    );
}
