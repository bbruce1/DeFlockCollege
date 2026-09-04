import type { Chapter, Reader, Section } from '../../contract';
import { designatorFor } from '../board';
import BoardMap from './BoardMap';
import ComponentOutline from './ComponentOutline';
import CoverageRing from './CoverageRing';
import DeltaTestPoints from './DeltaTestPoints';
import LedBar from './LedBar';
import SilkHeadline from './SilkHeadline';
import VendorPins from './VendorPins';

/**
 * Turns one composed section into one part on the board.
 *
 * The server chooses which sections exist and in what order; this only decides
 * what package each becomes. Widgets are ICs, prose is passives, and a widget
 * whose data did not survive the trip renders its headline rather than an empty
 * frame — nothing on the page is allowed to depend on a value arriving.
 */

interface Props {
    section: Section;
    index: number;
    chapter: Chapter;
    coverage: number;
    stateName: string;
}

function readNumber(data: Record<string, unknown> | undefined, key: string): number | null {
    const value = data?.[key];

    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readReaders(data: Record<string, unknown> | undefined): Reader[] | null {
    const value = data?.readers;

    return Array.isArray(value) ? (value as Reader[]) : null;
}

function instrumentFor(props: Props) {
    const { section, chapter, coverage, stateName } = props;
    const data = section.data;

    if (section.id === 'coverage-dial') {
        const bearings = chapter.map.readers.map((reader) => reader[2]);
        const value = readNumber(data, 'coverage');

        return <CoverageRing coverage={value ?? coverage} bearings={bearings} />;
    }

    if (section.id === 'scale-bar') {
        const here = readNumber(data, 'here') ?? chapter.map.readersWithinMile;
        const state = readNumber(data, 'state') ?? chapter.map.readersInState;

        return <LedBar here={here} state={state} stateName={stateName} />;
    }

    if (section.id === 'reader-map') {
        const readers = readReaders(data) ?? chapter.map.readers;
        const aspect = readNumber(data, 'aspect') ?? chapter.map.aspect;

        if (readers.length === 0) {
            return null;
        }

        return <BoardMap readers={readers} streets={chapter.map.streets} aspect={aspect} />;
    }

    if (section.id === 'vendor-split') {
        const flock = readNumber(data, 'flock') ?? chapter.map.flockCount;
        const other = readNumber(data, 'other') ?? Math.max(chapter.map.readersWithinMile - flock, 0);

        return <VendorPins flock={flock} other={other} />;
    }

    if (section.id === 'delta') {
        const from = readNumber(data, 'from');
        const to = readNumber(data, 'to');

        if (from === null || to === null) {
            return null;
        }

        return <DeltaTestPoints from={from} to={to} />;
    }

    return null;
}

export default function SectionSlot(props: Props) {
    const { section, index } = props;
    const designator = designatorFor(section.kind, index);

    if (section.kind === 'widget') {
        const instrument = instrumentFor(props);

        return (
            <ComponentOutline designator={designator} label={section.label} id={section.id}>
                <div className="ckt-grid">
                    <div>
                        <SilkHeadline text={section.headline} />
                        <p className="ckt-body">{section.body}</p>
                    </div>
                    {instrument}
                </div>
            </ComponentOutline>
        );
    }

    const banner = section.treatment === 'banner';
    const split = section.treatment === 'split';

    return (
        <ComponentOutline designator={designator} label={section.label} id={section.id}>
            <div
                className={split ? 'ckt-grid' : undefined}
                style={section.treatment === 'centered' ? { textAlign: 'center' } : undefined}
            >
                <SilkHeadline
                    text={section.headline}
                    className={banner ? 'ckt-h ckt-h-banner' : 'ckt-h ckt-h-part'}
                />
                <p
                    className="ckt-body"
                    style={section.treatment === 'centered' ? { marginInline: 'auto' } : undefined}
                >
                    {section.body}
                </p>
            </div>
        </ComponentOutline>
    );
}
