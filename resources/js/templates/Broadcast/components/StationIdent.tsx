import { useEffect, useState } from 'react';

/**
 * The two pieces of furniture burned into the corners of the picture: the
 * station bug, and the timecode.
 *
 * The timecode starts at a value derived from the chapter's slug, so it is a
 * real string in the DOM before any script runs and is identical on every load
 * of the same chapter. Ticking it is decoration and stops flat under reduced
 * motion. The date beside it is the real one the map was generated on.
 */
const FRAME_RATE = 25;
const TICK_MS = 200;
const FRAMES_PER_TICK = 5;
/** A day of frames, so the seeded start never rolls past the hour field oddly. */
const FRAME_WRAP = FRAME_RATE * 60 * 60 * 24;

interface Props {
    shortName: string;
    slug: string;
    generatedAt: string;
    readerCount: number;
}

function seedFrom(text: string): number {
    let hash = 2166136261;

    for (let index = 0; index < text.length; index++) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return Math.abs(hash) % FRAME_WRAP;
}

function pad(value: number): string {
    return value.toString().padStart(2, '0');
}

function timecode(frames: number): string {
    const whole = Math.floor(frames) % FRAME_WRAP;
    const seconds = Math.floor(whole / FRAME_RATE);

    return [
        pad(Math.floor(seconds / 3600) % 24),
        pad(Math.floor(seconds / 60) % 60),
        pad(seconds % 60),
        pad(whole % FRAME_RATE),
    ].join(':');
}

export default function StationIdent({ shortName, slug, generatedAt, readerCount }: Props) {
    const [frames, setFrames] = useState(() => seedFrom(slug));

    useEffect(() => {
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (motion.matches) {
            return;
        }

        const timer = window.setInterval(() => setFrames((value) => value + FRAMES_PER_TICK), TICK_MS);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <>
            <div className="bcast-ident">
                <span className="bcast-rec" aria-hidden="true" />
                <span>DFLK&middot;TV</span>
                <span aria-hidden="true">/</span>
                <span>{shortName}</span>
            </div>
            <div className="bcast-tc">
                <span>TC {timecode(frames)}</span>
                <span aria-hidden="true">/</span>
                <span>SRC OSM {generatedAt}</span>
                <span aria-hidden="true">/</span>
                <span>{readerCount} REC</span>
            </div>
        </>
    );
}
