import { routeTraces } from '../board';

/**
 * The routing between two components.
 *
 * These are the traces that mean something: they leave the part above and land
 * on the part below, so the page reads as one net rather than as stacked cards.
 * Strokes are non-scaling, which is what lets the bus stretch to any column
 * width without the copper getting fatter on wide screens.
 */

const VIEWBOX_HEIGHT = 92;
const TRACE_COUNT = 4;

export default function TraceBus({ seed }: { seed: number }) {
    const traces = routeTraces(seed, TRACE_COUNT, VIEWBOX_HEIGHT);

    return (
        <svg
            className="ckt-bus"
            viewBox={`0 0 1000 ${VIEWBOX_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            {traces.map((trace, index) => (
                <path
                    key={index}
                    d={trace.d}
                    fill="none"
                    stroke="var(--t-accent)"
                    strokeWidth={trace.weight}
                    strokeLinecap="square"
                    strokeLinejoin="round"
                    opacity="0.78"
                    vectorEffect="non-scaling-stroke"
                />
            ))}
            {traces.map((trace, index) => (
                <g key={`via-${index}`}>
                    <circle cx={trace.viaX} cy={trace.viaY} r="7" fill="var(--t-accent)" />
                    <circle cx={trace.viaX} cy={trace.viaY} r="3" fill="var(--ckt-hole)" />
                </g>
            ))}
        </svg>
    );
}
