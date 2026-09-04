import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Motion here is decoration only, so this hook is only ever allowed to remove
 * something duplicated for a scroll effect. It must never gate a value: the
 * first render already carries every figure the page states.
 */
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const media = window.matchMedia(QUERY);
        const sync = () => setReduced(media.matches);

        sync();
        media.addEventListener('change', sync);

        return () => media.removeEventListener('change', sync);
    }, []);

    return reduced;
}
