/**
 * One line of text with its colour channels pulled apart.
 *
 * The magenta and cyan copies are decoration: they are aria-hidden, unselectable
 * and sit BEHIND a solid layer carrying the real text at full opacity. Turning
 * every animation off leaves the line perfectly legible, which is the whole
 * point — this template glitches its chrome, never its content.
 */
interface Props {
    text: string;
    className?: string;
}

export default function ChannelText({ text, className }: Props) {
    return (
        <span className={className ? `bcast-split ${className}` : 'bcast-split'}>
            <span className="bcast-split-ghost bcast-split-ghost--mag" aria-hidden="true">
                {text}
            </span>
            <span className="bcast-split-ghost bcast-split-ghost--cyan" aria-hidden="true">
                {text}
            </span>
            <span className="bcast-split-real">{text}</span>
        </span>
    );
}
