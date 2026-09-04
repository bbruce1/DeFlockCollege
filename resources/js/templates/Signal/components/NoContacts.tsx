const OSM_URL = 'https://www.openstreetmap.org/';

/**
 * Zero returns is a real state, and the honest version of it is a scope that says
 * so. Asserting a ring that is not in the data would discredit every chapter that
 * has one.
 */
export default function NoContacts({ shortName }: { shortName: string }) {
    return (
        <div className="sig-panel">
            <div className="sig-panel-head">
                <span className="sig-mono">Scope status</span>
                <span className="sig-mono sig-mono-lit">No returns</span>
            </div>
            <div className="sig-panel-body">
                <h2 className="sig-headline" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>
                    Nothing is <span className="sig-accent">mapped</span> here yet.
                </h2>
                <p className="sig-copy">
                    No plate reader has been recorded in OpenStreetMap inside the frame drawn around {shortName}. That is
                    a gap in the map, not a finding about the campus — this page will not claim a ring of cameras that
                    the data does not show.
                </p>
                <p className="sig-copy">
                    If you can see one from the pavement, adding it to OpenStreetMap fills this scope and DeFlock&rsquo;s
                    map at the same time.
                </p>
                <p style={{ marginTop: '1.25rem' }}>
                    <a className="sig-link" href={OSM_URL} target="_blank" rel="noopener nofollow">
                        Map the readers around campus →
                    </a>
                </p>
            </div>
        </div>
    );
}
