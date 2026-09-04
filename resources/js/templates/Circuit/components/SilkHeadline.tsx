import { splitEmphasis } from '../../contract';

/**
 * A headline with its emphasis lifted into gold. The text arrives with at most
 * one <em>; it is split and rendered as three text nodes, never as markup.
 */
export default function SilkHeadline({ text, className = 'ckt-h ckt-h-part' }: { text: string; className?: string }) {
    const { before, accent, after } = splitEmphasis(text);

    return (
        <h2 className={className}>
            {before}
            {accent !== '' && <em className="ckt-em">{accent}</em>}
            {after}
        </h2>
    );
}
