/**
 * This campus against the whole state.
 *
 * A ring of cameras around one campus is alarming and easy to dismiss as local.
 * Drawn against the state total it stops being a campus problem, which is the
 * step from "our school" to "the legislature". Both numbers are counted from
 * OpenStreetMap.
 */
interface Props {
    here: number;
    state: number;
    stateName: string;
}

export default function ScaleBar({ here, state, stateName }: Props) {
    const share = state > 0 ? here / state : 0;
    // A campus is a rounding error on a state, so give it a visible floor rather
    // than a sliver nobody can see.
    const width = Math.max(share * 100, 0.8);

    return (
        <div className="grid gap-3">
            <div className="flex items-baseline justify-between gap-5">
                <span className="annot">Within a mile of campus</span>
                <span className="font-display text-4xl font-bold tabular-nums tracking-tight text-signal">
                    {here.toLocaleString('en-US')}
                </span>
            </div>

            <div className="h-3 border border-rule bg-vellum-deep" role="img"
                 aria-label={`${here} readers here out of ${state} in ${stateName}.`}>
                <div className="h-full bg-signal" style={{ width: `${width}%` }} />
            </div>

            <div className="flex items-baseline justify-between gap-5">
                <span className="annot">In {stateName}</span>
                <span className="font-display text-4xl font-bold tabular-nums tracking-tight text-ink">
                    {state.toLocaleString('en-US')}
                </span>
            </div>
        </div>
    );
}
