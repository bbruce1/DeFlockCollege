import { Head } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import type { Chapter } from '@/templates/contract';

export default function Index({ chapters }: { chapters: Chapter[] }) {
    return (
        <Shell>
            <Head title="Chapters" />
            <section className="shell grid gap-8 py-16">
                <h1 className="text-[clamp(2rem,6vw,3.5rem)] uppercase">Chapters</h1>

                {chapters.length === 0 ? (
                    <p className="max-w-[52ch] text-dim">Nobody has started one yet.</p>
                ) : (
                    <ul className="grid gap-px border border-hair bg-hair">
                        {chapters.map((chapter) => (
                            <li key={chapter.slug} className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-void p-5">
                                <span
                                    aria-hidden="true"
                                    className={`h-2 w-2 ${chapter.status === 'live' ? 'bg-signal' : 'bg-faint'}`}
                                />
                                <a href={`/${chapter.slug}`} className="flex-1 text-lg no-underline hover:text-net">
                                    {chapter.schoolName}
                                </a>
                                <span className="annot">
                                    {chapter.status === 'live'
                                        ? `${chapter.map.readersWithinMile} within a mile`
                                        : 'no readers mapped'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </Shell>
    );
}
