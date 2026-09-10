import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Shell from '@/Layouts/Shell';

interface Props {
    chapter: { slug: string; shortName: string };
}

/** Where the footer's edit button lands. */
export default function Unlock({ chapter }: Props) {
    const page = usePage().props as unknown as {
        errors: Record<string, string>;
        flash?: { status?: string };
    };
    const { errors } = page;
    const form = useForm({ key: '' });
    const recover = useForm({ email: '' });
    const [forgot, setForgot] = useState(false);

    return (
        <Shell>
            <Head title={`Edit ${chapter.shortName}`} />

            <div className="mx-auto max-w-lg px-6 py-20">
                <p className="annot text-net">{chapter.shortName}</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight">Enter your edit key</h1>
                <p className="mt-3 text-dim">
                    The key you were shown when this chapter was created.
                </p>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(`/${chapter.slug}/unlock`);
                    }}
                    className="mt-8 grid gap-4"
                >
                    <input
                        value={form.data.key}
                        onChange={(e) => form.setData('key', e.target.value)}
                        className="field font-data text-lg tracking-[0.08em]"
                        placeholder="ABCDE-FGHJK-LMNPQ-RSTUV"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={60}
                        autoFocus
                    />

                    {errors?.key && <p className="font-data text-sm text-signal">{errors.key}</p>}

                    <button type="submit" disabled={form.processing} className="btn btn-primary">
                        {form.processing ? 'Checking…' : 'Unlock'}
                    </button>
                </form>

                {page.flash?.status && (
                    <p className="mt-8 border border-net bg-net-wash px-4 py-3 font-data text-sm text-net">
                        {page.flash.status}
                    </p>
                )}

                {forgot ? (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            recover.post(`/${chapter.slug}/recover-key`, {
                                onSuccess: () => recover.reset('email'),
                            });
                        }}
                        className="mt-8 grid gap-3 border border-hair bg-panel p-5"
                    >
                        <p className="annot text-net">Send me a new key</p>
                        <p className="text-sm text-dim">
                            Enter the school email this chapter was created with. A new key goes
                            to it, and the old one stops working. One an hour.
                        </p>
                        <input
                            type="email"
                            value={recover.data.email}
                            onChange={(e) => recover.setData('email', e.target.value)}
                            className="field"
                            placeholder="you@yourschool.edu"
                            autoComplete="email"
                        />
                        {recover.errors.email && (
                            <p className="font-data text-sm text-signal">{recover.errors.email}</p>
                        )}
                        <button
                            type="submit"
                            disabled={recover.processing}
                            className="btn btn-quiet justify-self-start"
                        >
                            {recover.processing ? 'Sending…' : 'Send a new key'}
                        </button>
                    </form>
                ) : (
                    <button
                        type="button"
                        onClick={() => setForgot(true)}
                        className="mt-8 text-sm text-dim underline underline-offset-4"
                    >
                        I forgot my key
                    </button>
                )}

                <Link href={`/${chapter.slug}`} className="mt-6 inline-block text-sm text-dim">
                    ← Back to the chapter
                </Link>
            </div>
        </Shell>
    );
}
