import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import type { Chapter, Official } from '@/templates/contract';

interface Props {
    chapter: Chapter;
    ticket: string;
    pass: string;
    minutesRemaining: number;
    roles: { value: string; label: string }[];
    stateName: string;
}

interface OfficialRow {
    name: string;
    title: string;
    email: string;
    url: string;
    role: string;
}

const EMPTY_OFFICIAL: OfficialRow = { name: '', title: '', email: '', url: '', role: 'city-council' };

/**
 * A stored office as a form row.
 *
 * A chapter records a missing address as null — members of Congress publish a
 * contact form instead of an email — and an input's `value` must never be null,
 * or React hands the field back to the browser as an uncontrolled one and the
 * edit silently stops tracking what is typed into it.
 */
function asRow(official: Official): OfficialRow {
    return {
        name: official.name ?? '',
        title: official.title ?? '',
        email: official.email ?? '',
        url: official.url ?? '',
        role: official.role ?? EMPTY_OFFICIAL.role,
    };
}

/**
 * Editing a chapter.
 *
 * Reached either from the footer button with the edit key, or from a link sent
 * to the school address that created it. Whichever proof got here rides along
 * with the save, so the server never has to guess.
 */
export default function Edit({ chapter, ticket, pass, minutesRemaining, roles }: Props) {
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };

    const form = useForm({
        ticket,
        pass,
        instagram: chapter.instagram ?? '',
        petitionUrl: chapter.petitionUrl ?? '',
        officials: chapter.officials.length
            ? chapter.officials.map(asRow)
            : [{ ...EMPTY_OFFICIAL }],
    });

    const handle = form.data.instagram
        .trim()
        .replace(/^@/, '')
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/\/.*$/, '');

    function setOfficial(index: number, field: keyof OfficialRow, value: string) {
        form.setData(
            'officials',
            form.data.officials.map((official, i) =>
                i === index ? { ...official, [field]: value } : official,
            ),
        );
    }

    function removeOfficial(index: number) {
        form.setData(
            'officials',
            form.data.officials.filter((_, i) => i !== index),
        );
    }

    return (
        <Shell>
            <Head title={`Edit ${chapter.shortName}`} />

            <div className="mx-auto max-w-2xl px-6 py-16">
                <p className="annot text-net">
                    {chapter.shortName} · session ends in {minutesRemaining} minutes
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight">Edit your chapter</h1>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch(`/${chapter.slug}`);
                    }}
                    className="mt-10 grid gap-8"
                >
                    <section className="grid gap-4">
                        <h2 className="text-xl font-bold">Who people should write to</h2>
                        <p className="text-sm text-dim">
                            The letter on your page is addressed to whoever you list here. Say what
                            each person is. A sheriff and a councilmember are not the same ask, and
                            a reader deciding who to contact needs to know which is which.
                        </p>

                        {form.data.officials.map((official, index) => (
                            <div key={index} className="grid gap-3 border border-hair bg-panel p-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="grid gap-1">
                                        <span className="annot">Role</span>
                                        <select
                                            value={official.role}
                                            onChange={(e) => setOfficial(index, 'role', e.target.value)}
                                            className="field"
                                        >
                                            {roles.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="grid gap-1">
                                        <span className="annot">Name</span>
                                        <input
                                            value={official.name}
                                            onChange={(e) => setOfficial(index, 'name', e.target.value)}
                                            className="field"
                                            placeholder="Jane Doe"
                                        />
                                    </label>
                                </div>

                                <label className="grid gap-1">
                                    <span className="annot">Title</span>
                                    <input
                                        value={official.title}
                                        onChange={(e) => setOfficial(index, 'title', e.target.value)}
                                        className="field"
                                        placeholder="Councilmember, District 3"
                                    />
                                </label>

                                <label className="grid gap-1">
                                    <span className="annot">Email</span>
                                    <input
                                        value={official.email}
                                        onChange={(e) => setOfficial(index, 'email', e.target.value)}
                                        className="field"
                                        placeholder="jane.doe@city.gov"
                                    />
                                </label>

                                {form.data.officials.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOfficial(index)}
                                        className="justify-self-start text-sm text-faint"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}

                        {form.data.officials.length < 6 && (
                            <button
                                type="button"
                                onClick={() =>
                                    form.setData('officials', [...form.data.officials, { ...EMPTY_OFFICIAL }])
                                }
                                className="btn btn-quiet justify-self-start"
                            >
                                Add someone
                            </button>
                        )}

                        {errors?.officials && (
                            <p className="font-data text-sm text-signal">{errors.officials}</p>
                        )}
                    </section>

                    <section className="grid gap-4 border-2 border-net/60 bg-net-wash p-5">
                        <div>
                            <p className="annot text-net">Required</p>
                            <h2 className="mt-2 text-xl font-bold">Your Instagram</h2>
                            <p className="mt-2 text-sm text-dim">
                                The only way anyone can reach this chapter.
                            </p>
                        </div>

                        <label className="grid gap-1">
                            <span className="annot">Handle, without the @</span>
                            <input
                                value={form.data.instagram}
                                onChange={(e) => form.setData('instagram', e.target.value)}
                                className="field"
                                placeholder={`deflock.${chapter.slug}`}
                            />
                            {errors?.instagram && (
                                <p className="font-data text-sm text-signal">{errors.instagram}</p>
                            )}
                        </label>

                        {handle ? (
                            <a
                                href={`https://instagram.com/${handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="justify-self-start text-sm text-net underline underline-offset-4"
                            >
                                Open instagram.com/{handle} to check it ↗
                            </a>
                        ) : null}
                    </section>

                    <section className="grid gap-4 border border-dashed border-hair p-5">
                        <div>
                            <p className="annot text-faint">Optional</p>
                            <h2 className="mt-2 text-lg font-bold text-dim">A petition</h2>
                            <p className="mt-2 text-sm text-faint">
                                Leave blank and the section does not appear on your page.
                            </p>
                        </div>

                        <label className="grid gap-1">
                            <span className="annot">Petition link</span>
                            <input
                                type="url"
                                value={form.data.petitionUrl}
                                onChange={(e) => form.setData('petitionUrl', e.target.value)}
                                className="field"
                                placeholder="https://www.change.org/p/..."
                            />
                            {errors?.petitionUrl && (
                                <p className="font-data text-sm text-signal">{errors.petitionUrl}</p>
                            )}
                        </label>
                    </section>

                    {errors?.key && <p className="font-data text-sm text-signal">{errors.key}</p>}

                    <div className="flex items-center gap-4">
                        <button type="submit" disabled={form.processing} className="btn btn-primary">
                            {form.processing ? 'Saving…' : 'Save changes'}
                        </button>
                        <Link href={`/${chapter.slug}`} className="text-sm text-dim">
                            Back to the chapter
                        </Link>
                    </div>
                </form>
            </div>
        </Shell>
    );
}
