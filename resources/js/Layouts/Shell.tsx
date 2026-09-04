import { Link } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';

/**
 * The network's chrome: home, create and edit share it.
 *
 * Chapter pages deliberately do NOT use this. Each is themed entirely by its
 * assigned template, because a page that looks like every other chapter is the
 * thing this project replaced.
 */
export default function Shell({ children, aside }: PropsWithChildren<{ aside?: ReactNode }>) {
    return (
        <div className="min-h-screen bg-void">
            <div className="scanlines" aria-hidden="true" />

            <header className="sticky top-0 z-40 border-b border-hair bg-void/80 backdrop-blur">
                <div className="shell flex h-14 items-center justify-between gap-6">
                    <Link href="/" className="font-data text-[13px] font-600 tracking-[0.1em] no-underline">
                        <span className="text-net">DE</span>
                        <span className="text-glow">FLOCK</span>
                        <span className="text-faint"> / CAMPUS</span>
                    </Link>
                    {aside}
                </div>
            </header>

            <main className="relative z-10">{children}</main>

            <footer className="mt-24 border-t border-hair">
                <div className="shell grid gap-3 py-10">
                    <p className="annot">DeFlock Campus</p>
                    <p className="max-w-[70ch] text-sm text-faint">
                        Chapters are run by students. They are not affiliated with, endorsed by,
                        or sponsored by the schools they are named for. Reader and map data{' '}
                        <a
                            href="https://www.openstreetmap.org/copyright"
                            target="_blank"
                            rel="noopener"
                            className="text-dim underline decoration-hair-lit underline-offset-2 hover:text-glow"
                        >
                            © OpenStreetMap contributors
                        </a>
                        .
                    </p>
                </div>
            </footer>
        </div>
    );
}
