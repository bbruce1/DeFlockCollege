import Section from '@/Chapter/Section';
import { ActionLink } from '@/Chapter/Button';

/**
 * Only rendered when a creator has attached one.
 *
 * Petitions are hosted elsewhere on purpose: signatures are personal data, and
 * this project holds none. The link is theirs, and it is labelled as such.
 */
export default function Petition({ url }: { url: string }) {
    let host = 'another site';
    let linkable = false;

    try {
        const parsed = new URL(url);

        /*
         * The creator typed this, and this component is what writes it into an
         * href. The save path already allowlists https, but a scheme checked
         * only on the way in is unchecked at the point it becomes a link, and
         * `javascript:` in an anchor is the whole attack. A petition that
         * cannot be linked gets no section, which is what an absent one gets.
         */
        linkable = parsed.protocol === 'https:';
        host = parsed.hostname.replace(/^www\./, '');
    } catch {
        // A malformed link is not linkable either, which the flag already says.
    }

    if (!linkable) {
        return null;
    }

    return (
        <Section id="petition">
            <h2
                style={{
                    fontFamily: 'var(--display)',
                    fontSize: 'clamp(1.6rem, 4.6vw, 2.4rem)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    margin: '0 0 1rem',
                }}
            >
                Petition
            </h2>

            <p style={{ margin: 0, maxWidth: '44rem', color: 'var(--ink-soft)', fontSize: '1.02rem', lineHeight: 1.65 }}>
                Adding your name takes a few seconds and makes the count harder to dismiss.
            </p>

            <span style={{ display: 'block', marginTop: '1.5rem' }}>
                <ActionLink href={url} external large>
                    Sign
                </ActionLink>
            </span>

            <p style={{ marginTop: '0.9rem', fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                Hosted on {host} by this chapter, not by DeFlock. Signing happens there
                under their terms, and nothing about it comes back to this page.
            </p>
        </Section>
    );
}
