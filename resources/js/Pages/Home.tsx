import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import CoverageField from '@/Chapter/CoverageField';

interface ChapterRow {
    slug: string;
    schoolName: string;
    shortName: string;
    state: string;
    status: 'live' | 'empty' | 'unsurveyed';
    readersWithinMile: number | null;
}

interface NationalCoverage {
    url: string;
    markers: { x: number; y: number }[];
    readersNearby: number;
}

/**
 * How much of the viewport the country may take.
 *
 * The rest is margin. It has to leave more than the header's own height clear
 * at the top, or the map runs under it.
 */
const NATION_INSET = 0.74;

interface Props {
    chapters: ChapterRow[];
    liveCount: number;
    coverage: NationalCoverage;
}

/**
 * The field component is shared with the chapter pages, which theme themselves
 * with --accent and --signal. The network chrome has no such tokens, so they
 * are declared here from its own palette: cyan for the readers, red for us.
 */
const FIELD_TOKENS = {
    '--accent': 'var(--color-net)',
    '--signal': 'var(--color-signal)',
    '--bg': 'var(--color-void)',
} as CSSProperties;

/** Sections below the fold sit on the field without competing with it. */
const OVER_FIELD: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    background: 'color-mix(in srgb, var(--color-void) 96%, transparent)',
    backdropFilter: 'blur(3px)',
};

export default function Home({ chapters, liveCount, coverage }: Props) {
    const { errors, ...page } = usePage().props as unknown as {
        errors: Record<string, string>;
        flash?: { status?: string; existing?: { slug: string; shortName: string } };
    };
    const flash = (page as { flash?: { status?: string; existing?: { slug: string; shortName: string } } }).flash;
    const status = flash?.status;
    const existing = flash?.existing;

    const form = useForm({ email: '' });

    // Held steady across renders: the field keys its effect on this object, and
    // a fresh one each keystroke would re-fetch the country every letter typed.
    const field = useMemo(
        () => ({ ...coverage, inset: NATION_INSET, maxPx: null }),
        [coverage],
    );

    return (
        <Shell>
            <Head title="Get plate readers off your campus" />

            <div style={FIELD_TOKENS}>
                <CoverageField coverage={field} />
            </div>

            <section
                className="shell grid min-h-[100dvh] content-center gap-8 py-24"
                style={{ position: 'relative', zIndex: 1 }}
            >
                <h1 className="max-w-[16ch] text-[clamp(2.75rem,9vw,6.5rem)] uppercase">
                    Get them off your <span className="text-net">campus</span>
                </h1>

                <p className="max-w-[46ch] text-lg text-dim">
                    Verify a school email, tell us where campus is, and you have a page
                    naming every plate reader around it and the offices that can take them down
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
                            {form.processing ? 'Sending' : 'Start your Chapter'}
                        </button>
                    </div>

                    <p id="email-help" className="text-sm text-faint">
                        A .edu or .org address. It proves you are actually at the school, and it is
                        the only thing we ever ask for
                    </p>

                    {errors?.email && (
                        <p className="border border-signal bg-signal/10 px-4 py-3 font-data text-sm text-signal">
                            {errors.email}
                        </p>
                    )}

                    {existing && (
                        <div className="border border-net bg-net-wash px-4 py-4">
                            <p className="font-data text-sm text-net">
                                {existing.shortName} already has a chapter, so there is no link to
                                send. One school, one chapter.
                            </p>
                            <a
                                href={`/${existing.slug}`}
                                className="mt-3 inline-block bg-net px-4 py-2 font-data text-sm font-semibold text-void no-underline"
                            >
                                Go to the {existing.shortName} chapter
                            </a>
                            <p className="mt-3 text-sm text-faint">
                                If you think it has been abandoned, or there is a problem with it,
                                get in touch and it can be reassigned or taken down.
                            </p>
                        </div>
                    )}

                    {status && !existing && (
                        <p className="border border-net bg-net-wash px-4 py-3 font-data text-sm text-net">
                            {status}
                        </p>
                    )}
                </form>

                {/*
                  * The key to the map behind the page. It reads as a sentence
                  * rather than a legend box, because the figures in it are the
                  * argument, not a caption. Both are counted from the chapter
                  * files, so neither can drift from what is drawn.
                  */}
                {chapters.length > 0 && (
                    <p className="max-w-[46ch] font-data text-sm text-faint">
                        <span className="text-signal">
                            {chapters.length === 1 ? 'One campus' : `${chapters.length} campuses`}
                        </span>{' '}
                        marked in red
                        {coverage.readersNearby > 0 && (
                            <>
                                , with{' '}
                                <span className="text-net">
                                    {coverage.readersNearby.toLocaleString()} plate readers
                                </span>{' '}
                                mapped within a mile of them
                            </>
                        )}
                    </p>
                )}
            </section>

            <div style={OVER_FIELD}>
                <section className="border-t border-hair py-20">
                    <div className="shell grid gap-10">
                        <div className="grid gap-4">
                            <p className="annot text-net">How it works</p>
                            <h2 className="max-w-[18ch] text-[clamp(1.75rem,4vw,2.75rem)] uppercase">
                                Five minutes to make a chapter
                            </h2>
                        </div>

                        {/* Numbered because this genuinely is a sequence, ruled rather
                            than tiled because four matching boxes says nothing about it. */}
                        <ol className="border-t border-hair">
                            {[
                                ['Verify', 'A link to your school email address.'],
                                ['Name', 'Tell us the name of your school.'],
                                ['Locate', 'Search for your campus and pick it from the list.'],
                                ['Generate', 'Get your chapter page!'],
                            ].map(([title, body], index) => (
                                <li
                                    key={title}
                                    className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-hair py-5"
                                >
                                    <span className="font-data text-sm text-net">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="w-28 text-lg uppercase">{title}</h3>
                                    <p className="min-w-[16rem] flex-1 text-sm text-dim">{body}</p>
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
                                                : chapter.status === 'empty'
                                                  ? 'no readers mapped'
                                                  : 'not surveyed yet'}
                                        </span>
                                        <span className="annot text-faint">/{chapter.slug}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </Shell>
    );
}
