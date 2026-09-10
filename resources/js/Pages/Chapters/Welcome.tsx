import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Shell from '@/Layouts/Shell';

interface Props {
    chapter: { slug: string; shortName: string; schoolName: string };
    editKey: string;
}

/**
 * Shown once, immediately after a chapter is created.
 *
 * The key is not recoverable from anything we hold — only its bcrypt hash is
 * stored — so this screen is deliberately hard to skip past. Both boxes are
 * required, and what they confirm is recorded on the chapter.
 */
export default function Welcome({ chapter, editKey }: Props) {
    const form = useForm({ savedKey: false, knowsEditButton: false });
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(editKey);
            setCopied(true);
        } catch {
            // Clipboard access is refused in some browsers; the key is on screen
            // to be copied by hand either way.
            setCopied(false);
        }
    }

    return (
        <Shell>
            <Head title={`${chapter.shortName} is live`} />

            <div className="mx-auto max-w-2xl px-6 py-16">
                <p className="annot text-net">Chapter created</p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight">
                    {chapter.shortName} is live.
                </h1>

                <div className="mt-10 border-2 border-signal bg-panel p-6">
                    <p className="annot text-signal">Your edit key — shown once</p>

                    <p className="mt-4 select-all break-all font-data text-2xl font-semibold tracking-[0.08em] text-glow">
                        {editKey}
                    </p>

                    <button
                        type="button"
                        onClick={copy}
                        className="btn btn-quiet mt-4"
                    >
                        {copied ? 'Copied' : 'Copy the key'}
                    </button>

                    <div className="mt-6 grid gap-3 border-t border-hair pt-5 text-sm text-dim">
                        <p>
                            <strong className="text-glow">Save this somewhere now.</strong>
                        </p>
                        <p>
                            If you lose it, the way back is re-verifying{' '}
                            <strong className="text-glow">the school email you created this with</strong>,
                            or contacting us. There is no reset link.
                        </p>
                    </div>
                </div>

                <p className="mt-8 border border-hair bg-panel p-6 text-dim">
                    Edit your chapter's page with the button at the{' '}
                    <strong className="text-glow">bottom left corner of the footer</strong>.
                </p>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(`/${chapter.slug}/acknowledge`);
                    }}
                    className="mt-8 grid gap-4"
                >
                    <label className="flex items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.savedKey}
                            onChange={(e) => form.setData('savedKey', e.target.checked)}
                            className="mt-1"
                        />
                        <span>I have saved my edit key.</span>
                    </label>
                    {form.errors.savedKey && (
                        <p className="font-data text-sm text-signal">{form.errors.savedKey}</p>
                    )}

                    <label className="flex items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.knowsEditButton}
                            onChange={(e) => form.setData('knowsEditButton', e.target.checked)}
                            className="mt-1"
                        />
                        <span>
                            I know I edit my page from the button at the bottom left of the footer.
                        </span>
                    </label>
                    {form.errors.knowsEditButton && (
                        <p className="font-data text-sm text-signal">{form.errors.knowsEditButton}</p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="btn btn-primary mt-2"
                    >
                        Go to my chapter
                    </button>
                </form>
            </div>
        </Shell>
    );
}
