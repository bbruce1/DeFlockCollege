import type { ReactNode } from 'react';
import type { Section } from '../../contract';
import { splitEmphasis } from '../../contract';
import CommandLine from './CommandLine';

interface Props {
    section: Section;
    host: string;
    /** The invocation printed above the block, chosen per section. */
    command: string;
    children?: ReactNode;
}

/**
 * One section, framed as a command and its output.
 *
 * Headlines carry a single <em>, which this template renders in amber. The text
 * is split rather than injected as markup: campus names reach this component
 * inside body copy, and none of it may ever be parsed as HTML.
 */
export default function SectionOutput({ section, host, command, children }: Props) {
    const { before, accent, after } = splitEmphasis(section.headline);

    return (
        <section className="tt__section" id={section.id} aria-labelledby={`${section.id}-h`}>
            <CommandLine command={command} host={host} cwd="~/campus" />
            <div className="tt__out">
                <p className="tt__label">{section.label}</p>
                <h2 className="tt__h" id={`${section.id}-h`}>
                    {before}
                    {accent ? <span className="tt__accent">{accent}</span> : null}
                    {after}
                </h2>
                <p className="tt__body">{section.body}</p>
                {children ? <div className="tt__widget">{children}</div> : null}
            </div>
        </section>
    );
}
