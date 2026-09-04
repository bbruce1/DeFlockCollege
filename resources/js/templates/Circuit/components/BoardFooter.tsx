/**
 * The strip a fab prints along the edge: what the board is, where the numbers
 * came from, and when they were taken. A count is a floor rather than a census,
 * and saying so belongs on the artefact rather than in a policy page.
 */
interface Props {
    partNumber: string;
    generatedAt: string;
    readersWithinMile: number;
}

export default function BoardFooter({ partNumber, generatedAt, readersWithinMile }: Props) {
    return (
        <footer className="ckt-footer">
            <span className="ckt-silk">{partNumber} &middot; REV A</span>
            <span className="ckt-silk">
                {readersWithinMile.toLocaleString('en-US')} units counted from OpenStreetMap
                {generatedAt ? ` on ${generatedAt}` : ''} &middot; a floor, never a census
            </span>
        </footer>
    );
}
