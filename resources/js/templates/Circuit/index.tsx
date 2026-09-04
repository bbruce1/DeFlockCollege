import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import type { TemplateProps } from '../contract';
import { hashSeed, partNumber } from './board';
import { BOARD_CSS } from './styles';
import BoardFooter from './components/BoardFooter';
import BoardShell from './components/BoardShell';
import Commitments from './components/Commitments';
import ComponentOutline from './components/ComponentOutline';
import HeroChip from './components/HeroChip';
import SectionSlot from './components/SectionSlot';
import TitleBlock from './components/TitleBlock';
import TraceBus from './components/TraceBus';
import UnpopulatedNotice from './components/UnpopulatedNotice';

/**
 * CIRCUIT — the chapter as a printed board.
 *
 * The argument this page makes is that a ring of plate readers is not weather.
 * It is an assembly: parts somebody specified, on a layout somebody drew, wired
 * to a supplier somebody signed with. Drawing it as a board says that before any
 * sentence does, and it is the same shape as the campus itself — a network in a
 * plane with things wired onto it.
 *
 * Gold on solder mask, everything square, every section a package with a
 * designator, and copper routed between them so the page reads as one net.
 *
 * All contract tokens are declared on the root element and nothing here is
 * styled by anything outside this folder.
 */

const TOKENS: CSSProperties = {
    '--t-bg': '#04120b',
    '--t-surface': '#0d2c1d',
    '--t-line': '#1c4b34',
    '--t-ink': '#e8f3e6',
    '--t-ink-soft': '#8fb39d',
    '--t-accent': '#e8b33a',
    '--t-accent-ink': '#08140d',
    '--t-signal': '#ff5a4d',
    '--t-display': '"Archivo Variable", "Archivo", system-ui, sans-serif',
    '--t-body': '"Archivo Variable", "Archivo", system-ui, sans-serif',
    '--t-data': '"IBM Plex Mono", ui-monospace, monospace',
} as CSSProperties;

export default function Circuit({ chapter, sections, coverage, stateName }: TemplateProps) {
    const seed = hashSeed(chapter.slug);
    const part = partNumber(chapter.slug, chapter.map.readersWithinMile);
    const isEmpty = chapter.status === 'empty';

    return (
        <div className="ckt-root" style={TOKENS}>
            <style>{BOARD_CSS}</style>

            <BoardShell>
                <TitleBlock
                    schoolName={chapter.schoolName}
                    state={stateName}
                    partNumber={part}
                    generatedAt={chapter.map.generatedAt}
                    readersInState={chapter.map.readersInState}
                />

                <div className="ckt-stack">
                    <HeroChip
                        schoolName={chapter.schoolName}
                        partNumber={part}
                        readersWithinMile={chapter.map.readersWithinMile}
                        ctaHref="#push-back"
                    />

                    <TraceBus seed={seed} />

                    {isEmpty && (
                        <>
                            <ComponentOutline designator="U0" label="Nothing fitted yet">
                                <UnpopulatedNotice shortName={chapter.shortName} />
                            </ComponentOutline>
                            <TraceBus seed={seed ^ 0x1f1f} />
                        </>
                    )}

                    {sections.map((section, index) => (
                        <Fragment key={section.id}>
                            <SectionSlot
                                section={section}
                                index={index}
                                chapter={chapter}
                                coverage={coverage}
                                stateName={stateName}
                            />
                            <TraceBus seed={seed + index * 977} />
                        </Fragment>
                    ))}

                    <Commitments
                        instagram={chapter.instagram}
                        tiktok={chapter.tiktok}
                        schoolName={chapter.schoolName}
                        shortName={chapter.shortName}
                    />
                </div>

                <BoardFooter
                    partNumber={part}
                    generatedAt={chapter.map.generatedAt}
                    readersWithinMile={chapter.map.readersWithinMile}
                />
            </BoardShell>
        </div>
    );
}
