import { Head, useForm, usePage } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';

interface ChapterRow {
    slug: string;
    schoolName: string;
    shortName: string;
    state: string;
    status: 'live' | 'empty';
    readersWithinMile: number;
}

interface Props {
    chapters: ChapterRow[];
    liveCount: number;
}

export default function Home({ chapters, liveCount }: Props) {
    const { errors, ...page } = usePage().props as unknown as { errors: Record<string, string>; flash?: { status?: string } };
    const status = (page as { flash?: { status?: string } }).flash?.status;

    const form = useForm({ email: '' });

    return (
        <Shell
            aside={
                <a href="#start" className="annot text-dim no-underline hover:text-net">
                    Start a chapter
                </a>
            }
        >
            <Head title="Get plate readers off your campus" />

            <section className="shell grid min-h-[78vh] content-center gap-8 py-20">
                <p className="annot text-net">DeFlock / campus network</p>

                <h1 className="max-w-[16ch] text-[clamp(2.75rem,9vw,6.5rem)] uppercase">
                    Get them off your <span className="text-net">campus</span>.
                </h1>

                <p className="max-w-[46ch] text-lg text-dim">
                    Verify a school email, draw a box around your campus, and you have a page
                    naming every plate reader around it and the offices that can take them down.
                </p>

                {/* The whole ask is one field. */}
                <form
                    id="start"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/verify', { preserveScroll: true });
                    }}
                    className="grid max-w-xl gap-3"
                >
                    <label htmlFor="email" className="annot">
                        Your school email
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            placeholder="you@yourschool.edu"
                            className="field flex-1"
                            aria-describedby="email-help"
                        />
                        <button type="submit" className="btn btn-primary" disabled={form.processing}>
                            {form.processing ? 'Sending' : 'Send the link'}
                        </button>
                    </div>

                    <p id="email-help" className="annot">
                        .edu or .org. It proves you are actually at the school, and it is the only
                        thing we ever ask for.
                    </p>

                    {errors?.email && (
                        <p className="border border-signal bg-signal/10 px-4 py-3 font-data text-sm text-signal">
                            {errors.email}
                        </p>
                    )}

                    {status && (
                        <p className="border border-net bg-net-wash px-4 py-3 font-data text-sm text-net">
                            {status}
                        </p>
                    )}
                </form>
            </section>

            <section className="border-t border-hair py-20">
                <div className="shell grid gap-10">
                    <div className="grid gap-4">
                        <p className="annot text-net">How it works</p>
                        <h2 className="max-w-[18ch] text-[clamp(1.75rem,4vw,2.75rem)] uppercase">
                            Twenty minutes, and nothing routes through us.
                        </h2>
                    </div>

                    {/* Numbered because this genuinely is a sequence. */}
                    <ol className="grid gap-px border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            ['Verify', 'A link to your school address. No account, no password.'],
                            ['Name', 'We know the big domains. Everyone else names their own school.'],
                            ['Frame', 'Drag a box around your campus. Those four numbers drive everything.'],
                            ['Generate', 'Real map data in, a page nobody else has out.'],
                        ].map(([title, body], index) => (
                            <li key={title} className="grid content-start gap-3 bg-void p-6">
                                <span className="annot text-net">{String(index + 1).padStart(2, '0')}</span>
                                <h3 className="text-xl uppercase">{title}</h3>
                                <p className="text-sm text-faint">{body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="border-t border-hair py-20">
                <div className="shell grid gap-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                        <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] uppercase">Chapters</h2>
                        <p className="annot">
                            {chapters.length === 0
                                ? 'None yet'
                                : `${chapters.length} started, ${liveCount} with readers mapped`}
                        </p>
                    </div>

                    {chapters.length === 0 ? (
                        <p className="max-w-[52ch] text-dim">
                            Nobody has started one. The first person at any school gets to decide
                            what their campus page says.
                        </p>
                    ) : (
                        <ul className="grid gap-px border border-hair bg-hair">
                            {chapters.map((chapter) => (
                                <li
                                    key={chapter.slug}
                                    className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-void p-5"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`h-2 w-2 ${chapter.status === 'live' ? 'bg-signal' : 'bg-faint'}`}
                                    />
                                    <a
                                        href={`/${chapter.slug}`}
                                        className="flex-1 text-lg no-underline hover:text-net"
                                    >
                                        {chapter.schoolName}
                                    </a>
                                    <span className="annot">
                                        {chapter.status === 'live'
                                            ? `${chapter.readersWithinMile} readers within a mile`
                                            : 'no readers mapped'}
                                    </span>
                                    <span className="annot text-faint">/{chapter.slug}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </Shell>
    );
}
