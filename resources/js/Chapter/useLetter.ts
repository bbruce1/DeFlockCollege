import { useState } from 'react';

export interface Letter {
    subject: string;
    body: string;
    email: string | null;
    url: string | null;
}

/**
 * Fetches the letter for one office at the moment it is asked for.
 *
 * Nothing is written until somebody presses a button, which is what keeps the
 * chapter's counter meaningful: a crawler looking at the page consumes nothing.
 * Pressing again inside the server's hold window returns the same letter rather
 * than swapping the text under a reader mid-send.
 */
export function useLetter(slug: string) {
    const [pending, setPending] = useState(false);
    const [failed, setFailed] = useState(false);

    async function fetchLetter(officialIndex: number): Promise<Letter | null> {
        setPending(true);
        setFailed(false);

        try {
            const response = await fetch(`/${slug}/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                },
                body: JSON.stringify({ official: officialIndex }),
            });

            if (!response.ok) {
                setFailed(true);

                return null;
            }

            return (await response.json()) as Letter;
        } catch {
            setFailed(true);

            return null;
        } finally {
            setPending(false);
        }
    }

    return { fetchLetter, pending, failed };
}

export function mailtoFrom(letter: Letter): string {
    return (
        `mailto:${letter.email ?? ''}` +
        `?subject=${encodeURIComponent(letter.subject)}` +
        `&body=${encodeURIComponent(letter.body)}`
    );
}
