import type { CSSProperties } from 'react';
import type { TemplateProps, TemplateTokens } from '../contract';
import Commitments from './components/Commitments';
import ContactLog from './components/ContactLog';
import HeroBanner from './components/HeroBanner';
import NoContacts from './components/NoContacts';
import RadarScope from './components/RadarScope';
import ReadoutStrip from './components/ReadoutStrip';
import SectionFeed from './components/SectionFeed';
import StatusBar from './components/StatusBar';
import { toContacts } from './geometry';
import { SIGNAL_CSS } from './styles';

/**
 * SIGNAL — a watch station.
 *
 * The conceit is that a chapter page is a scope with the campus at its origin.
 * It exists because this dataset has something almost no surveillance dataset
 * has: a compass heading on every reader. A dot map wastes that. Plotting each
 * camera as a contact at a bearing and a range, with a wedge showing which way it
 * looks, turns a count into a question the reader can answer for themselves —
 * which way can I leave without being recorded?
 *
 * Everything measured is text before it is graphics. The sweep is the only moving
 * part, it carries no value, and it does not run under prefers-reduced-motion.
 */

const TOKENS: TemplateTokens = {
    '--t-bg': '#02070c',
    '--t-surface': '#06141d',
    '--t-line': '#11404e',
    '--t-ink': '#d3efe7',
    '--t-ink-soft': '#6c9aa4',
    '--t-accent': '#2bf5c0',
    '--t-accent-ink': '#00160f',
    '--t-signal': '#ff5470',
    '--t-display': '"IBM Plex Mono", ui-monospace, monospace',
    '--t-body': '"Archivo Variable", "Archivo", system-ui, sans-serif',
    '--t-data': '"IBM Plex Mono", ui-monospace, monospace',
};

const ACT_ANCHOR = 'sig-standing-orders';

export default function Signal({ chapter, sections, coverage, stateName }: TemplateProps) {
    const { map } = chapter;
    const contacts = toContacts(map.readers, map.aspect);
    const hasContacts = chapter.status !== 'empty' && contacts.length > 0;

    return (
        <div className="sig" style={TOKENS as CSSProperties}>
            {/* Static, prefixed, and scoped to .sig, so no other template inherits it. */}
            <style dangerouslySetInnerHTML={{ __html: SIGNAL_CSS }} />

            <div className="sig-backdrop" aria-hidden="true" />
            <div className="sig-grain" aria-hidden="true" />

            <div className="sig-body">
                <StatusBar
                    schoolName={chapter.schoolName}
                    stateName={stateName}
                    bbox={map.bbox}
                    generatedAt={map.generatedAt}
                    holding={contacts.length}
                />

                <HeroBanner shortName={chapter.shortName} ctaHref={`#${ACT_ANCHOR}`} />

                <div className="sig-rail" style={{ paddingBottom: '3rem' }}>
                    {hasContacts ? (
                        <div className="sig-scope-wrap">
                            <div className="sig-scope-cell">
                                <RadarScope contacts={contacts} schoolName={chapter.schoolName} />
                            </div>
                            <div className="sig-scope-cell">
                                <ContactLog contacts={contacts} />
                            </div>
                        </div>
                    ) : (
                        <NoContacts shortName={chapter.shortName} />
                    )}

                    <ReadoutStrip map={map} coverage={coverage} stateName={stateName} />
                </div>

                <SectionFeed
                    sections={sections}
                    contacts={contacts}
                    coverage={coverage}
                    stateName={stateName}
                    schoolName={chapter.schoolName}
                    aspect={map.aspect}
                />

                <Commitments
                    id={ACT_ANCHOR}
                    shortName={chapter.shortName}
                    instagram={chapter.instagram}
                    tiktok={chapter.tiktok}
                />

                <footer className="sig-rail sig-foot">
                    <p className="sig-mono">
                        Reader and street data © OpenStreetMap contributors, ODbL. Counts are what volunteers have
                        mapped, which makes every figure here a floor rather than a census.
                    </p>
                </footer>
            </div>
        </div>
    );
}
