/**
 * The title block, printed where a real board prints its own: part number,
 * revision, fabrication date, layer count. Every field is a fact the page
 * already holds, so the ornament and the data are the same thing.
 */
interface Props {
    schoolName: string;
    state: string;
    partNumber: string;
    generatedAt: string;
    readersInState: number;
}

export default function TitleBlock({ schoolName, state, partNumber, generatedAt, readersInState }: Props) {
    const cells: Array<[string, string]> = [
        ['Assembly', schoolName],
        ['Part no.', partNumber],
        ['Fab region', state],
        ['Last fab', generatedAt || 'unrecorded'],
        ['Units in region', readersInState.toLocaleString('en-US')],
    ];

    return (
        <dl className="ckt-title-block">
            {cells.map(([term, value]) => (
                <div className="ckt-title-cell" key={term}>
                    <dt>{term}</dt>
                    <dd>{value}</dd>
                </div>
            ))}
        </dl>
    );
}
