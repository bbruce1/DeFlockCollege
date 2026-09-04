import { compassPoint, padBearing, polar, type Contact } from '../geometry';

interface Props {
    contact: Contact;
    centre: number;
    radius: number;
    active: boolean;
    onActivate: (index: number | null) => void;
}

const HEADING_REACH = 15;
const HEADING_SPREAD = 11;

/**
 * One return. The dot is where the camera is; the wedge is which way it looks.
 *
 * Both angles are real: the bearing comes from the reader's position relative to
 * the campus origin, the heading from the reader's own OpenStreetMap tag. A
 * reader with no recorded heading gets no wedge rather than a guessed one.
 */
export default function ScopeContact({ contact, centre, radius, active, onActivate }: Props) {
    const point = polar(centre, contact.bearing, radius * contact.range);
    const colour = contact.isFlock ? 'var(--t-signal)' : 'var(--t-accent)';

    const heading = contact.heading;

    // The wedge is drawn from the contact outward along its own recorded heading.
    // Offsetting a zero-centred polar keeps this readable as "from here, that way".
    const edge = (offset: number) => {
        const spoke = polar(0, heading + offset, HEADING_REACH);

        return `${point.x + spoke.x} ${point.y + spoke.y}`;
    };

    const wedge =
        heading >= 0
            ? `M ${point.x} ${point.y} L ${edge(-HEADING_SPREAD)} L ${edge(HEADING_SPREAD)} Z`
            : null;

    const label =
        `Contact ${contact.index + 1}. `
        + `${contact.isFlock ? 'Flock Safety unit' : 'Plate reader'}, `
        + `bearing ${padBearing(contact.bearing)} degrees ${compassPoint(contact.bearing)} from campus, `
        + `range ${contact.range.toFixed(2)} of frame, `
        + (heading >= 0 ? `facing ${padBearing(heading)} degrees.` : 'no recorded heading.');

    return (
        <g
            tabIndex={0}
            role="button"
            aria-label={label}
            style={{ cursor: 'crosshair' }}
            onMouseEnter={() => onActivate(contact.index)}
            onMouseLeave={() => onActivate(null)}
            onFocus={() => onActivate(contact.index)}
            onBlur={() => onActivate(null)}
        >
            <title>{label}</title>

            {wedge !== null && <path d={wedge} fill={colour} opacity={active ? 0.65 : 0.32} />}

            <circle cx={point.x} cy={point.y} r={active ? 9 : 6} fill={colour} opacity={active ? 0.3 : 0.16} />
            <circle cx={point.x} cy={point.y} r={active ? 3.4 : 2.4} fill={colour} />

            {/* A larger invisible target, so a 2px return is still reachable. */}
            <circle cx={point.x} cy={point.y} r="13" fill="transparent" />
        </g>
    );
}
