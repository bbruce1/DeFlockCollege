/**
 * The board with nothing on it.
 *
 * A campus with no mapped readers gets footprints and no parts, said plainly. A
 * ring that has not been mapped is not a ring that is not there, and it is not a
 * ring that is: the honest thing is to show the empty pads and ask somebody to
 * go and populate them.
 */
const FOOTPRINTS = 12;

export default function UnpopulatedNotice({ shortName }: { shortName: string }) {
    return (
        <div>
            <h2 className="ckt-h ckt-h-part">
                This board is <em className="ckt-em">unpopulated</em>.
            </h2>

            <p className="ckt-body">
                No plate reader within a mile of {shortName} has been mapped yet. That is a
                gap in OpenStreetMap, not a finding about this campus: nothing here claims a
                ring of cameras that the data does not show. If you can see one from the
                pavement, adding it to OpenStreetMap populates this page and DeFlock&rsquo;s map
                at the same time.
            </p>

            <div
                aria-hidden="true"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(58px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1.5rem',
                }}
            >
                {Array.from({ length: FOOTPRINTS }, (_, index) => (
                    <span
                        key={index}
                        style={{
                            aspectRatio: '3 / 2',
                            border: '1px dashed var(--ckt-silk-soft)',
                            display: 'block',
                        }}
                    />
                ))}
            </div>

            <p className="ckt-silk" style={{ marginTop: '0.9rem' }}>
                Footprints with no parts fitted
            </p>
        </div>
    );
}
