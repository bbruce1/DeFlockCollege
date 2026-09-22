import { Head, Link } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';

interface DistrictChapter {
    slug: string;
    schoolName: string;
    shortName: string;
    city: string;
    state: string;
    status: 'live' | 'empty' | 'unsurveyed';
    readersWithinMile: number | null;
}

interface Props {
    ticket: string;
    purpose: 'create' | 'edit';
    domain: string;
    minutesRemaining: number;
    chapters: DistrictChapter[];
}

/**
 * Which school, when one address covers many of them.
 *
 * A university address names its school. A district address does not: every
 * high school in the county shares it, so this asks rather than guessing. It is
 * the only screen in the flow that exists because of who the reader is rather
 * than what they are doing.
 */
export default function District({ ticket, purpose, domain, minutesRemaining, chapters }: Props) {
    const editing = purpose === 'edit';

    return (
        <Shell>
            <Head title={editing ? 'Which chapter?' : 'Your district'} />

            <section className="shell grid max-w-2xl gap-8 py-14">
                <div className="grid gap-3">
                    <p className="annot text-net">{domain}</p>
                    <h1 className="text-balance text-[clamp(1.9rem,6vw,2.8rem)] uppercase leading-[1.05]">
                        {editing ? 'Which chapter do you mean?' : 'Your district already has these'}
                    </h1>
                    <p className="max-w-[54ch] text-dim">
                        {editing
                            ? 'You have started more than one of your district\u2019s chapters, so this cannot say which you meant. Pick one.'
                            : 'One address covers every school in your district. If your school is here, it already has a page. If it is not, start one.'}
                    </p>
                </div>

                <ul className="grid gap-px border border-hair bg-hair">
                    {chapters.map((chapter) => (
                        <li key={chapter.slug} className="bg-void">
                            <a
                                href={
                                    editing
                                        ? `/${chapter.slug}/edit?ticket=${encodeURIComponent(ticket)}`
                                        : `/${chapter.slug}`
                                }
                                className="flex min-h-[4.5rem] items-center gap-4 px-5 py-4 no-underline transition-colors hover:bg-panel"
                            >
                                <span
                                    aria-hidden="true"
                                    className={`h-2 w-2 shrink-0 ${
                                        chapter.status === 'live' ? 'bg-signal' : 'bg-faint'
                                    }`}
                                />

                                {/*
                                  * The school name gets the whole width and is
                                  * allowed to wrap. Setting it beside the status
                                  * truncated it to "James Madi…" on a phone,
                                  * which hides the one thing the row is for.
                                  */}
                                <span className="min-w-0 flex-1">
                                    <span className="block text-lg leading-snug">
                                        {chapter.schoolName}
                                    </span>
                                    <span className="annot mt-1 block text-faint">
                                        {chapter.city}, {chapter.state} ·{' '}
                                        {chapter.status === 'live'
                                            ? `${chapter.readersWithinMile} within a mile`
                                            : chapter.status === 'empty'
                                              ? 'none mapped'
                                              : 'not surveyed yet'}
                                    </span>
                                </span>

                                <span aria-hidden="true" className="shrink-0 text-faint">
                                    →
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>

                {editing ? (
                    <p className="text-sm text-faint">
                        Only chapters started from your address are listed. A district address is
                        shared, but a chapter belongs to whoever made it.
                    </p>
                ) : (
                    <div className="grid gap-4 border-t border-hair pt-8">
                        <h2 className="text-xl uppercase">Not your school?</h2>
                        <p className="max-w-[52ch] text-sm text-dim">
                            Start a page for it. Your district can have as many chapters as it has
                            schools.
                        </p>
                        <Link
                            href={`/start?ticket=${encodeURIComponent(ticket)}`}
                            className="btn btn-primary min-h-[3.25rem] justify-self-start px-6"
                        >
                            Start a chapter for my school
                        </Link>
                        <p className="annot text-faint">
                            Verified as {domain} · {minutesRemaining} minutes left
                        </p>
                    </div>
                )}
            </section>
        </Shell>
    );
}
