import { Head, useForm, usePage } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import type { Chapter } from '@/templates/contract';

/**
 * Attaching the chapter's social accounts.
 *
 * Ownership was proved by opening a link sent to the address that created the
 * chapter, and the server checks that again before saving. There is no password
 * to lose because there was never one to set.
 */
interface Props {
    chapter: Chapter;
    ticket: string;
    minutesRemaining: number;
}

export default function Edit({ chapter, ticket, minutesRemaining }: Props) {
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };

    const form = useForm({
        ticket,
        instagram: chapter.instagram ?? '',
        tiktok: chapter.tiktok ?? '',
    });

    return (
        <Shell aside={<span className="annot">Link valid {minutesRemaining} more minutes</span>}>
            <Head title={`Edit ${chapter.shortName}`} />

            <section className="shell grid max-w-2xl gap-10 py-16">
                <header className="grid gap-4">
                    <p className="annot text-net">{chapter.schoolName}</p>
                    <h1 className="text-[clamp(2rem,6vw,3.25rem)] uppercase">
                        Attach your accounts.
                    </h1>
                    <p className="max-w-[52ch] text-dim">
                        Instagram and TikTok are this chapter's only channel. There is no messaging
                        on the site, deliberately, so the accounts are how anyone reaches you.
                    </p>
                </header>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.patch(`/${chapter.slug}`);
                    }}
                    className="grid gap-6"
                >
                    <div className="grid gap-2">
                        <label htmlFor="instagram" className="annot">Instagram</label>
                        <input
                            id="instagram"
                            className="field"
                            value={form.data.instagram}
                            onChange={(e) => form.setData('instagram', e.target.value)}
                            placeholder={`deflock.${chapter.slug}`}
                            maxLength={120}
                        />
                        {errors?.instagram && <p className="font-data text-sm text-signal">{errors.instagram}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="tiktok" className="annot">TikTok</label>
                        <input
                            id="tiktok"
                            className="field"
                            value={form.data.tiktok}
                            onChange={(e) => form.setData('tiktok', e.target.value)}
                            placeholder={`deflock.${chapter.slug}`}
                            maxLength={120}
                        />
                    </div>

                    <div className="border border-hair bg-panel p-5">
                        <p className="annot mb-2 text-net">Put this in the bio</p>
                        <p className="font-data text-sm text-dim">
                            Not affiliated with {chapter.shortName}. Run by students.
                        </p>
                        <p className="mt-3 text-sm text-faint">
                            Fifty characters, and it is the same thing your page says. Put the
                            chapter link beside it.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button type="submit" className="btn btn-primary" disabled={form.processing}>
                            {form.processing ? 'Saving' : 'Save'}
                        </button>
                        <a href={`/${chapter.slug}`} className="btn btn-quiet">Back to the chapter</a>
                    </div>
                </form>
            </section>
        </Shell>
    );
}
