import { splitEmphasis } from '../../contract';

/**
 * Headlines carry a single <em>. It is split rather than injected, so the string
 * reaches the DOM as text and the emphasis becomes the template's accent.
 */
export default function Headline({ text, className = 'sig-headline' }: { text: string; className?: string }) {
    const { before, accent, after } = splitEmphasis(text);

    return (
        <h2 className={className}>
            {before}
            {accent !== '' && <span className="sig-accent">{accent}</span>}
            {after}
        </h2>
    );
}
