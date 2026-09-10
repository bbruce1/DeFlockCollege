import { Head, useForm, usePage } from '@inertiajs/react';

/**
 * Deliberately empty.
 *
 * One field and a button. No product name, no counts, no description of what
 * is behind it: a locked page that explains what it protects is an invitation.
 */
export default function Locked({ retryIn }: { retryIn: number }) {
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };
    const form = useForm({ passphrase: '' });
    const waiting = retryIn > 0;

    return (
        <>
            <Head title=" " />

            <main className="grid min-h-[100dvh] place-items-center bg-void px-6">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/admin');
                    }}
                    className="grid w-full max-w-sm gap-3"
                >
                    <input
                        type="password"
                        value={form.data.passphrase}
                        onChange={(e) => form.setData('passphrase', e.target.value)}
                        className="field w-full"
                        autoComplete="current-password"
                        autoFocus
                        aria-label="Passphrase"
                    />

                    <button
                        type="submit"
                        className="btn btn-primary justify-center"
                        disabled={form.processing || waiting}
                    >
                        {waiting ? `Wait ${retryIn}s` : 'Enter'}
                    </button>

                    {errors?.passphrase && (
                        <p className="font-data text-sm text-signal">{errors.passphrase}</p>
                    )}
                </form>
            </main>
        </>
    );
}
