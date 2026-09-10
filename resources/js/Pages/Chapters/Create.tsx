import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Shell from '@/Layouts/Shell';

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
    roles: { value: string; label: string }[];
    apex: string;
}

const STEPS = ['Your school', 'Where campus is', 'Who decides', 'Your channels', 'Generate'];

const EMPTY_OFFICIAL = { name: '', title: '', email: '', url: '', role: 'city-council' };

type OfficialRow = typeof EMPTY_OFFICIAL;

/**
 * What the district lookup actually sends back.
 *
 * The directory records a missing address as null rather than omitting it, and
 * every member of Congress has one: they publish a contact form instead of an
 * email. Declaring that honestly is what stops a null being spread into a form
 * whose fields are only ever strings.
 */
type LookedUpOfficial = Partial<Record<keyof OfficialRow, string | null>>;

/**
 * A looked-up office as a form row.
 *
 * Nulls become empty strings here and nowhere else. Spreading them in raw put a
 * null behind an input's `value` and under a `.trim()` on the next render,
 * which threw and took the whole create page down to a blank screen the moment
 * a campus was chosen.
 */
/** An office reachable only through a web form: a link, and no address behind it. */
function formOnly(official: OfficialRow): boolean {
    return official.email.trim() === '' && official.url.trim() !== '';
}

function asRow(official: LookedUpOfficial): OfficialRow {
    return {
        name: official.name ?? '',
        title: official.title ?? '',
        email: official.email ?? '',
        url: official.url ?? '',
        role: official.role ?? EMPTY_OFFICIAL.role,
    };
}

/**
 * Create a chapter, in five steps.
 *
 * Deliberately longer than it has to be. A page nobody maintains is worse than
 * no page, and the people who abandon this at step three were not going to run
 * a chapter — while the ones who finish it hand over the officials and the
 * accounts that make their page work on the day it goes live.
 *
 * Every step is held in the browser and posted once at the end. There is no
 * session and no draft on the server, so leaving halfway leaves nothing behind.
 */
export default function Create({
    ticket,
    domain,
    minutesRemaining,
    known,
    suggestedSlug,
    existing,
    states,
    roles,
    apex,
}: Props) {
    const form = useForm({
        ticket,
        schoolName: known?.schoolName ?? '',
        shortName: known?.shortName ?? '',
        state: known?.state ?? '',
        city: '',
        slug: suggestedSlug,
        point: '',
        instagram: 'deflock.',
        petitionUrl: '',
        primaryColour: '#1f6feb',
        secondaryColour: '#f0b429',
        officials: [{ ...EMPTY_OFFICIAL }],
    });

    const [step, setStep] = useState(0);
    const [term, setTerm] = useState(known?.shortName ?? '');
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [chosen, setChosen] = useState<PlaceResult | null>(null);
    const [searching, setSearching] = useState(false);

    const [searchError, setSearchError] = useState<string | null>(null);
    const [lookingUp, setLookingUp] = useState(false);
    const [prefilled, setPrefilled] = useState(0);
    const [lookupFailed, setLookupFailed] = useState(false);

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
        form.setData((data) => ({
            ...data,
            point: `${place.latitude},${place.longitude}`,
            state: place.state ?? data.state,
            // From the structured address. The display name starts with the most
            // specific part, so reading a town out of it lands on the street.
            city: place.city ?? data.city,
        }));

        loadRepresentatives(place);
    }

    /**
     * Fills the officials step with the people who actually represent this
     * campus, so the creator edits a list rather than researching one.
     *
     * A failure is shown rather than swallowed. This was silent once, and a
     * broken route went unnoticed because the only symptom was an empty step
     * that looked exactly like a working one.
     */
    async function loadRepresentatives(place: PlaceResult) {
        setLookingUp(true);
        setLookupFailed(false);

        try {
            const response = await fetch('/districts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                },
                body: JSON.stringify({
                    ticket,
                    point: `${place.latitude},${place.longitude}`,
                    state: place.state ?? '',
                }),
            });

            if (!response.ok) {
                setLookupFailed(true);

                return;
            }

            const found: LookedUpOfficial[] = (await response.json()).officials ?? [];

            if (found.length === 0) {
                return;
            }

            form.setData('officials', [
                ...found.map(asRow),
                { ...EMPTY_OFFICIAL, role: 'city-council' },
            ]);
            setPrefilled(found.length);
        } catch {
            setLookupFailed(true);
        } finally {
            setLookingUp(false);
        }
    }

    function removeOfficial(index: number) {
        form.setData(
            'officials',
            form.data.officials.filter((_, i) => i !== index),
        );
    }

    function setOfficial(index: number, field: keyof typeof EMPTY_OFFICIAL, value: string) {
        form.setData(
            'officials',
            form.data.officials.map((official, i) =>
                i === index ? { ...official, [field]: value } : official,
            ),
        );
    }

    const handle = form.data.instagram
        .trim()
        .replace(/^@/, '')
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/\/.*$/, '');

    // A listed official with no email is a button that opens an empty draft.
    // Prefilled members of Congress are the exception: they publish a form
    // instead of an address, and that arrives as a url.
    const unreachable = form.data.officials.filter(
        (o) => o.name.trim() !== '' && o.email.trim() === '' && (o.url ?? '').trim() === '',
    );

    const canAdvance = [
        form.data.schoolName.length > 1 && form.data.shortName.length > 1 && form.data.slug.length > 1,
        form.data.point !== '',
        unreachable.length === 0,
        form.data.instagram.trim().replace(/^deflock\./, '').length > 0,
        true,
    ][step];

    if (existing) {
        return (
            <Shell>
                <Head title="This school already has a chapter" />
                <div className="mx-auto max-w-2xl px-6 py-24">
                    <h1 className="text-3xl font-bold">{existing.shortName} already has a chapter.</h1>
                    <p className="mt-4 text-dim">
                        One school, one chapter. If you think it has been abandoned or there is a
                        problem with it, get in touch and it can be reassigned or taken down.
                    </p>
                    <Link
                        href={`/${existing.slug}`}
                        className="btn btn-primary mt-8 no-underline"
                    >
                        Go to the chapter
                    </Link>
                </div>
            </Shell>
        );
    }

    return (
        <Shell>
            <Head title="Start a chapter" />

            <div className="mx-auto max-w-2xl px-6 py-16">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
                    Verified as {domain} · link valid {minutesRemaining} more minutes
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight">Start a chapter</h1>

                <ol className="mt-8 flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs">
                    {STEPS.map((label, index) => (
                        <li
                            key={label}
                            className={
                                index === step
                                    ? 'text-net'
                                    : index < step
                                      ? 'text-dim'
                                      : 'text-faint'
                            }
                        >
                            {index + 1}. {label}
                            {index < STEPS.length - 1 ? <span className="ml-2 text-faint">→</span> : null}
                        </li>
                    ))}
                </ol>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/chapters');
                    }}
                    className="mt-8 space-y-6"
                >
                    {step === 0 && (
                        <>
                            <p className="text-dim">
                                {known
                                    ? `We know ${domain} as ${known.schoolName}. Correct it if we have it wrong.`
                                    : `We do not have ${domain} on file, so tell us which school it is.`}
                            </p>
                            <Field label="School name" error={form.errors.schoolName}>
                                <input
                                    value={form.data.schoolName}
                                    onChange={(e) => form.setData('schoolName', e.target.value)}
                                    className={inputClass}
                                    placeholder="Georgia Institute of Technology"
                                />
                            </Field>
                            <Field label="Short name" hint="What students actually call it." error={form.errors.shortName}>
                                <input
                                    value={form.data.shortName}
                                    onChange={(e) => form.setData('shortName', e.target.value)}
                                    className={inputClass}
                                    placeholder="Georgia Tech"
                                />
                            </Field>
                            <Field
                                label="Web address"
                                hint={`${form.data.slug || 'your-slug'}.${apex} and ${apex}/${form.data.slug || 'your-slug'}`}
                                error={form.errors.slug}
                            >
                                <input
                                    value={form.data.slug}
                                    onChange={(e) => form.setData('slug', e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                            <fieldset className="border border-hair p-4">
                                <legend className="px-2 text-sm font-bold">School colours</legend>
                                <p className="text-sm text-dim">
                                    Your page picks whichever of the two reads clearly against its
                                    background, and keeps its own palette if neither does.
                                </p>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <ColourField
                                        label="Primary"
                                        value={form.data.primaryColour}
                                        onChange={(value) => form.setData('primaryColour', value)}
                                    />
                                    <ColourField
                                        label="Secondary"
                                        value={form.data.secondaryColour}
                                        onChange={(value) => form.setData('secondaryColour', value)}
                                    />
                                </div>
                                {form.errors.primaryColour && (
                                    <p className="mt-2 text-sm text-signal">
                                        {form.errors.primaryColour}
                                    </p>
                                )}
                            </fieldset>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <p className="text-dim">
                                We count the plate readers within a mile of the point you pick.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    aria-label="Search for your campus"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            search();
                                        }
                                    }}
                                    className={inputClass}
                                    placeholder="Georgia Tech, Atlanta"
                                />
                                <button
                                    type="button"
                                    onClick={search}
                                    disabled={searching || term.trim().length < 3}
                                    className="btn btn-quiet shrink-0"
                                >
                                    {searching ? 'Looking…' : 'Search'}
                                </button>
                            </div>

                            {searchError ? <p className="text-sm text-signal">{searchError}</p> : null}

                            {results.length > 0 ? (
                                <ul className="space-y-1">
                                    {results.map((place) => (
                                        <li key={`${place.latitude},${place.longitude}`}>
                                            <button
                                                type="button"
                                                onClick={() => choose(place)}
                                                className="w-full rounded border border-hair px-3 py-2 text-left text-sm hover:border-net"
                                            >
                                                {place.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}

                            {chosen ? (
                                <p className="rounded border border-net bg-net-wash px-3 py-2 text-sm">
                                    Using <strong>{chosen.label}</strong>
                                </p>
                            ) : null}

                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field label="State" error={form.errors.state}>
                                    <select
                                        value={form.data.state}
                                        onChange={(e) => form.setData('state', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Choose a state</option>
                                        {states.map((state) => (
                                            <option key={state.code} value={state.code}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="City" error={form.errors.city}>
                                    <input
                                        value={form.data.city}
                                        onChange={(e) => form.setData('city', e.target.value)}
                                        className={inputClass}
                                        placeholder="Atlanta"
                                    />
                                </Field>
                            </div>
                            {form.errors.point ? <p className="text-sm text-signal">{form.errors.point}</p> : null}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/*
                              * Says what has already been done before asking for
                              * anything, so a creator can see the gap is local
                              * offices rather than wondering what is expected.
                              */}
                            <div className="rounded border border-hair-lit bg-panel p-4">
                                <p className="text-sm font-bold text-glow">
                                    We fill in state and federal legislators for you
                                </p>
                                <p className="mt-2 text-sm text-dim">
                                    Your state senator, state representative and members of Congress
                                    are added automatically from public records, based on where your
                                    campus sits.
                                </p>
                                <p className="mt-2 text-sm text-dim">
                                    What we cannot look up is local. If you want to add{' '}
                                    <strong className="text-glow">city council members</strong>,
                                    your sheriff, a police chief or campus administration, add them
                                    here. Those are usually the people who signed for the cameras.
                                </p>
                            </div>

                            {lookupFailed ? (
                                <p className="text-sm text-signal">
                                    Could not look up your representatives. Add them by hand below,
                                    or go back a step and pick the campus again.
                                </p>
                            ) : null}

                            {lookingUp ? (
                                <p className="text-sm text-faint">
                                    Looking up who represents this campus…
                                </p>
                            ) : null}

                            {prefilled > 0 ? (
                                <p className="rounded border border-net bg-net-wash px-3 py-2 text-sm">
                                    Added the {prefilled} state and federal legislators who represent
                                    this campus. Check them, fix anything wrong, and add your city
                                    council below.
                                </p>
                            ) : (
                                <p className="text-sm text-faint">
                                    All optional, and you can add or change any of this later from
                                    the edit button on your chapter page.
                                </p>
                            )}

                            <p className="text-sm text-faint">
                                Members of Congress do not publish email addresses. Those entries
                                carry the official contact form instead, and your page links to it.
                            </p>

                            {form.data.officials.map((official, index) => (
                                <div key={index} className="grid gap-3 rounded border border-hair p-4">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="grid gap-1">
                                            <span className="annot">Role</span>
                                            <select
                                                value={official.role}
                                                onChange={(e) => setOfficial(index, 'role', e.target.value)}
                                                className={inputClass}
                                            >
                                                {roles.map((role) => (
                                                    <option key={role.value} value={role.value}>
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        {/*
                                          * Named for a screen reader as well as
                                          * a sighted one: a placeholder is gone
                                          * the moment anybody types, so on its
                                          * own it leaves the field anonymous to
                                          * exactly the reader who needs it most.
                                          */}
                                        <input
                                            aria-label="Name"
                                            value={official.name}
                                            onChange={(e) => setOfficial(index, 'name', e.target.value)}
                                            className={inputClass}
                                            placeholder="Name"
                                        />
                                        <input
                                            aria-label="Title"
                                            value={official.title}
                                            onChange={(e) => setOfficial(index, 'title', e.target.value)}
                                            className={inputClass}
                                            placeholder="City Councilmember, District 3"
                                        />
                                    </div>
                                    {/*
                                      * Locked only for an office that takes a
                                      * form *instead of* an address. State
                                      * legislators carry both a website and an
                                      * email, and keying off the website alone
                                      * froze their address too — on a step that
                                      * asks the creator to check and fix what
                                      * was looked up for them.
                                      */}
                                    <input
                                        type="email"
                                        aria-label="Email"
                                        value={official.email}
                                        onChange={(e) => setOfficial(index, 'email', e.target.value)}
                                        className={inputClass}
                                        placeholder={
                                            formOnly(official)
                                                ? 'Takes a web form instead of an email'
                                                : 'Email (required)'
                                        }
                                        disabled={formOnly(official)}
                                    />

                                    {/*
                                      * The step below tells a creator to remove
                                      * a row it cannot use, and a handful of the
                                      * shipped legislators arrive with no
                                      * address and no form — so without this
                                      * control that instruction pointed at
                                      * nothing and the step could not be passed.
                                      */}
                                    {form.data.officials.length > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => removeOfficial(index)}
                                            className="justify-self-start text-sm text-faint"
                                        >
                                            Remove
                                        </button>
                                    ) : null}
                                </div>
                            ))}

                            {form.data.officials.length < 6 ? (
                                <button
                                    type="button"
                                    onClick={() => form.setData('officials', [...form.data.officials, { ...EMPTY_OFFICIAL }])}
                                    className="btn btn-quiet"
                                >
                                    Add another office
                                </button>
                            ) : null}

                            {unreachable.length > 0 ? (
                                <p className="text-sm text-signal">
                                    {unreachable.length === 1
                                        ? `${unreachable[0].name.trim()} needs an email address.`
                                        : `${unreachable.length} people still need an email address.`}{' '}
                                    Without one, the button on your page opens an empty message.
                                    Remove the row if you cannot find an address.
                                </p>
                            ) : null}

                            {form.errors.officials ? (
                                <p className="text-sm text-signal">{form.errors.officials}</p>
                            ) : null}
                        </>
                    )}

                    {step === 3 && (
                        <>
                            {/*
                              * Two blocks, deliberately unalike. A student should be
                              * able to tell at a glance which part they cannot skip.
                              */}
                            <section className="rounded border-2 border-net/60 bg-net/5 p-5">
                                <p className="font-mono text-xs uppercase tracking-[0.16em] text-net">
                                    Required
                                </p>
                                <h2 className="mt-2 text-xl font-bold">Instagram Account</h2>
                                <p className="mt-2 text-sm text-dim">
                                    Social media is vital to the virality of DeFlock. Please make an Instagram account for your chapter and link it here.
                                </p>

                                <div className="mt-4">
                                    <Field label="Instagram handle" hint="Without the @" error={form.errors.instagram}>
                                        <input
                                            value={form.data.instagram}
                                            onChange={(e) => form.setData('instagram', e.target.value)}
                                            className={inputClass}
                                            placeholder={`deflock.${form.data.slug || 'yourschool'}`}
                                        />
                                    </Field>
                                </div>

                                {handle ? (
                                    <a
                                        href={`https://instagram.com/${handle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-block text-sm text-net underline underline-offset-4"
                                    >
                                        Open instagram.com/{handle} to check it ↗
                                    </a>
                                ) : null}
                            </section>

                            <section className="rounded border border-dashed border-hair-lit p-5">
                                <p className="font-mono text-xs uppercase tracking-[0.16em] text-faint">
                                    Optional
                                </p>
                                <h2 className="mt-2 text-lg font-bold text-dim">
                                    Petition
                                </h2>
                                <p className="mt-2 text-sm text-faint">
                                    If your chapter is collecting signatures somewhere, paste the
                                    link and your page gets a section for it.
                                </p>

                                <div className="mt-4">
                                    <Field label="Petition link" error={form.errors.petitionUrl}>
                                        <input
                                            type="url"
                                            value={form.data.petitionUrl}
                                            onChange={(e) => form.setData('petitionUrl', e.target.value)}
                                            className={inputClass}
                                            placeholder="https://www.change.org/p/..."
                                        />
                                    </Field>
                                </div>
                            </section>
                        </>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <dl className="grid gap-2 rounded border border-hair p-5 text-sm">
                                <Row label="School" value={form.data.schoolName} />
                                <Row
                                    label="Address"
                                    value={`${form.data.slug}.${apex} and ${apex}/${form.data.slug}`}
                                />
                                <Row label="Campus" value={chosen?.label ?? form.data.point} />
                                <Row label="Where" value={`${form.data.city}, ${form.data.state}`} />
                                <Row
                                    label="Officials"
                                    value={`${form.data.officials.filter((o) => o.name.trim()).length} added`}
                                />
                                <Row
                                    label="Colours"
                                    value={`${form.data.primaryColour} / ${form.data.secondaryColour}`}
                                />
                                <Row label="Instagram" value={form.data.instagram || 'none yet'} />
                                <Row label="Petition" value={form.data.petitionUrl ? 'linked' : 'none'} />
                            </dl>

                            <p className="text-sm text-faint">
                                Generating runs two queries against OpenStreetMap and takes a few
                                seconds. Nothing about you is stored beyond an irreversible record
                                that this address owns this chapter.
                            </p>

                            <button
                                type="submit"
                                disabled={form.processing || !form.data.point}
                                className="btn btn-primary w-full justify-center py-4 text-lg"
                            >
                                {form.processing ? 'Counting the readers…' : 'Generate the chapter'}
                            </button>
                        </div>
                    )}

                    {step < 4 ? (
                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setStep((s) => Math.max(0, s - 1))}
                                disabled={step === 0}
                                className="btn btn-quiet disabled:opacity-30"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep((s) => s + 1)}
                                disabled={!canAdvance}
                                className="btn btn-primary"
                            >
                                Continue
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setStep(3)}
                            className="rounded px-4 py-2 text-sm text-dim"
                        >
                            Back
                        </button>
                    )}
                </form>
            </div>
        </Shell>
    );
}

const inputClass = 'field w-full';

/** A colour picker beside the hex, because creators arrive knowing one or the other. */
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
            <span className="text-sm font-bold">{label}</span>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-12 shrink-0 cursor-pointer border border-hair bg-void"
                    aria-label={`${label} colour picker`}
                />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass + ' font-mono'}
                    placeholder="#003057"
                    maxLength={7}
                    spellCheck={false}
                />
            </div>
        </label>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="text-faint">{label}</dt>
            <dd className="text-right font-mono">{value || 'not set'}</dd>
        </div>
    );
}

function Field({
    label,
    hint,
    error,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="text-sm font-bold">{label}</span>
            {hint ? <span className="ml-2 font-mono text-xs text-faint">{hint}</span> : null}
            <div className="mt-2">{children}</div>
            {error ? <p className="mt-1 text-sm text-signal">{error}</p> : null}
        </label>
    );
}
