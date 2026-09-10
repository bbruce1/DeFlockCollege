import Section from '@/Chapter/Section';

/**
 * The two statements that appear on every chapter, at full size.
 *
 * They are not fine print. A page that buries them has failed the one promise
 * that keeps this model defensible.
 */
export default function Commitment({
    id,
    headline,
    body,
    tone,
}: {
    id: string;
    headline: string;
    body: string;
    tone?: 'signal';
}) {
    return (
        <Section id={id}>
            <h2
                style={{
                    fontFamily: 'var(--display)',
                    fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
                    lineHeight: 1.08,
                    letterSpacing: '-0.02em',
                    margin: '0 0 1rem',
                    color: tone === 'signal' ? 'var(--signal)' : 'var(--ink)',
                    textWrap: 'balance',
                }}
            >
                {headline}
            </h2>

            <p style={{ margin: 0, maxWidth: '46rem', color: 'var(--ink-soft)', fontSize: '1.02rem', lineHeight: 1.65 }}>
                {body}
            </p>
        </Section>
    );
}
