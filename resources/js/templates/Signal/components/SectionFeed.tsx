import type { Section } from '../../contract';
import type { Contact } from '../geometry';
import Headline from './Headline';
import WidgetReturn from './WidgetReturn';

interface Props {
    sections: Section[];
    contacts: Contact[];
    coverage: number;
    stateName: string;
    schoolName: string;
    aspect: number;
}

const TREATMENT_CLASS: Record<string, string> = {
    centered: 'sig-centred',
    banner: 'sig-banner',
};

/**
 * Sections arrive already chosen and ordered by the server. The feed numbers them
 * like log entries and lets the treatment decide the shape: prose splits, centres
 * or runs as a banner, widgets keep the full measure for their instrument.
 */
export default function SectionFeed({ sections, contacts, coverage, stateName, schoolName, aspect }: Props) {
    return (
        <>
            {sections.map((section, index) => {
                const isSplit = section.kind === 'prose' && section.treatment === 'split';
                const shell = TREATMENT_CLASS[section.treatment ?? ''] ?? '';

                const heading = (
                    <>
                        <div className="sig-section-index">
                            <span className="sig-mono sig-mono-lit">{String(index + 1).padStart(2, '0')}</span>
                            <span className="sig-mono">{section.label}</span>
                        </div>
                        <Headline text={section.headline} />
                    </>
                );

                return (
                    <section className={`sig-section ${shell}`} key={section.id} id={`sig-${section.id}`}>
                        <div className="sig-rail">
                            {isSplit ? (
                                <div className="sig-split">
                                    <div>{heading}</div>
                                    <p className="sig-copy" style={{ marginTop: 0 }}>
                                        {section.body}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {heading}
                                    <p className="sig-copy">{section.body}</p>
                                </>
                            )}

                            {section.kind === 'widget' && (
                                <div style={{ marginTop: '2rem' }}>
                                    <WidgetReturn
                                        section={section}
                                        contacts={contacts}
                                        coverage={coverage}
                                        stateName={stateName}
                                        schoolName={schoolName}
                                        aspect={aspect}
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                );
            })}
        </>
    );
}
