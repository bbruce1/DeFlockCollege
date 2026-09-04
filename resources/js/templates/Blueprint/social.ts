/**
 * Handles are user-supplied. A link is assembled from a whitelisted slice rather
 * than by interpolating the raw string, and anything that does not survive the
 * filter is shown as text with no link at all.
 */

const HANDLE_PATTERN = /[^A-Za-z0-9._]/g;

export function handleUrl(base: string, handle: string | null): string | null {
    if (!handle) {
        return null;
    }

    const cleaned = handle.trim().replace(/^@+/, '').replace(HANDLE_PATTERN, '');

    return cleaned === '' ? null : `${base}${encodeURIComponent(cleaned)}`;
}

export function displayHandle(handle: string): string {
    const trimmed = handle.trim();

    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

/** A drawing number, from the slug the chapter already has. */
export function drawingNumber(slug: string): string {
    const cleaned = slug.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').toUpperCase();

    return `DFC-${cleaned === '' ? 'UNSET' : cleaned.slice(0, 22)}-01`;
}
