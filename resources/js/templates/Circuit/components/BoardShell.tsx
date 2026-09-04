import type { ReactNode } from 'react';

/**
 * The substrate.
 *
 * Solder mask, woven glass, plated edge, mounting holes at the corners and two
 * fiducials for the pick-and-place. The tiled routing underneath is decoration
 * and says nothing, which is why it sits at half opacity behind everything that
 * does: the traces that carry meaning are the ones between components.
 */

const MOUNT_OFFSET = 12;

export default function BoardShell({ children }: { children: ReactNode }) {
    return (
        <div className="ckt-board">
            <div className="ckt-weave" aria-hidden="true" />

            <svg className="ckt-underlay" aria-hidden="true" focusable="false">
                <defs>
                    <pattern id="ckt-underlay-tile" width="164" height="164" patternUnits="userSpaceOnUse">
                        <g fill="none" stroke="var(--ckt-copper)" strokeWidth="2" opacity="0.5">
                            <path d="M0 22 H58 L82 46 V164" />
                            <path d="M164 74 H108 L84 98 V164" />
                            <path d="M0 122 H36 L36 164" />
                            <path d="M120 0 V38 H164" />
                        </g>
                        <g fill="var(--ckt-copper)" opacity="0.55">
                            <circle cx="82" cy="46" r="6" />
                            <circle cx="36" cy="122" r="5" />
                            <circle cx="120" cy="38" r="5" />
                        </g>
                        <g fill="var(--ckt-hole)">
                            <circle cx="82" cy="46" r="2.5" />
                            <circle cx="36" cy="122" r="2" />
                            <circle cx="120" cy="38" r="2" />
                        </g>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ckt-underlay-tile)" />
            </svg>

            <span className="ckt-mount" style={{ top: MOUNT_OFFSET, left: MOUNT_OFFSET }} aria-hidden="true" />
            <span className="ckt-mount" style={{ top: MOUNT_OFFSET, right: MOUNT_OFFSET }} aria-hidden="true" />
            <span className="ckt-mount" style={{ bottom: MOUNT_OFFSET, left: MOUNT_OFFSET }} aria-hidden="true" />
            <span className="ckt-mount" style={{ bottom: MOUNT_OFFSET, right: MOUNT_OFFSET }} aria-hidden="true" />
            <span className="ckt-fiducial" style={{ top: 52, left: 22 }} aria-hidden="true" />
            <span className="ckt-fiducial" style={{ bottom: 52, right: 22 }} aria-hidden="true" />

            <div className="ckt-inner">{children}</div>
        </div>
    );
}
