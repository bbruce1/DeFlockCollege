import { useState } from 'react';
import type { Chapter, Official } from '@/templates/contract';
import { mailtoFrom, useLetter } from '@/Chapter/useLetter';
import Section from '@/Chapter/Section';
import FormOffice from '@/Chapter/FormOffice';
import { ActionButton } from '@/Chapter/Button';

/**
 * The people who can take the cameras down, one button each.
 *
 * One button each, and nothing to fill in first. The letter is already written
 * and already addressed; a box asking the reader to compose something is work
 * placed in front of the only action that matters, and most people stop there.
 *
 * Each office draws from a rotating library, so an office hearing from twenty
 * students reads twenty different letters rather than the same paragraph
 * twenty times.
 *
 * Every letter opens in the reader's own mail client. Nothing is sent for
 * anybody, and nothing about it comes back here.
 */
export default function Officials({
    chapter,
    officials,
    stateName,
}: {
    chapter: Chapter;
    officials: Official[];
    stateName: string;
}) {
    const { fetchLetter, pending, failed } = useLetter(chapter.slug);

    // Which office is being fetched, so one press does not put every button on
    // the page into its loading state at once.
    const [busy, setBusy] = useState<number | null>(null);

    async function email(index: number) {
        setBusy(index);

        const letter = await fetchLetter(index);

        setBusy(null);

        if (letter) {
            window.location.href = mailtoFrom(letter);
        }
    }

    return (
        <Section id="officials" label="Who can take them down">
            <h2 style={headingStyle}>Send emails</h2>

            <p style={{ ...proseStyle, fontWeight: 700, color: 'var(--ink)' }}>
                Every email is different
            </p>

            {officials.length > 0 ? (
                <ul style={listStyle}>
                    {officials.map((official, index) => (
                        <li key={`${official.name}-${official.title}-${index}`} style={cardStyle}>
                            <div style={{ minWidth: 0 }}>
                                <div style={roleStyle}>{official.roleLabel}</div>
                                <div style={nameStyle}>{official.name}</div>
                                {official.title ? (
                                    <div style={titleStyle}>{official.title}</div>
                                ) : null}
                                {!official.email && !official.url ? (
                                    <div style={{ ...titleStyle, marginTop: '0.4rem' }}>
                                        No public address on file, so the message opens with the
                                        recipient blank
                                    </div>
                                ) : null}
                            </div>

                            {official.email || !official.url ? (
                                <ActionButton onClick={() => email(index)}>
                                    {pending && busy === index
                                        ? 'Opening'
                                        : `Email ${firstName(official.name)}`}
                                </ActionButton>
                            ) : (
                                <FormOffice official={official} index={index} chapter={chapter} />
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div style={emptyStyle}>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>
                        Nobody has been added for {stateName} yet, so this page will not guess at
                        an address. Whoever started this chapter can add the offices from the edit
                        button in the footer.
                    </p>
                </div>
            )}

            {/*
              * The draw can fail — the endpoint is rate limited to keep the
              * chapter's counter honest, and a phone loses its connection. It
              * failed silently here for a while: the button was pressed, no
              * mail client opened, and the page said nothing at all.
              */}
            {failed ? (
                <p role="alert" style={failureStyle}>
                    That letter could not be fetched. Wait a moment and press the button again.
                </p>
            ) : null}
        </Section>
    );
}

/** "Write to Jane" reads better on a button than the full name and title. */
function firstName(name: string): string {
    return name.trim().split(/\s+/)[0] || 'them';
}

const headingStyle: React.CSSProperties = {
    fontFamily: 'var(--display)',
    fontSize: 'clamp(1.7rem, 4.8vw, 2.5rem)',
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
    margin: '0 0 1rem',
    textWrap: 'balance',
};

const proseStyle: React.CSSProperties = {
    margin: 0,
    maxWidth: '44rem',
    color: 'var(--ink-soft)',
    fontSize: '1.02rem',
    lineHeight: 1.65,
};



const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '1.8rem 0 0',
    borderTop: '1px solid var(--line)',
};

/* Ruled rows rather than boxes: elevation would imply a hierarchy between
   offices that does not exist, and five identical cards is the shape every
   generated page produces. */
const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.9rem 1.5rem',
    padding: '1.15rem 0',
    borderBottom: '1px solid var(--line)',
};

const roleStyle: React.CSSProperties = {
    fontFamily: 'var(--data)',
    fontSize: '0.7rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    marginBottom: '0.4rem',
};

const nameStyle: React.CSSProperties = {
    fontFamily: 'var(--display)',
    fontWeight: 700,
    fontSize: '1.08rem',
};

const titleStyle: React.CSSProperties = {
    color: 'var(--ink-soft)',
    fontSize: '0.9rem',
    marginTop: '0.15rem',
};


const failureStyle: React.CSSProperties = {
    marginTop: '1.4rem',
    padding: '0.9rem 1.1rem',
    border: '1px solid var(--signal)',
    borderRadius: 'var(--radius)',
    color: 'var(--ink)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
};

const emptyStyle: React.CSSProperties = {
    marginTop: '1.6rem',
    background: 'var(--surface)',
    border: '1px dashed var(--line)',
    borderRadius: 'var(--radius)',
    padding: '1.3rem',
    color: 'var(--ink-soft)',
};

