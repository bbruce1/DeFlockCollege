import { Head, Link, router } from '@inertiajs/react';

interface ChapterRow {
    slug: string;
    shortName: string;
    state: string;
    city: string;
    lettersDrawn: number;
    readersWithinMile: number | null;
    officials: number;
    instagram: string | null;
    hasPetition: boolean;
    acknowledged: boolean;
    status: 'live' | 'empty';
    createdAt: string;
    surveyedAt: string;
}

interface Props {
    totals: {
        chapters: number;
        live: number;
        empty: number;
        letters: number;
        lettersPerChapter: number;
        withInstagram: number;
        withPetition: number;
        acknowledged: number;
        officials: number;
        states: number;
    };
    chapters: ChapterRow[];
    byState: { state: string; name: string; chapters: number; letters: number }[];
    silent: ChapterRow[];
}

/**
 * The operator's view.
 *
 * Ordered by what vision.md says actually matters: letters first, chapter count
 * second. A chapter that has never handed out a letter is called out on its own,
 * because a network that is growing and silent is the failure case this project
 * set out to detect.
 */
export default function Dashboard({ totals, chapters, byState, silent }: Props) {
    return (
        <>
            <Head title="Admin" />

            <main className="min-h-[100dvh] bg-void pb-24">
                <header className="border-b border-hair">
                    <div className="shell flex items-baseline justify-between gap-4 py-5">
                        <p className="annot text-net">Network</p>
                        <button
                            type="button"
                            onClick={() => router.post('/admin/lock')}
                            className="annot text-faint hover:text-glow"
                        >
                            Lock
                        </button>
                    </div>
                </header>

                <section className="shell py-12">
                    <p className="annot">Letters handed out</p>
                    <p className="font-data text-[clamp(3.5rem,14vw,7rem)] font-semibold leading-none text-net">
                        {totals.letters.toLocaleString()}
                    </p>
                    <p className="mt-3 max-w-[54ch] text-sm text-dim">
                        Counts letters drawn when somebody pressed an email button, not letters
                        actually sent. A reader can open a draft and never send it, so treat this
                        as a ceiling. It is still the closest thing to the number that matters.
                    </p>
                </section>

                <section className="shell">
                    <dl className="grid gap-px border-y border-hair bg-hair sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            ['Chapters', totals.chapters.toLocaleString()],
                            ['Letters per chapter', String(totals.lettersPerChapter)],
                            ['States', totals.states.toLocaleString()],
                            ['Offices listed', totals.officials.toLocaleString()],
                            ['With readers mapped', `${totals.live} of ${totals.chapters}`],
                            ['With an Instagram', `${totals.withInstagram} of ${totals.chapters}`],
                            ['With a petition', `${totals.withPetition} of ${totals.chapters}`],
                            ['Key acknowledged', `${totals.acknowledged} of ${totals.chapters}`],
                        ].map(([label, value]) => (
                            <div key={label} className="bg-void p-5">
                                <dt className="annot">{label}</dt>
                                <dd className="mt-2 font-data text-2xl text-glow">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {silent.length > 0 && (
                    <section className="shell pt-12">
                        <h2 className="text-xl uppercase text-signal">
                            {silent.length} {silent.length === 1 ? 'chapter has' : 'chapters have'} sent nothing
                        </h2>
                        <p className="mt-2 max-w-[54ch] text-sm text-dim">
                            Generated and quiet. This is the outcome the project was built to notice,
                            so it sits above the league table rather than below it.
                        </p>
                        <p className="mt-3 font-data text-sm text-faint">
                            {silent.map((c) => c.slug).join('  ')}
                        </p>
                    </section>
                )}

                <section className="shell pt-12">
                    <h2 className="text-xl uppercase">Chapters</h2>

                    {chapters.length === 0 ? (
                        <p className="mt-4 text-dim">None yet.</p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[46rem] border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-hair text-left">
                                        {['Chapter', 'Where', 'Letters', 'Readers', 'Offices', 'Instagram', 'Created'].map(
                                            (h) => (
                                                <th key={h} className="annot py-3 pr-6 font-normal">
                                                    {h}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {chapters.map((c) => (
                                        <tr key={c.slug} className="border-b border-hair">
                                            <td className="py-3 pr-6">
                                                <Link href={`/${c.slug}`} className="text-glow">
                                                    {c.shortName}
                                                </Link>
                                                <span className="ml-2 font-data text-xs text-faint">/{c.slug}</span>
                                            </td>
                                            <td className="py-3 pr-6 text-dim">
                                                {c.city}, {c.state}
                                            </td>
                                            <td className="py-3 pr-6 font-data text-net">{c.lettersDrawn}</td>
                                            <td className="py-3 pr-6 font-data text-dim">
                                                {c.status === 'live'
                                                    ? c.readersWithinMile
                                                    : c.status === 'empty'
                                                      ? 'none'
                                                      : 'unsurveyed'}
                                            </td>
                                            <td className="py-3 pr-6 font-data text-dim">{c.officials}</td>
                                            <td className="py-3 pr-6 font-data text-dim">
                                                {c.instagram ? `@${c.instagram}` : 'none'}
                                            </td>
                                            <td className="py-3 font-data text-xs text-faint">
                                                {c.createdAt.slice(0, 10)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {byState.length > 0 && (
                    <section className="shell pt-12">
                        <h2 className="text-xl uppercase">By state</h2>
                        <p className="mt-2 max-w-[54ch] text-sm text-dim">
                            Density inside one state is what turns a letter into a problem a
                            representative cannot file away.
                        </p>
                        <ul className="mt-4 border-t border-hair">
                            {byState.map((s) => (
                                <li
                                    key={s.state}
                                    className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-hair py-3"
                                >
                                    <span className="w-28 text-glow">{s.name}</span>
                                    <span className="font-data text-sm text-dim">
                                        {s.chapters} {s.chapters === 1 ? 'chapter' : 'chapters'}
                                    </span>
                                    <span className="font-data text-sm text-net">{s.letters} letters</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
        </>
    );
}
