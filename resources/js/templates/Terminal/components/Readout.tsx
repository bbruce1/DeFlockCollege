interface Row {
    key: string;
    value: string;
}

interface Props {
    rows: Row[];
}

/** Key/value output with dotted leaders, the way a status command prints. */
export default function Readout({ rows }: Props) {
    return (
        <ul className="tt__readout">
            {rows.map((row) => (
                <li key={row.key}>
                    <span className="tt__readout-k">{row.key}</span>
                    <span className="tt__readout-fill" aria-hidden="true" />
                    <span className="tt__readout-v">{row.value}</span>
                </li>
            ))}
        </ul>
    );
}
