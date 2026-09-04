import { useState } from 'react';
import { SECTOR_COUNT, SECTOR_DEGREES, coveredSectors, padBearing, polar, type Contact } from '../geometry';
import ScopeContact from './ScopeContact';
import ScopeSweep from './ScopeSweep';

interface Props {
    contacts: Contact[];
    schoolName: string;
}

const SIZE = 400;
const CENTRE = SIZE / 2;
const RADIUS = 168;
const RINGS = [0.25, 0.5, 0.75, 1];
const SPOKE_DEGREES = 30;
const CARDINALS = [
    { label: 'N', bearing: 0 },
    { label: 'E', bearing: 90 },
    { label: 'S', bearing: 180 },
    { label: 'W', bearing: 270 },
];

/**
 * The instrument the whole template is built around.
 *
 * Campus is the origin. Rings are quarters of the framed area's corner radius,
 * which keeps a ring meaning the same thing from campus to campus. Every return
 * carries its numbers in the DOM before any script runs; the sweep on top is
 * decoration and can fail without taking a value with it.
 */
export default function RadarScope({ contacts, schoolName }: Props) {
    const [active, setActive] = useState<number | null>(null);
    const covered = coveredSectors(contacts);
    const shown = active === null ? null : contacts.find((contact) => contact.index === active) ?? null;

    return (
        <div>
            <svg
                className="sig-scope"
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label={`Plate readers around ${schoolName} plotted by bearing and range from campus. ${contacts.length} contacts.`}
            >
                <circle cx={CENTRE} cy={CENTRE} r={RADIUS} fill="rgba(43, 245, 192, 0.035)" />

                {/* Outward-facing coverage, as a band of 15 degree sectors. */}
                {Array.from({ length: SECTOR_COUNT }, (_, index) => {
                    const start = index * SECTOR_DEGREES - SECTOR_DEGREES / 2;
                    const a = polar(CENTRE, start, RADIUS + 4);
                    const b = polar(CENTRE, start + SECTOR_DEGREES, RADIUS + 4);
                    const c = polar(CENTRE, start + SECTOR_DEGREES, RADIUS + 13);
                    const d = polar(CENTRE, start, RADIUS + 13);

                    return (
                        <path
                            key={index}
                            d={`M ${a.x} ${a.y} A ${RADIUS + 4} ${RADIUS + 4} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${RADIUS + 13} ${RADIUS + 13} 0 0 0 ${d.x} ${d.y} Z`}
                            fill={covered.has(index) ? 'var(--t-accent)' : 'transparent'}
                            stroke="var(--t-line)"
                            strokeWidth="1"
                            opacity={covered.has(index) ? 0.85 : 1}
                        />
                    );
                })}

                {RINGS.map((step) => (
                    <circle
                        key={step}
                        cx={CENTRE}
                        cy={CENTRE}
                        r={RADIUS * step}
                        fill="none"
                        stroke="var(--t-line)"
                        strokeWidth="1"
                        strokeDasharray={step === 1 ? undefined : '2 5'}
                    />
                ))}

                {Array.from({ length: 360 / SPOKE_DEGREES }, (_, index) => {
                    const end = polar(CENTRE, index * SPOKE_DEGREES, RADIUS);

                    return (
                        <line
                            key={index}
                            x1={CENTRE}
                            y1={CENTRE}
                            x2={end.x}
                            y2={end.y}
                            stroke="var(--t-line)"
                            strokeWidth="1"
                            opacity="0.7"
                        />
                    );
                })}

                <ScopeSweep radius={RADIUS} />

                {RINGS.map((step) => (
                    <text
                        key={step}
                        x={CENTRE + 4}
                        y={CENTRE - RADIUS * step + 11}
                        fill="var(--t-ink-soft)"
                        style={{ font: '500 8px var(--t-data)', letterSpacing: '0.1em' }}
                    >
                        {step.toFixed(2)}
                    </text>
                ))}

                {CARDINALS.map(({ label, bearing }) => {
                    const at = polar(CENTRE, bearing, RADIUS + 24);

                    return (
                        <text
                            key={label}
                            x={at.x}
                            y={at.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="var(--t-ink)"
                            style={{ font: '600 11px var(--t-data)', letterSpacing: '0.1em' }}
                        >
                            {label}
                        </text>
                    );
                })}

                {contacts.map((contact) => (
                    <ScopeContact
                        key={contact.index}
                        contact={contact}
                        centre={CENTRE}
                        radius={RADIUS}
                        active={active === contact.index}
                        onActivate={setActive}
                    />
                ))}

                <g className="sig-ping">
                    <circle cx={CENTRE} cy={CENTRE} r="4" fill="none" stroke="var(--t-ink)" strokeWidth="1" />
                </g>
                <line x1={CENTRE - 9} y1={CENTRE} x2={CENTRE + 9} y2={CENTRE} stroke="var(--t-ink)" strokeWidth="1" />
                <line x1={CENTRE} y1={CENTRE - 9} x2={CENTRE} y2={CENTRE + 9} stroke="var(--t-ink)" strokeWidth="1" />
                <text
                    x={CENTRE}
                    y={CENTRE + 22}
                    textAnchor="middle"
                    fill="var(--t-ink-soft)"
                    style={{ font: '500 8px var(--t-data)', letterSpacing: '0.18em' }}
                >
                    ORIGIN
                </text>
            </svg>

            <p className="sig-mono" style={{ marginTop: '0.75rem', minHeight: '2.6em' }} aria-live="polite">
                {shown === null
                    ? 'Rings are quarters of the framed area. Outer band marks the 15° sectors a camera faces into.'
                    : `#${String(shown.index + 1).padStart(3, '0')} · BRG ${padBearing(shown.bearing)} · RNG ${shown.range.toFixed(2)} · HDG ${shown.heading >= 0 ? padBearing(shown.heading) : 'NONE'} · ${shown.isFlock ? 'FLOCK' : 'UNSPECIFIED VENDOR'}`}
            </p>
        </div>
    );
}
