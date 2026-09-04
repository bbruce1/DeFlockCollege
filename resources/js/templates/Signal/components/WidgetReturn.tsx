import type { Section } from '../../contract';
import { toContacts, type Contact } from '../geometry';
import { numberFrom, readersFrom } from '../sectionData';
import BearingRose from './BearingRose';
import ContactLog from './ContactLog';
import MeterBar from './MeterBar';
import RadarScope from './RadarScope';

interface Props {
    section: Section;
    contacts: Contact[];
    coverage: number;
    stateName: string;
    schoolName: string;
    aspect: number;
}

/**
 * Widget sections dispatch on their id. An id this template has not been taught
 * still renders its headline and body, so a new section added on the server
 * degrades to prose instead of vanishing.
 */
export default function WidgetReturn({ section, contacts, coverage, stateName, schoolName, aspect }: Props) {
    const data = section.data;

    if (section.id === 'coverage-dial') {
        const value = data && 'coverage' in data ? numberFrom(data, 'coverage', coverage) : coverage;
        const headings = contacts.map((contact) => contact.heading);
        const litSectors = Math.round(value * 24);

        return (
            <div className="sig-split">
                <BearingRose coverage={value} headings={headings} />
                <div>
                    <p className="sig-mono">
                        {litSectors} of 24 sectors · {contacts.filter((contact) => contact.heading >= 0).length} readers
                        with a recorded heading
                    </p>
                    <p className="sig-copy" style={{ marginTop: '0.75rem' }}>
                        Sectors are 15° wide. One is lit when at least one camera is pointed into it, which is a
                        question a dot on a map cannot answer.
                    </p>
                </div>
            </div>
        );
    }

    if (section.id === 'scale-bar') {
        const here = numberFrom(data, 'here');
        const state = numberFrom(data, 'state');

        return (
            <div>
                <MeterBar label="This scope" value={here} of={Math.max(state, here, 1)} />
                <MeterBar label={stateName} value={state} of={Math.max(state, here, 1)} tone="signal" />
                <p className="sig-mono">
                    This campus is {state > 0 ? ((here / state) * 100).toFixed(1) : '0'}% of the state total
                </p>
            </div>
        );
    }

    if (section.id === 'reader-map') {
        const plotted = readersFrom(data);
        const plottedContacts = plotted.length > 0 ? toContacts(plotted, numberFrom(data, 'aspect', aspect)) : contacts;

        return (
            <div className="sig-split">
                <RadarScope contacts={plottedContacts} schoolName={schoolName} />
                <ContactLog contacts={plottedContacts} />
            </div>
        );
    }

    if (section.id === 'vendor-split') {
        const flock = numberFrom(data, 'flock');
        const other = numberFrom(data, 'other');
        const total = Math.max(flock + other, 1);

        return (
            <div>
                <MeterBar label="Flock Safety" value={flock} of={total} tone="signal" />
                <MeterBar label="Every other vendor" value={other} of={total} />
                <p className="sig-mono">
                    {((flock / total) * 100).toFixed(0)}% of returns answer to one company · one contract to decline
                </p>
            </div>
        );
    }

    if (section.id === 'delta') {
        const from = numberFrom(data, 'from');
        const to = numberFrom(data, 'to');
        const ceiling = Math.max(from, to, 1);

        return (
            <div>
                <MeterBar label="Previous sweep" value={from} of={ceiling} />
                <MeterBar label="This sweep" value={to} of={ceiling} tone={to > from ? 'signal' : 'accent'} />
                <p className="sig-mono">
                    Net change {to - from > 0 ? '+' : ''}
                    {to - from}
                </p>
            </div>
        );
    }

    return null;
}
