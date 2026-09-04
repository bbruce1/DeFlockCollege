import { FIXED } from '../../contract';

interface Props {
    shortName: string;
    /** Anchor the call to action points at, so it works with scripting off. */
    actionId: string;
}

/**
 * The board above the desk. The wording is the network's, unchanged on every
 * chapter; only the setting is this template's — an instrument name over a last
 * price, which is the one arrangement a trading screen has for something that
 * matters.
 */
export default function HeroBoard({ shortName, actionId }: Props) {
    return (
        <header className="lg-hero">
            <p className="lg-hero-tag">
                {shortName} &middot; automated licence plate readers &middot; open position
            </p>

            <h1>
                <span className="lg-hero-first">{FIXED.heroHeadline}</span>
                <span className="lg-hero-word">{FIXED.heroAccent}</span>
                <span className="lg-caret" aria-hidden="true" />
            </h1>

            <div className="lg-hero-foot">
                <a className="lg-cta" href={`#${actionId}`}>
                    {FIXED.heroCta}
                </a>
                <p className="lg-hero-note">
                    Everything below is a row from public map data. Nothing on this page is an
                    estimate, and every figure can be checked against the same source.
                </p>
            </div>
        </header>
    );
}
