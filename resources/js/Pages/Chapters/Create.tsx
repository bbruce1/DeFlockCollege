import { Head, Link, useForm } from '@inertiajs/react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import Shell from '@/Layouts/Shell';
import PostDeck from '@/Posts/PostDeck';

interface TakenCampus {
    slug: string;
    schoolName: string;
    shortName: string;
}

interface PlaceResult {
    label: string;
    latitude: number;
    longitude: number;
    state: string | null;
    city: string | null;
}

interface Props {
    ticket: string;
    domain: string;
    minutesRemaining: number;
    known: { schoolName: string; shortName: string; state: string } | null;
    suggestedSlug: string;
    existing: { slug: string; shortName: string } | null;
    states: { code: string; name: string }[];
    apex: string;
}

/**
 * Start a chapter, one question at a time.
 *
 * Shaped like an app rather than a form: a single question fills the screen, the
 * action sits under the thumb, and nothing else competes for attention. The
 * previous version put five headings and eleven fields on one page and asked a
 * student to research their own city council in the middle of it.
 *
 * Nobody is asked for officials here. State and federal legislators are already
 * attached to every chapter in that state when the page renders, and a creator
 * who wants to add their city council can do it later from the edit screen.
 * Making that a condition of finishing lost people at the step that mattered
 * least.
 *
 * Everything is held in the browser and posted once at the end. There is no
 * draft to resume and nothing is written until the last screen, so leaving
 * halfway costs a student nothing and leaves us nothing to clean up.
 */

interface Step {
    id: string;
    /** The question, as a person would ask it. */
    title: string;
    /** One line under it. Never a paragraph. */
    hint?: string;
    /** Whether the step is answered well enough to move on. */
    ready: (data: FormData, chosen: PlaceResult | null) => boolean;
    /** Steps a creator is allowed to pass without answering. */
    optional?: boolean;
    /** For an optional step: whether anything has actually been entered. */
    filled?: (data: FormData) => boolean;
}

interface FormData {
    ticket: string;
    schoolName: string;
    shortName: string;
    state: string;
    city: string;
    slug: string;
    point: string;
    instagram: string;
    petitionUrl: string;
    primaryColour: string;
    secondaryColour: string;
    /** Client-side only: the server does not validate it and never stores it. */
    postsAcknowledged: boolean;
}

const SLUG_SHAPE = /^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$/;

const STEPS: Step[] = [
    {
        id: 'school',
        title: 'What school?',
        hint: '',
        ready: (d) => d.schoolName.trim().length >= 2 && d.shortName.trim().length >= 2,
    },
    {
        id: 'campus',
        title: 'Where is campus?',
        hint: 'Search for it, then pick it from the list.',
        ready: (d, chosen) => chosen !== null && d.point !== '' && d.state !== '' && d.city !== '',
    },
    {
        id: 'colours',
        title: 'What are your colours?',
        hint: 'Your page and your posts get built in them.',
        ready: (d) => /^#[0-9a-f]{6}$/i.test(d.primaryColour) && /^#[0-9a-f]{6}$/i.test(d.secondaryColour),
    },
    {
        id: 'posts',
        title: 'We make posts',
        hint: '',
        ready: (d) => d.postsAcknowledged,
    },
    {
        id: 'instagram',
        title: 'Instagram',
        hint: 'This is crucial to how DeFlock builds virality and how you communicate.',
        ready: (d) => d.instagram.trim().length >= 3,
    },
    {
        id: 'petition',
        title: 'Collecting signatures?',
        hint: 'Optional. Paste a link and your page gets a petition block.',
        ready: () => true,
        optional: true,
        filled: (d) => d.petitionUrl.trim() !== '',
    },
    {
        id: 'address',
        title: 'Pick your web address',
        hint: 'It cannot be changed later.',
        ready: (d) => SLUG_SHAPE.test(d.slug),
    },
];

export default function Create({
    ticket,
    domain,
    minutesRemaining,
    known,
    suggestedSlug,
    existing,
    states,
    apex,
}: Props) {
    const form = useForm<FormData>({
        ticket,
        schoolName: known?.schoolName ?? '',
        shortName: known?.shortName ?? '',
        state: known?.state ?? '',
        city: '',
        slug: suggestedSlug,
        point: '',
        instagram: 'deflock.',
        petitionUrl: '',
        // White, not a sample palette. A picker that opens on somebody else's
        // blue and gold invites leaving them there, and a chapter wearing
        // colours nobody chose is worse than one wearing none.
        primaryColour: '#ffffff',
        secondaryColour: '#ffffff',
        postsAcknowledged: false,
    });

    const [step, setStep] = useState(0);
    const [term, setTerm] = useState(known?.shortName ?? '');
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [chosen, setChosen] = useState<PlaceResult | null>(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    // A chapter already standing on the campus just picked. Checked here so it
    // is shown while it can still be acted on, rather than at the last screen.
    const [taken, setTaken] = useState<TakenCampus | null>(null);
    const [checking, setChecking] = useState(false);

    const current = STEPS[step];
    const last = step === STEPS.length - 1;
    // A campus that already has a chapter is not a campus this one can use, and
    // the server will say so at submit. Saying it here saves five screens.
    const ready =
        current.ready(form.data, chosen) && !(current.id === 'campus' && (taken !== null || checking));

    /**
     * Moving to a step puts the cursor in it, on a device with a pointer.
     *
     * Not on a phone: taking focus there throws the keyboard up over the screen
     * the moment it arrives, which on the Instagram step would cover the posts
     * that are the reason for the screen. A thumb can choose its own moment.
     */
    const fieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (window.matchMedia('(pointer: fine)').matches) {
            fieldRef.current?.focus();
        }
    }, [step]);

    function next() {
        if (!ready && !current.optional) {
            return;
        }

        if (last) {
            form.post('/chapters');

            return;
        }

        setStep((n) => Math.min(STEPS.length - 1, n + 1));
    }

    function back() {
        setStep((n) => Math.max(0, n - 1));
    }

    // Enter advances, which is what a keyboard expects of a one-field screen.
    function onKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            next();
        }
    }

    async function search() {
        setSearching(true);
        setSearchError(null);

        try {
            const response = await fetch('/places', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                },
                body: JSON.stringify({ ticket, term }),
            });

            const payload = await response.json();

            if (!response.ok) {
                setSearchError(payload.message ?? 'That lookup did not work. Try again shortly.');
                setResults([]);

                return;
            }

            setResults(payload.results ?? []);

            if ((payload.results ?? []).length === 0) {
                setSearchError('Nothing matched. Try the town as well as the school name.');
            }
        } catch {
            setSearchError('Could not reach the lookup service. Check your connection and retry.');
        } finally {
            setSearching(false);
        }
    }

    function choose(place: PlaceResult) {
        setChosen(place);
        setResults([]);
        setTaken(null);
        form.setData((data) => ({
            ...data,
            point: `${place.latitude},${place.longitude}`,
            state: place.state ?? data.state,
            city: place.city ?? data.city,
        }));

        void checkCampus(`${place.latitude},${place.longitude}`);
    }

    /**
     * Whether this campus already has a chapter.
     *
     * The server refuses a duplicate either way; this only decides whether that
     * is learned now or after five more screens. A failure here is therefore
     * not worth reporting: the answer arrives at submit regardless.
     */
    async function checkCampus(point: string) {
        setChecking(true);

        try {
            const response = await fetch('/nearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                },
                body: JSON.stringify({ ticket, point }),
            });

            if (response.ok) {
                setTaken(((await response.json()).existing as TakenCampus | null) ?? null);
            }
        } catch {
            // Left to the server.
        } finally {
            setChecking(false);
        }
    }

    const handle = form.data.instagram.trim().replace(/^@/, '');

    const postInput = useMemo(
        () => ({
            schoolName: form.data.schoolName || 'Your school',
            shortName: form.data.shortName || form.data.schoolName || 'Your school',
            primary: form.data.primaryColour,
            secondary: form.data.secondaryColour,
            readersWithinMile: null,
            address: `${form.data.slug || 'yourschool'}.${apex}`,
        }),
        [
            form.data.schoolName,
            form.data.shortName,
            form.data.primaryColour,
            form.data.secondaryColour,
            form.data.slug,
            apex,
        ],
    );

    if (existing) {
        return (
            <Shell>
                <Head title="This school already has a chapter" />
                <section className="shell grid min-h-[70dvh] max-w-lg content-center gap-5 py-16">
                    <h1 className="text-[clamp(1.8rem,6vw,2.6rem)] uppercase leading-[1.05]">
                        {existing.shortName} already has a chapter
                    </h1>
                    <p className="text-dim">One school, one chapter. Yours is already up.</p>
                    <Link href={`/${existing.slug}`} className="btn btn-primary justify-self-start">
                        Go to it
                    </Link>
                </section>
            </Shell>
        );
    }

    return (
        <Shell>
            <Head title="Start a chapter" />

            <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
                {/* Progress, and the only way back. */}
                <div className="shell w-full pt-5">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={back}
                            disabled={step === 0}
                            aria-label="Back"
                            className="grid h-11 w-11 place-items-center border border-hair text-dim transition-colors hover:border-net hover:text-net disabled:opacity-30 disabled:hover:border-hair disabled:hover:text-dim"
                        >
                            <span aria-hidden="true">←</span>
                        </button>

                        <div className="flex flex-1 gap-1.5" role="presentation">
                            {STEPS.map((s, index) => (
                                <span
                                    key={s.id}
                                    className={`h-1 flex-1 transition-colors ${
                                        index < step ? 'bg-net' : index === step ? 'bg-net/60' : 'bg-hair'
                                    }`}
                                />
                            ))}
                        </div>

                        <span className="annot shrink-0 text-faint">
                            {step + 1}/{STEPS.length}
                        </span>
                    </div>
                </div>

                {/* The question. One screen, one thing. */}
                {/*
                  * Centred with auto margins rather than justify-center: a flex
                  * child that is taller than the box gets clipped at the top by
                  * centring, and the Instagram step with its five posts is
                  * taller than a phone. This centres a short step and scrolls a
                  * long one.
                  */}
                <main className="shell flex w-full flex-1 flex-col pb-8 pt-10">
                    {/*
                      * Every step is centred. One question at a time on an
                      * otherwise empty screen reads as a prompt; the same
                      * question pinned to the left edge reads as a form, and this
                      * is deliberately not a form. The posts step gets more room
                      * because it holds a deck of cards rather than a field.
                      */}
                    <div
                        className={`mx-auto my-auto w-full text-center ${
                            current.id === 'posts' ? 'max-w-3xl' : 'max-w-xl'
                        }`}
                    >
                        <h1 className="text-balance text-[clamp(1.9rem,7vw,3rem)] uppercase leading-[1.02]">
                            {current.title}
                        </h1>

                        {current.hint ? (
                            <p className="mt-3 text-dim">{current.hint}</p>
                        ) : null}

                        <div className="mt-8 grid gap-5" onKeyDown={onKeyDown}>
                            {current.id === 'school' && (
                                <>
                                    <BigField
                                        ref={fieldRef}
                                        label="Full name"
                                        value={form.data.schoolName}
                                        onChange={(v) => form.setData('schoolName', v)}
                                        placeholder="Georgia Institute of Technology"
                                        error={form.errors.schoolName}
                                    />
                                    <BigField
                                        label="What people call it"
                                        value={form.data.shortName}
                                        onChange={(v) => form.setData('shortName', v)}
                                        placeholder="Georgia Tech"
                                        error={form.errors.shortName}
                                    />
                                    <p className="annot text-faint">
                                        Verified as {domain} · {minutesRemaining} minutes left
                                    </p>
                                </>
                            )}

                            {current.id === 'campus' && (
                                <>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <input
                                            ref={fieldRef}
                                            value={term}
                                            onChange={(e) => setTerm(e.target.value)}
                                            placeholder="Georgia Tech, Atlanta"
                                            aria-label="Search for your campus"
                                            type="search"
                                            inputMode="search"
                                            autoComplete="off"
                                            style={{ touchAction: 'manipulation' }}
                                            className="field min-h-[3.25rem] flex-1 text-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={search}
                                            disabled={searching || term.trim().length < 2}
                                            className="btn btn-primary min-h-[3.25rem]"
                                        >
                                            {searching ? 'Searching' : 'Search'}
                                        </button>
                                    </div>

                                    {searchError ? (
                                        <p
                                            role="alert"
                                            className="border border-signal bg-signal/10 px-4 py-3 font-data text-sm text-signal"
                                        >
                                            {searchError}
                                        </p>
                                    ) : null}

                                    {results.length > 0 ? (
                                        <ul className="grid gap-px border border-hair bg-hair">
                                            {results.map((place) => (
                                                <li key={`${place.latitude},${place.longitude}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => choose(place)}
                                                        className="w-full bg-void px-4 py-4 text-left text-sm transition-colors hover:bg-panel active:scale-[0.995]"
                                                    >
                                                        {place.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}

                                    {chosen && taken ? (
                                        <div role="alert" className="border border-signal bg-signal/10 px-4 py-4">
                                            <p className="annot text-signal">
                                                This campus already has a chapter
                                            </p>
                                            <p className="mt-2 text-sm text-dim">
                                                {taken.schoolName} is already here. If that is your
                                                school, use its page rather than starting a second
                                                one.
                                            </p>
                                            <a
                                                href={`/${taken.slug}`}
                                                className="mt-3 inline-block min-h-[2.75rem] bg-signal px-4 py-3 font-data text-sm font-semibold text-void no-underline"
                                            >
                                                Go to {taken.shortName}
                                            </a>
                                            <p className="mt-3 text-sm text-faint">
                                                Genuinely a different school at the same address?{' '}
                                                <a href="/contact" className="text-net underline underline-offset-4">
                                                    Get in touch
                                                </a>
                                                .
                                            </p>
                                        </div>
                                    ) : null}

                                    {chosen && !taken ? (
                                        <div className="border border-net bg-net-wash px-4 py-4">
                                            <p className="annot text-net">
                                                {checking ? 'Checking…' : 'Campus set'}
                                            </p>
                                            <p className="mt-1 text-sm">{chosen.label}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setChosen(null);
                                                    setTaken(null);
                                                    form.setData('point', '');
                                                }}
                                                className="mt-3 min-h-[2.75rem] font-data text-xs uppercase tracking-wider text-dim underline underline-offset-4 hover:text-net"
                                            >
                                                Pick a different one
                                            </button>
                                        </div>
                                    ) : null}

                                    {chosen && (!form.data.state || !form.data.city) ? (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <label className="grid gap-2">
                                                <span className="annot">State</span>
                                                <select
                                                    value={form.data.state}
                                                    onChange={(e) => form.setData('state', e.target.value)}
                                                    className="field min-h-[3.25rem]"
                                                >
                                                    <option value="">Choose</option>
                                                    {states.map((s) => (
                                                        <option key={s.code} value={s.code}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <BigField
                                                label="City"
                                                value={form.data.city}
                                                onChange={(v) => form.setData('city', v)}
                                                placeholder="Atlanta"
                                            />
                                        </div>
                                    ) : null}
                                </>
                            )}

                            {current.id === 'colours' && (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <ColourField
                                            label="Primary"
                                            value={form.data.primaryColour}
                                            onChange={(v) => form.setData('primaryColour', v)}
                                        />
                                        <ColourField
                                            label="Secondary"
                                            value={form.data.secondaryColour}
                                            onChange={(v) => form.setData('secondaryColour', v)}
                                        />
                                    </div>

                                    <div
                                        className="grid aspect-[16/7] content-end gap-1 p-5"
                                        style={{
                                            background: form.data.primaryColour,
                                            color: form.data.secondaryColour,
                                        }}
                                    >
                                        <p className="annot" style={{ opacity: 0.85 }}>
                                            {form.data.shortName || 'Your school'}
                                        </p>
                                        <p className="text-2xl font-semibold leading-tight">
                                            You are being flocked
                                        </p>
                                    </div>
                                    <p className="annot text-faint">
                                        Your page adapts these so text stays readable on them.
                                    </p>
                                </>
                            )}

                            {current.id === 'posts' && (
                                <div className="grid gap-6">
                                    <p className="mx-auto max-w-[54ch] text-dim">
                                        We make posts built
                                        from your colors and your campus, with the captions
                                        written.
                                    </p>

                                    <PostDeck
                                        input={postInput}
                                        handle={handle || `deflock.${form.data.slug || 'yourschool'}`}
                                    />

                                    {/*
                                      * Said plainly, and worth being careful about: nothing here
                                      * touches anybody's account. We make them; posting stays the
                                      * creator's, which is also why the Instagram is theirs to make.
                                      */}
                                    <p className="mx-auto max-w-[54ch] border border-hair bg-panel px-4 py-3 text-sm text-dim">
                                        <strong className="text-glow">We make them, and you post them and whatever else you want.</strong>{' '}
                                    </p>

                                    {form.data.postsAcknowledged ? (
                                        <div className="mx-auto max-w-[54ch] border border-net bg-net-wash p-5">
                                            <p className="annot text-net">Where to find them</p>
                                            <h3 className="mt-2 text-lg uppercase">
                                                Posts are at{' '}
                                                <Link href="/social" className="text-net">
                                                    deflock.school/social
                                                </Link>
                                            </h3>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => form.setData('postsAcknowledged', true)}
                                            className="btn btn-primary justify-self-center"
                                        >
                                            I understand
                                        </button>
                                    )}
                                </div>
                            )}

                            {current.id === 'instagram' && (
                                <>
                                    <BigField
                                        ref={fieldRef}
                                        label="Handle"
                                        prefix="@"
                                        value={form.data.instagram}
                                        onChange={(v) => form.setData('instagram', v)}
                                        placeholder={`deflock.${form.data.slug || 'yourschool'}`}
                                        error={form.errors.instagram}
                                    />

                                    {handle ? (
                                        <a
                                            href={`https://instagram.com/${handle}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="justify-self-start font-data text-xs uppercase tracking-wider text-net underline underline-offset-4"
                                        >
                                            Check instagram.com/{handle} ↗
                                        </a>
                                    ) : null}

                                </>
                            )}

                            {current.id === 'petition' && (
                                <>
                                    <BigField
                                        ref={fieldRef}
                                        label="Petition link"
                                        type="url"
                                        inputMode="url"
                                        value={form.data.petitionUrl}
                                        onChange={(v) => form.setData('petitionUrl', v)}
                                        placeholder="https://www.change.org/p/…"
                                        error={form.errors.petitionUrl}
                                    />

                                    {/*
                                      * Asking for a link without saying where to
                                      * get one is a dead end for anybody who has
                                      * not made a petition before. It opens in a
                                      * new tab so a half-finished chapter is not
                                      * lost on the way.
                                      */}
                                    <p className="mx-auto max-w-[46ch] text-sm text-dim">
                                        Do not have one yet?{' '}
                                        <a
                                            href="https://www.change.org/start-a-petition"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-net underline underline-offset-4"
                                        >
                                            Start one on Change.org ↗
                                        </a>{' '}
                                        then paste the link back here. You can also add it later
                                        from the edit screen, so this is not the last chance.
                                    </p>
                                </>
                            )}

                            {current.id === 'address' && (
                                <>
                                    <BigField
                                        ref={fieldRef}
                                        label="Address"
                                        value={form.data.slug}
                                        onChange={(v) =>
                                            form.setData('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                                        }
                                        placeholder="gatech"
                                        error={form.errors.slug}
                                    />

                                    <div className="border border-hair px-4 py-4 font-data text-sm">
                                        <p className="text-net">{form.data.slug || 'yourschool'}.{apex}</p>
                                        <p className="mt-1 text-faint">
                                            {apex}/{form.data.slug || 'yourschool'}
                                        </p>
                                    </div>

                                    <dl className="grid gap-2 border border-hair px-4 py-4 text-sm">
                                        <Row label="School" value={form.data.schoolName} />
                                        <Row label="Campus" value={chosen?.label ?? form.data.point} />
                                        <Row
                                            label="Where"
                                            value={`${form.data.city}, ${form.data.state}`}
                                        />
                                        <Row label="Instagram" value={handle ? `@${handle}` : 'none'} />
                                        <Row
                                            label="Petition"
                                            value={form.data.petitionUrl ? 'linked' : 'none'}
                                        />
                                    </dl>

                                    <p className="text-sm text-faint">
                                        Your state and federal legislators are attached automatically.
                                        You can add your city council from the edit screen once your
                                        page is up.
                                    </p>
                                </>
                            )}

                            {Object.keys(form.errors).length > 0 ? (
                                <p
                                    role="alert"
                                    className="border border-signal bg-signal/10 px-4 py-3 font-data text-sm text-signal"
                                >
                                    {Object.values(form.errors)[0]}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </main>

                {/*
                  * Under the thumb, and always in the same place — except on the
                  * posts step before it has been acknowledged. There the only
                  * thing to do is read the posts and press "I understand", and a
                  * disabled Continue sitting under that is just a dead control
                  * competing with the one that works.
                  */}
                <div
                    className="sticky bottom-0 border-t border-hair bg-void/95 backdrop-blur"
                    hidden={current.id === 'posts' && !form.data.postsAcknowledged}
                >
                    <div className="shell flex w-full items-center gap-3 py-4">
                        {/*
                          * One action, labelled for what it does. An optional
                          * step is always passable, so a separate Skip button
                          * next to an enabled Continue was two ways to do the
                          * same thing — and the condition it was drawn under
                          * meant it never appeared at all.
                          */}
                        <button
                            type="button"
                            onClick={next}
                            disabled={(!ready && !current.optional) || form.processing}
                            className="btn btn-primary min-h-[3.25rem] flex-1 text-base"
                        >
                            {form.processing
                                ? 'Building your page'
                                : last
                                  ? 'Create my chapter'
                                  : current.optional && !current.filled?.(form.data)
                                    ? 'Skip this'
                                    : 'Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </Shell>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="annot text-faint">{label}</dt>
            <dd className="m-0 text-right text-dim">{value || '—'}</dd>
        </div>
    );
}

function ColourField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="grid gap-2">
            {/* Louder than the other field labels: these two name a choice
                rather than describe an input. */}
            <span className="annot font-semibold text-glow">{label}</span>
            <span className="flex min-h-[3.25rem] items-center gap-3 border border-hair px-3 focus-within:border-net">
                {/*
                  * A colour input ignores height from a class in some browsers,
                  * so it is set outright. At the default it renders about 20px
                  * high, which is too small to hit with a thumb.
                  */}
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ height: '2.5rem', width: '3rem' }}
                    className="cursor-pointer border-0 bg-transparent p-0"
                    aria-label={`${label} colour`}
                />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-transparent font-data text-sm uppercase focus-visible:outline-none"
                    spellCheck={false}
                    autoComplete="off"
                    aria-label={`${label} colour hex`}
                />
            </span>
        </label>
    );
}

/**
 * One field, at the size a thumb expects.
 *
 * Forwards its ref so each step can take focus when it arrives, which is what
 * makes a sequence of screens feel like an app rather than a paged form.
 */
const BigField = forwardRef<
    HTMLInputElement,
    {
        label: string;
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        error?: string;
        type?: string;
        prefix?: string;
        autoComplete?: string;
        inputMode?: 'text' | 'url' | 'search';
        /** Off for handles and addresses, which are not prose. */
        spellCheck?: boolean;
    }
>(function BigField(
    {
        label,
        value,
        onChange,
        placeholder,
        error,
        type = 'text',
        prefix,
        autoComplete = 'off',
        inputMode,
        spellCheck = false,
    },
    ref,
) {
    return (
        <label className="grid gap-2 text-left">
            <span className="annot">{label}</span>

            <span className="flex items-center gap-1 border border-hair px-3 focus-within:border-net">
                {prefix ? <span className="font-data text-dim">{prefix}</span> : null}
                <input
                    ref={ref}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    spellCheck={spellCheck}
                    style={{ touchAction: 'manipulation' }}
                    className="min-h-[3.25rem] w-full bg-transparent text-lg placeholder:text-faint focus-visible:outline-none"
                />
            </span>

            {error ? (
                <span role="alert" className="font-data text-sm text-signal">
                    {error}
                </span>
            ) : null}
        </label>
    );
});
