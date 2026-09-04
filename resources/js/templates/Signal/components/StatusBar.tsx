interface Props {
    schoolName: string;
    stateName: string;
    bbox: string;
    generatedAt: string;
    holding: number;
}

/** The strip a watch officer reads first: who this station is, and when it last swept. */
export default function StatusBar({ schoolName, stateName, bbox, generatedAt, holding }: Props) {
    return (
        <header className="sig-rail">
            <div className="sig-status sig-mono">
                <span>
                    <span className="sig-led" aria-hidden="true" />
                    STATION {schoolName}
                </span>
                <span>THEATRE {stateName}</span>
                <span>HOLDING {holding}</span>
                <span>SWEEP {generatedAt || 'UNRECORDED'}</span>
                <span style={{ overflowWrap: 'anywhere' }}>BOX {bbox || 'UNSET'}</span>
            </div>
        </header>
    );
}
