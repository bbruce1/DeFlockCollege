import { useEffect, useState } from 'react';

/**
 * Loads a template's artwork, or gives up quietly.
 *
 * A meme whose picture is missing still has to render: the ground colour stands
 * in, the line is still set, and the post is a finished thing rather than a
 * broken box. That matters because the art is added over time and every chapter
 * shares it — a template must never be unusable just because nobody has
 * photographed that one yet.
 */
export function usePhoto(src?: string): HTMLImageElement | null {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!src) {
            setImage(null);

            return;
        }

        let live = true;
        const loading = new Image();

        loading.onload = () => {
            if (live) {
                setImage(loading);
            }
        };

        loading.onerror = () => {
            // Absent art is the normal early state, not a fault worth shouting
            // about. The slide falls back and the page carries on.
            if (live) {
                setImage(null);
            }
        };

        loading.src = src;

        return () => {
            live = false;
        };
    }, [src]);

    return image;
}
