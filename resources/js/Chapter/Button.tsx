import type { PropsWithChildren } from 'react';

type Variant = 'primary' | 'quiet';

interface Common {
    variant?: Variant;
    large?: boolean;
    className?: string;
}

/**
 * Every pressable thing on a chapter page.
 *
 * Renders an anchor when it goes somewhere and a button when it does something,
 * which is the difference that decides whether a keyboard treats it as a link
 * or a control. An external destination gets the rel attributes without callers
 * having to remember them.
 */
export function ActionLink({
    href,
    external = false,
    variant = 'primary',
    large = false,
    className = '',
    children,
}: PropsWithChildren<Common & { href: string; external?: boolean }>) {
    return (
        <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener nofollow' } : {})}
            className={classes(variant, large, className)}
        >
            {children}
        </a>
    );
}

export function ActionButton({
    onClick,
    variant = 'primary',
    large = false,
    className = '',
    children,
}: PropsWithChildren<Common & { onClick: () => void }>) {
    return (
        <button type="button" onClick={onClick} className={classes(variant, large, className)}>
            {children}
        </button>
    );
}

function classes(variant: Variant, large: boolean, extra: string): string {
    return ['cbtn', `cbtn--${variant}`, large ? 'cbtn--large' : '', extra]
        .filter(Boolean)
        .join(' ');
}

