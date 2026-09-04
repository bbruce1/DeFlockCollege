import CommandLine from './CommandLine';

interface Props {
    host: string;
    shortName: string;
}

/**
 * What the page says when nothing is mapped.
 *
 * A zero is a real result and gets printed as one. Asserting a ring of cameras
 * that is not in the data would be the single fastest way to lose the argument,
 * so the empty case invites mapping instead.
 */
export default function EmptyRecord({ host, shortName }: Props) {
    return (
        <section className="tt__section" aria-labelledby="tt-empty-h">
            <CommandLine command="grep -c 'surveillance:type=ALPR' frame.osm" host={host} cwd="~/campus" />
            <div className="tt__out">
                <p className="tt__label">Result</p>
                <h2 className="tt__h" id="tt-empty-h">
                    <span className="tt__accent">0</span> readers are mapped inside this frame.
                </h2>
                <p className="tt__body">
                    That is what the data says, and this page will not say more than the data does. It is not
                    proof there are none around {shortName}: OpenStreetMap coverage is volunteer work, so a
                    count is a floor and never a census.
                </p>
                <p className="tt__body">
                    If you can see one from a footpath, adding it to OpenStreetMap fills in this page and
                    DeFlock&apos;s at the same time, and this chapter starts counting from the next refresh.
                </p>
                <p className="tt__status">
                    <b>&gt;</b>{' '}
                    <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener nofollow">
                        openstreetmap.org
                    </a>{' '}
                    tag: man_made=surveillance + surveillance:type=ALPR
                </p>
            </div>
        </section>
    );
}
