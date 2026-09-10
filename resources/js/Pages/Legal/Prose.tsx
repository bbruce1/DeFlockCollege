import type { PropsWithChildren } from 'react';

/** The shared measure and rhythm for the three written pages. */
export default function Prose({
    title,
    standfirst,
    updated,
    children,
}: PropsWithChildren<{ title: string; standfirst?: string; updated?: string }>) {
    return (
        <article className="shell max-w-[68ch] py-20">
            <h1 className="text-[clamp(2rem,6vw,3.25rem)] uppercase leading-[1.05]">{title}</h1>

            {standfirst ? (
                <p className="mt-6 text-lg leading-relaxed text-dim">{standfirst}</p>
            ) : null}

            {updated ? <p className="annot mt-6 text-faint">Last updated {updated}</p> : null}

            <div className="mt-12 grid gap-10">{children}</div>
        </article>
    );
}

export function Section({ heading, children }: PropsWithChildren<{ heading: string }>) {
    return (
        <section className="grid gap-3">
            <h2 className="text-xl font-semibold text-glow">{heading}</h2>
            <div className="grid gap-3 leading-relaxed text-dim">{children}</div>
        </section>
    );
}
