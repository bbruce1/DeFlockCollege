/**
 * Handles are user-supplied, so a link is built from a whitelisted slice of the
 * string rather than by interpolating whatever was typed. Anything that does not
 * survive the filter gets no link at all, and the handle is still shown as text.
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
