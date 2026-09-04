import { FIXED } from '../../contract';

interface Props {
    shortName: string;
    ctaHref: string;
}

/**
 * The wording is identical on every chapter in the network and may not change.
 * Only its treatment does: here it is a station callout, transmitted rather than
 * written.
 */
export default function HeroBanner({ shortName, ctaHref }: Props) {
    return (
        <section className="sig-rail sig-hero">
            <p className="sig-mono sig-mono-lit" style={{ marginBottom: '1.25rem' }}>
                Contact report // {shortName}
            </p>

            <h1>
                <span className="sig-hero-line">{FIXED.heroHeadline}</span>
                <br />
                <span className="sig-hero-accent">{FIXED.heroAccent}</span>
            </h1>

            <a className="sig-cta" href={ctaHref}>
                {FIXED.heroCta}
            </a>
        </section>
    );
}
