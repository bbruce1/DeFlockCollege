import { FIXED } from '../../contract';
import type { Chapter } from '../../contract';
import ChannelText from './ChannelText';
import ColourBars from './ColourBars';
import { count } from './values';

/**
 * The interruption.
 *
 * The three fixed strings — "You are being", "flocked", "Help push back" — are
 * identical on every chapter in the network, because recognising the second
 * chapter you land on is the growth mechanism. Only the deck and the burn-in
 * figures below change, and on an unmapped campus the deck says so rather than
 * asserting a ring.
 */
interface Props {
    chapter: Chapter;
    coverage: number;
    stateName: string;
    ctaHref: string;
}

export default function Hero({ chapter, coverage, stateName, ctaHref }: Props) {
    const { map } = chapter;
    const isEmpty = chapter.status === 'empty';
    const withBearing = map.readers.filter((reader) => reader[2] >= 0).length;

    const figures = [
        {
            term: 'Readers within a mile',
            value: count(map.readersWithinMile),
        },
        {
            term: 'Horizon covered',
            value: withBearing > 0 ? `${Math.round(coverage * 100)}%` : 'NO DATA',
        },
        {
            term: 'Flock Safety units',
            value: count(map.flockCount),
        },
        {
            term: `Mapped in ${stateName}`,
            value: count(map.readersInState),
        },
    ];

    return (
        <header className="bcast-hero">
            <ColourBars height={12} />

            <p className="bcast-kicker" style={{ marginTop: '1.5rem' }}>
                <span aria-hidden="true">&#9679;</span>
                We are interrupting this broadcast
            </p>

            <h1 className="bcast-h1">
                <span className="bcast-h1-line">
                    <ChannelText text={FIXED.heroHeadline} />
                </span>
                <span className="bcast-h1-word">
                    <ChannelText text={FIXED.heroAccent} />
                </span>
            </h1>

            <p className="bcast-deck">
                {isEmpty
                    ? `Nothing is mapped around ${chapter.shortName} yet. That is a hole in the ` +
                      'public map, not proof of an empty street, and this channel will not report ' +
                      'a ring that the data does not show.'
                    : `${count(map.readersWithinMile)} automated licence plate readers are mapped within a ` +
                      `mile of ${chapter.shortName}. Each one photographs every car that passes and logs ` +
                      'its plate, the time, and the place. Nobody on this campus was asked.'}
            </p>

            <a className="bcast-cta" href={ctaHref}>
                <span aria-hidden="true">&#9654;</span>
                {FIXED.heroCta}
            </a>

            <dl className="bcast-strip">
                {figures.map((figure) => (
                    <div key={figure.term}>
                        <dt>{figure.term}</dt>
                        <dd>{figure.value}</dd>
                    </div>
                ))}
            </dl>
        </header>
    );
}
