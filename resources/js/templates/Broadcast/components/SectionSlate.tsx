import type { ReactNode } from 'react';
import { splitEmphasis } from '../../contract';
import type { Section } from '../../contract';

/**
 * One section, dressed as a slate: source tag, headline, copy, and — for a
 * widget — the instrument in its monitor frame beneath.
 *
 * Prose treatments handed down by the server change the shape of the slate
 * rather than only its colour, so a page whose seed picked three "split"
 * sections still reads as a sequence rather than a list.
 */
interface Props {
    section: Section;
    index: number;
    children?: ReactNode;
}

function pad(value: number): string {
    return value.toString().padStart(2, '0');
}

export default function SectionSlate({ section, index, children }: Props) {
    const { before, accent, after } = splitEmphasis(section.headline);
    const isBanner = section.treatment === 'banner';
    const isCentered = section.treatment === 'centered';
    const isSplitProse = section.kind === 'prose' && section.treatment === 'split';

    const classes = ['bcast-slate'];

    if (isBanner) {
        classes.push('bcast-slate--banner');
    }

    if (isCentered) {
        classes.push('bcast-slate--centered');
    }

    const heading = (
        <h2 className="bcast-h2 bcast-aberrate" id={`h-${section.id}`}>
            {before}
            {accent ? <span className="bcast-accent">{accent}</span> : null}
            {after}
        </h2>
    );

    const body = <p className="bcast-body">{section.body}</p>;

    return (
        <section className={classes.join(' ')} id={`slate-${section.id}`} aria-labelledby={`h-${section.id}`}>
            <div className="bcast-rail">
                <div className="bcast-slate-head">
                    <span className="bcast-tag">{section.label}</span>
                    <span className="bcast-mono">
                        SRC {pad(index)} &middot; {section.kind === 'widget' ? 'LIVE FEED' : 'CAPTION'}
                    </span>
                </div>

                {isSplitProse ? (
                    <div className="bcast-cols">
                        <div>{heading}</div>
                        <div>{body}</div>
                    </div>
                ) : (
                    <>
                        {heading}
                        {body}
                    </>
                )}

                {children}
            </div>
        </section>
    );
}
