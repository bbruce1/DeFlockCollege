/**
 * Decoration only. The sweep carries no value: every contact underneath it is
 * already painted at full opacity, so a dropped animation costs nothing but the
 * motion. Held still entirely under prefers-reduced-motion.
 */
export default function ScopeSweep({ radius }: { radius: number }) {
    return (
        <g className="sig-sweep" aria-hidden="true">
            <defs>
                <linearGradient id="sig-sweep-fade" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--t-accent)" stopOpacity="0" />
                    <stop offset="100%" stopColor="var(--t-accent)" stopOpacity="0.22" />
                </linearGradient>
            </defs>
            <path
                d={`M 200 200 L 200 ${200 - radius} A ${radius} ${radius} 0 0 1 ${200 + radius * 0.7071} ${200 - radius * 0.7071} Z`}
                fill="url(#sig-sweep-fade)"
            />
            <line x1="200" y1="200" x2="200" y2={200 - radius} stroke="var(--t-accent)" strokeWidth="1" opacity="0.55" />
        </g>
    );
}
