import { useState } from 'react';
import type { Chapter, Official } from '@/templates/contract';
import { ActionButton, ActionLink } from '@/Chapter/Button';
import { useLetter } from '@/Chapter/useLetter';
import type { Letter } from '@/Chapter/useLetter';

/**
 * An office that takes mail through a web form rather than an address.
 *
 * Every member of Congress works this way, and a form cannot be pre-filled from
 * outside. Sending somebody straight to a blank form would throw away the
 * letter, so the letter is shown here first with a button that copies it. By
 * the time the form opens there is something on the clipboard to paste.
 */
export default function FormOffice({
    official,
    index,
    chapter,
}: {
    official: Official;
    index: number;
    chapter: Chapter;
}) {
    const [drawn, setDrawn] = useState<Letter | null>(null);
    const [copied, setCopied] = useState(false);
    const { fetchLetter, pending } = useLetter(chapter.slug);

    const letter = drawn ? `${drawn.subject}\n\n${drawn.body}` : '';

    async function copy() {
        try {
            await navigator.clipboard.writeText(letter);
            setCopied(true);
        } catch {
            // Some browsers refuse clipboard access; the text is on screen to
            // be selected by hand, so there is nothing to recover from.
            setCopied(false);
        }
    }

    if (!drawn) {
        return (
            <ActionButton onClick={async () => setDrawn(await fetchLetter(index))}>
                {pending ? 'Opening' : 'Open form'}
            </ActionButton>
        );
    }

    return (
        <div style={{ flexBasis: '100%', marginTop: '0.9rem' }}>
            <p style={noteStyle}>
                This office takes mail through a form. Copy the message, then paste it in.
            </p>

            <pre style={letterStyle}>{letter}</pre>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.8rem' }}>
                <ActionButton onClick={copy}>{copied ? 'Copied' : 'Copy email'}</ActionButton>

                <ActionLink href={official.url ?? '#'} external variant="quiet">
                    Go to form
                </ActionLink>
            </div>
        </div>
    );
}

const noteStyle: React.CSSProperties = {
    margin: '0 0 0.6rem',
    fontSize: '0.88rem',
    color: 'var(--ink-soft)',
    lineHeight: 1.5,
};

const letterStyle: React.CSSProperties = {
    margin: 0,
    padding: '0.9rem 1rem',
    background: 'var(--bg)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--data)',
    fontSize: '0.82rem',
    lineHeight: 1.6,
    color: 'var(--ink)',
    whiteSpace: 'pre-wrap',
    maxHeight: '18rem',
    overflowY: 'auto',
};
