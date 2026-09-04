import { FIXED } from '../../contract';

/**
 * U1, the part everything else routes to.
 *
 * The wording is fixed network-wide and is not this template's to change; what
 * the board does with it is make it the main IC, notch and all. The counts sit
 * on the package the way a real chip carries its markings.
 */
interface Props {
    schoolName: string;
    partNumber: string;
    readersWithinMile: number;
    ctaHref: string;
}

export default function HeroChip({ schoolName, partNumber, readersWithinMile, ctaHref }: Props) {
    return (
        <section className="ckt-part">
            <div className="ckt-part-head">
                <span className="ckt-desig">U1</span>
                <span className="ckt-silk">Main package</span>
            </div>

            <div className="ckt-hero">
                <span className="ckt-notch" aria-hidden="true" />

                <p className="ckt-silk" style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                    {partNumber} &middot; {schoolName}
                </p>

                <h1 className="ckt-h ckt-h-hero">
                    {FIXED.heroHeadline}{' '}
                    <em className="ckt-em">{FIXED.heroAccent}</em>
                </h1>

                <a className="ckt-cta" href={ctaHref}>
                    {FIXED.heroCta}
                </a>

                <dl className="ckt-readout">
                    <div>
                        <dt>Units within one mile</dt>
                        <dd className="ckt-signal">{readersWithinMile.toLocaleString('en-US')}</dd>
                    </div>
                </dl>
            </div>
        </section>
    );
}
