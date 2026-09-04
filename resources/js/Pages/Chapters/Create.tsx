import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MapPicker, { type Bounds } from '@/Components/MapPicker';
import Shell from '@/Layouts/Shell';

/**
 * The create flow, after the emailed link has been opened.
 *
 * The ticket is carried in the form rather than a session, and re-checked on the
 * server before anything is written. There is no login here; proving the address
 * is the whole mechanism.
 */

interface Props {
    ticket: string;
    domain: string;
    minutesRemaining: number;
    known: { schoolName: string; shortName: string; state: string } | null;
    suggestedSlug: string;
    existing: { slug: string; schoolName: string } | null;
    limits: { maxAreaSqMiles: number; minAreaSqMiles: number };
}

const MILES_PER_DEGREE_LATITUDE = 69;

function areaSqMiles(box: Bounds): number {
    const mid = ((box.north + box.south) / 2) * (Math.PI / 180);
    const height = (box.north - box.south) * MILES_PER_DEGREE_LATITUDE;
    const width = (box.east - box.west) * MILES_PER_DEGREE_LATITUDE * Math.cos(mid);
    return Math.abs(width * height);
}

export default function Create({ ticket, domain, minutesRemaining, known, suggestedSlug, existing, limits }: Props) {
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };
    const [box, setBox] = useState<Bounds | null>(null);

    const form = useForm({
        ticket,
        schoolName: known?.schoolName ?? '',
        shortName: known?.shortName ?? '',
        state: known?.state ?? '',
        slug: suggestedSlug,
        bbox: '',
    });

    // A chapter already exists for this domain. Now that the address is proved,
    // saying so is safe; before verification it would have leaked which schools
    // are taken.
    if (existing) {
        return (
            <Shell>
                <Head title={`${existing.schoolName} already has a chapter`} />
                <section className="shell grid min-h-[70vh] max-w-3xl content-center gap-6 py-20">
                    <p className="annot text-net">Already started</p>
                    <h1 className="text-[clamp(2rem,6vw,3.5rem)] uppercase">
                        {existing.schoolName} already has a chapter.
                    </h1>
                    <p className="max-w-[52ch] text-lg text-dim">
                        One school, one chapter, so there is nothing to start here. Open it and
                        send the emails, which is the part that actually matters.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a href={`/${existing.slug}`} className="btn btn-primary">
                            Open the chapter
                        </a>
                    </div>
                    <p className="max-w-[52ch] text-sm text-faint">
                        If you think it is abandoned, or it should not exist, say so and it can be
                        removed the same day.
                    </p>
                </section>
            </Shell>
        );
    }

    const area = box ? areaSqMiles(box) : 0;
    const areaOk = box !== null && area >= limits.minAreaSqMiles && area <= limits.maxAreaSqMiles;

    return (
        <Shell aside={<span className="annot">Link valid {minutesRemaining} more minutes</span>}>
            <Head title="Start your chapter" />

            <section className="shell grid max-w-4xl gap-12 py-16">
                <header className="grid gap-4">
                    <p className="annot text-net">Verified {domain}</p>
                    <h1 className="text-[clamp(2rem,6vw,3.5rem)] uppercase">
                        {known ? `Start the ${known.shortName} chapter.` : 'Name your school.'}
                    </h1>
                    <p className="max-w-[52ch] text-dim">
                        {known
                            ? 'We recognised your domain, so this is mostly filled in. Change anything that is wrong.'
                            : 'We do not have this domain on file, which is normal for most schools. Tell us what to call it.'}
                    </p>
                </header>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/chapters');
                    }}
                    className="grid gap-10"
                >
                    <fieldset className="grid gap-5 border border-hair bg-panel p-6">
                        <legend className="annot px-2 text-net">The school</legend>

                        <div className="grid gap-2">
                            <label htmlFor="schoolName" className="annot">Full name</label>
                            <input
                                id="schoolName"
                                className="field"
                                value={form.data.schoolName}
                                onChange={(e) => form.setData('schoolName', e.target.value)}
                                placeholder="St Albans School"
                                maxLength={120}
                                required
                            />
                            {errors?.schoolName && <p className="font-data text-sm text-signal">{errors.schoolName}</p>}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-[1fr_7rem]">
                            <div className="grid gap-2">
                                <label htmlFor="shortName" className="annot">What people call it</label>
                                <input
                                    id="shortName"
                                    className="field"
                                    value={form.data.shortName}
                                    onChange={(e) => form.setData('shortName', e.target.value)}
                                    placeholder="St Albans"
                                    maxLength={60}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="state" className="annot">State</label>
                                <input
                                    id="state"
                                    className="field uppercase"
                                    value={form.data.state}
                                    onChange={(e) => form.setData('state', e.target.value.toUpperCase())}
                                    placeholder="GA"
                                    maxLength={2}
                                    required
                                />
                            </div>
                        </div>
                        {errors?.state && <p className="font-data text-sm text-signal">{errors.state}</p>}

                        <div className="grid gap-2">
                            <label htmlFor="slug" className="annot">Address</label>
                            <div className="flex items-center gap-0">
                                <input
                                    id="slug"
                                    className="field"
                                    value={form.data.slug}
                                    onChange={(e) => form.setData('slug', e.target.value.toLowerCase())}
                                    maxLength={32}
                                    required
                                />
                                <span className="annot whitespace-nowrap border border-l-0 border-hair-lit bg-shell px-3 py-[0.9375rem]">
                                    .deflock.school
                                </span>
                            </div>
                            {errors?.slug && <p className="font-data text-sm text-signal">{errors.slug}</p>}
                        </div>
                    </fieldset>

                    <fieldset className="grid gap-4 border border-hair bg-panel p-6">
                        <legend className="annot px-2 text-net">The campus</legend>
                        <p className="max-w-[52ch] text-sm text-dim">
                            Find your school and draw a box around it. Whatever you frame is the
                            area we search for plate readers, and the map your page renders.
                        </p>

                        <MapPicker
                            onChange={(bounds) => {
                                setBox(bounds);
                                form.setData(
                                    'bbox',
                                    bounds
                                        ? `${bounds.south.toFixed(5)},${bounds.west.toFixed(5)},${bounds.north.toFixed(5)},${bounds.east.toFixed(5)}`
                                        : '',
                                );
                            }}
                        />

                        {box && (
                            <p className="annot">
                                {area.toFixed(1)} square miles
                                {!areaOk && (
                                    <span className="text-signal">
                                        {' '}— {area > limits.maxAreaSqMiles ? 'too large, zoom in' : 'too small, draw wider'}
                                    </span>
                                )}
                            </p>
                        )}
                        {errors?.bbox && <p className="font-data text-sm text-signal">{errors.bbox}</p>}
                    </fieldset>

                    <div className="flex flex-wrap items-center gap-5">
                        <button type="submit" className="btn btn-primary" disabled={form.processing || !areaOk}>
                            {form.processing ? 'Building' : 'Build the chapter'}
                        </button>
                        <p className="annot">
                            {form.processing
                                ? 'Querying OpenStreetMap, this takes a few seconds'
                                : 'Three map queries. Nothing is sent to anyone.'}
                        </p>
                    </div>
                </form>
            </section>
        </Shell>
    );
}
