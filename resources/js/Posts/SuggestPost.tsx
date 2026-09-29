import { useMemo, useState } from 'react';

/**
 * Suggesting a post.
 *
 * Composes an email rather than posting anywhere. The site deliberately has no
 * messaging, forum or comments, because a place where anybody can leave text is
 * a moderation obligation that does not scale to two hundred campuses run by
 * nobody — and a suggestion box is exactly that surface wearing a different
 * name. An email is somebody's inbox, which already has a spam filter and an
 * owner.
 *
 * The letter is shown before it is sent, with a copy button, because a mailto
 * that opens the wrong client leaves somebody with nothing otherwise.
 */
export default function SuggestPost({ address }: { address: string }) {
    const [idea, setIdea] = useState('');
    const [why, setWhy] = useState('');
    const [from, setFrom] = useState('');
    const [copied, setCopied] = useState(false);

    const ready = idea.trim().length >= 10;

    const subject = 'Post idea for DeFlock Campus';

    const body = useMemo(
        () =>
            [
                'The post:',
                idea.trim() || '(what it should say)',
                '',
                'Why it works:',
                why.trim() || '(optional)',
                '',
                'From:',
                from.trim() || '(optional — your chapter or Instagram handle)',
            ].join('\n'),
        [idea, why, from],
    );

    const mailto = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    async function copy() {
        try {
            await navigator.clipboard.writeText(`To: ${address}\nSubject: ${subject}\n\n${body}`);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className="grid max-w-2xl gap-5">
            <label className="grid gap-2">
                <span className="annot">What should the post say?</span>
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={4}
                    placeholder="A slide that answers “they only scan criminals”, with the retention figure…"
                    className="field min-h-[7rem] w-full"
                />
            </label>

            <label className="grid gap-2">
                <span className="annot">Why it works, if you know</span>
                <input
                    value={why}
                    onChange={(e) => setWhy(e.target.value)}
                    placeholder="It is the question we get in every comment section"
                    className="field min-h-[3.25rem] w-full"
                    autoComplete="off"
                />
            </label>

            <label className="grid gap-2">
                <span className="annot">Your chapter or handle, if you want credit</span>
                <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="@deflock.gatech"
                    className="field min-h-[3.25rem] w-full"
                    autoComplete="off"
                    spellCheck={false}
                />
            </label>

            {/*
              * Shown before it is sent. A mailto can open a client nobody uses,
              * and a suggestion lost to that is a suggestion nobody makes twice.
              */}
            <div className="grid gap-3 border border-hair p-4">
                <p className="annot text-faint">This is the email that gets sent</p>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words font-data text-sm text-dim">
                    {`To: ${address}\nSubject: ${subject}\n\n${body}`}
                </pre>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={copy}
                        className="btn btn-quiet"
                        style={{ touchAction: 'manipulation' }}
                    >
                        {copied ? 'Copied' : 'Copy the email'}
                    </button>

                    <a
                        href={ready ? mailto : undefined}
                        aria-disabled={!ready}
                        className="btn btn-primary"
                        style={{
                            touchAction: 'manipulation',
                            ...(ready ? {} : { opacity: 0.45, pointerEvents: 'none' }),
                        }}
                    >
                        Open my email app
                    </a>

                    {!ready ? (
                        <span className="annot text-faint">Write the post first</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
