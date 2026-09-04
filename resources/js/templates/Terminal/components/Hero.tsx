import { FIXED } from '../../contract';
import Cursor from './Cursor';

interface Props {
    /** Where "Help push back" sends the reader. */
    ctaHref: string;
}

/**
 * The fixed hero, word for word.
 *
 * A terminal shouts by inverting a run of text, so the accent word is set as a
 * selected block rather than as a colour change. The wording is identical on
 * every chapter in the network and is not the template's to alter.
 */
export default function Hero({ ctaHref }: Props) {
    return (
        <section className="tt__hero">
            <h1>
                <span className="tt__hero-line">{FIXED.heroHeadline}</span>
                <span className="tt__hero-line">
                    <span className="tt__inv">{FIXED.heroAccent}</span>
                    <Cursor />
                </span>
            </h1>
            <a className="tt__cta" href={ctaHref}>
                <span aria-hidden="true">&gt;</span>
                {FIXED.heroCta}
            </a>
        </section>
    );
}
