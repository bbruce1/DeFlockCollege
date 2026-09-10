import type { Chapter } from '@/templates/contract';
import { FIXED } from '@/templates/contract';
import Section from '@/Chapter/Section';
import { ActionLink } from '@/Chapter/Button';

/**
 * The Instagram mark, drawn rather than fetched.
 *
 * A remote icon would be a third party watching every reader of every chapter
 * page, which is a strange thing to hand a surveillance project.
 */
function InstagramMark() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
        >
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
            <circle cx="12" cy="12" r="4.4" />
            <circle cx="17.6" cy="6.4" r="1.25" fill="currentColor" stroke="none" />
        </svg>
    );
}


/**
 * Second on every chapter, always.
 *
 * An account is a condition of starting a chapter, so this section asks the
 * reader to follow one rather than asking the creator to make one. The handle
 * is the loudest thing in it, because the handle is the thing to act on.
 *
 * The outbound link carries its own disclaimer: the account is run by students
 * and moderated by nobody here.
 */
export default function Instagram({ chapter }: { chapter: Chapter }) {
    return (
        <Section id="instagram">
            <h2
                style={{
                    fontFamily: 'var(--display)',
                    fontSize: 'clamp(1.6rem, 4.6vw, 2.4rem)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    margin: '0 0 1rem',
                }}
            >
                {FIXED.instagram.headline}
            </h2>

            <p style={{ margin: 0, maxWidth: '44rem', color: 'var(--ink-soft)', fontSize: '1.02rem', lineHeight: 1.65 }}>
                {FIXED.instagram.body}
            </p>

            {chapter.instagram ? (
                <>
                    <span style={{ display: 'block', marginTop: '1.6rem' }}>
                        <ActionLink
                            href={`https://instagram.com/${chapter.instagram}`}
                            external
                            large
                        >
                            <InstagramMark />
                            @{chapter.instagram}
                        </ActionLink>
                    </span>
                    <p style={{ marginTop: '0.9rem', fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                        This link leaves the site. The account is run by students at this
                        campus. It is not operated or moderated by DeFlock, and it is not
                        affiliated with the school.
                    </p>
                </>
            ) : (
                <p
                    style={{
                        marginTop: '1.5rem',
                        padding: '1.1rem 1.2rem',
                        background: 'var(--surface)',
                        border: '1px dashed var(--line)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--ink-soft)',
                        lineHeight: 1.6,
                    }}
                >
                    This chapter predates the requirement to attach an Instagram, so it has
                    none yet. Whoever started it can add one from the edit button in the
                    footer.
                </p>
            )}
        </Section>
    );
}
