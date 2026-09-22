import { Head, Link } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';

/**
 * Every error a visitor can cause, on one page.
 *
 * Wording is per status because "something went wrong" tells somebody nothing
 * about whether to retry, wait, or check what they typed. A 404 in particular
 * is almost always a mistyped chapter address, so it offers the two places
 * worth going next rather than apologising.
 */
const MESSAGES: Record<number, { title: string; body: string }> = {
    404: {
        title: 'Nothing at this address',
        body:
            'No chapter lives here. Either the address is mistyped, or this campus has not ' +
            'started one yet — which is something you can fix.',
    },
    403: {
        title: 'Not yours to open',
        body:
            'This needs proof it belongs to you. Chapters are edited with the key you were ' +
            'shown when yours was created, or with a link sent to the school address behind it.',
    },
    419: {
        title: 'That page went stale',
        body:
            'The form sat too long before it was sent, so it was refused rather than trusted. ' +
            'Nothing was saved and nothing was lost. Open it again and it will work.',
    },
    429: {
        title: 'Too many tries',
        body:
            'This has been asked for too often in a short time, so it is paused for a while. ' +
            'Nothing is wrong with your account, because there is no account. Wait an hour.',
    },
    503: {
        title: 'Down for a moment',
        body:
            'The site is briefly unavailable, most likely being updated. Nothing is broken on ' +
            'your side and nothing has been lost. Try again shortly.',
    },
};

export default function Error({ status }: { status: number }) {
    const { title, body } = MESSAGES[status] ?? {
        title: 'Something went wrong',
        body: 'That did not work, and the reason is on our side rather than yours.',
    };

    return (
        <Shell>
            <Head title={`${status} — ${title}`} />

            <section className="shell grid min-h-[70vh] content-center gap-6 py-24">
                <p className="annot text-signal">Error {status}</p>

                <h1 className="max-w-[18ch] text-[clamp(2.25rem,7vw,4.5rem)] uppercase leading-[1.05]">
                    {title}
                </h1>

                <p className="max-w-[52ch] text-lg text-dim">{body}</p>

                <div className="mt-2 flex flex-wrap gap-3">
                    <Link href="/" className="btn btn-primary">
                        Back to the start
                    </Link>

                    {status === 404 ? (
                        <Link href="/map" className="btn btn-quiet">
                            See every chapter
                        </Link>
                    ) : null}
                </div>
            </section>
        </Shell>
    );
}
