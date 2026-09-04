import type { ReactNode } from 'react';
import type { ChapterMap, Section, TemplateProps } from '../contract';
import AsciiMeter from './components/AsciiMeter';
import BootLog from './components/BootLog';
import CommandLine from './components/CommandLine';
import Commitments from './components/Commitments';
import DeltaDiff from './components/DeltaDiff';
import EmptyRecord from './components/EmptyRecord';
import Hero from './components/Hero';
import HorizonScope from './components/HorizonScope';
import Readout from './components/Readout';
import ReaderPlot from './components/ReaderPlot';
import SectionOutput from './components/SectionOutput';
import SignOff from './components/SignOff';
import StatusBar from './components/StatusBar';
import { aspectOf, count, figure, readerList } from './data';
import { TERMINAL_CSS, TERMINAL_STYLE } from './theme';

/**
 * Terminal: the chapter as a session someone has SSH'd into.
 *
 * The conceit is that a machine is reporting what it found, and a machine does
 * not editorialise: everything is command, output, and figures in columns. That
 * suits the one claim this project makes above every other, which is that each
 * number here came from public map data and can be checked by anyone who
 * disagrees with it.
 *
 * Nothing on this page is revealed by motion. The sweep line, the raster drift
 * and the cursor are glass effects over text that is already correct and already
 * on screen at first paint.
 */
export default function Terminal({ chapter, sections, coverage, stateName }: TemplateProps) {
    const host = chapter.slug || 'campus';
    const map = chapter.map;
    const isEmpty = chapter.status === 'empty';
    const bearings = map.readers.map((reader) => reader[2]);

    return (
        <div className="tt" style={TERMINAL_STYLE}>
            <style>{TERMINAL_CSS}</style>
            <div className="tt__glass" aria-hidden="true" />
            <div className="tt__sweep" aria-hidden="true" />

            <div className="tt__page">
                <StatusBar host={host} bbox={map.bbox} generatedAt={map.generatedAt} />

                <CommandLine command="whoami" host={host} />
                <Hero ctaHref="#act" />

                <CommandLine command="dmesg | tail -11" host={host} />
                <div className="tt__out">
                    <BootLog
                        map={map}
                        coverage={coverage}
                        stateName={stateName}
                        shortName={chapter.shortName}
                    />
                </div>

                <CommandLine command={`stat ${host}`} host={host} cwd="~/campus" />
                <div className="tt__out">
                    <Readout
                        rows={[
                            { key: 'subject', value: chapter.schoolName },
                            { key: 'state', value: stateName },
                            { key: 'readers in frame', value: count(map.readers.length) },
                            { key: 'readers within 1 mile', value: count(map.readersWithinMile) },
                            { key: `readers in ${stateName}`, value: count(map.readersInState) },
                            { key: 'flock safety units', value: count(map.flockCount) },
                            { key: 'horizon covered', value: `${Math.round(coverage * 100)}%` },
                        ]}
                    />
                </div>

                {isEmpty ? <EmptyRecord host={host} shortName={chapter.shortName} /> : null}

                {sections.map((section) => (
                    <SectionOutput
                        key={section.id}
                        section={section}
                        host={host}
                        command={commandFor(section)}
                    >
                        {widgetFor(section, map, bearings, coverage)}
                    </SectionOutput>
                ))}

                <Commitments chapter={chapter} host={host} />

                <CommandLine command="exit" host={host} cwd="~/campus" cursor />
                <SignOff map={map} schoolName={chapter.schoolName} />
            </div>
        </div>
    );
}

/** Each section is framed as the query that would have produced it. */
function commandFor(section: Section): string {
    switch (section.id) {
        case 'coverage-dial':
            return 'horizon --sectors=24 --outward';
        case 'reader-map':
            return 'plot readers.csv --bearing --streets';
        case 'scale-bar':
            return 'count alpr --scope=state';
        case 'vendor-split':
            return 'group-by vendor readers.csv';
        case 'delta':
            return 'diff previous.snapshot current.snapshot';
        default:
            return `cat notes/${section.id}.txt`;
    }
}

function widgetFor(
    section: Section,
    map: ChapterMap,
    bearings: number[],
    pageCoverage: number,
): ReactNode {
    if (section.kind !== 'widget') {
        return null;
    }

    const data = section.data;

    switch (section.id) {
        case 'coverage-dial': {
            const value = figure(data, 'coverage');

            return <HorizonScope coverage={value > 0 ? value : pageCoverage} bearings={bearings} />;
        }
        case 'reader-map': {
            const readers = readerList(data, 'readers');

            return readers.length > 0 ? (
                <ReaderPlot readers={readers} streets={map.streets} aspect={aspectOf(data, map.aspect)} />
            ) : null;
        }
        case 'scale-bar': {
            const here = figure(data, 'here');
            const state = figure(data, 'state');

            return (
                <div className="tt__meters">
                    <AsciiMeter name="within one mile of campus" value={here} total={state} note="mapped" />
                    <AsciiMeter name="statewide" value={state} total={state} note="mapped" tone="accent" />
                </div>
            );
        }
        case 'vendor-split': {
            const flock = figure(data, 'flock');
            const other = figure(data, 'other');
            const total = flock + other;

            return (
                <div className="tt__meters">
                    <AsciiMeter name="flock safety" value={flock} total={total} note="of the ring" />
                    <AsciiMeter name="every other vendor" value={other} total={total} note="of the ring" tone="accent" />
                </div>
            );
        }
        case 'delta': {
            return (
                <DeltaDiff
                    from={figure(data, 'from')}
                    to={figure(data, 'to')}
                    before={map.previous?.generatedAt ?? 'previous'}
                    after={map.generatedAt}
                />
            );
        }
        default:
            return null;
    }
}
