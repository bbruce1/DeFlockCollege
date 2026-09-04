import type { ReactNode } from 'react';

/**
 * One part on the board.
 *
 * Silkscreen outline, a body fill, a pin-1 dot, and plated pads down both edges
 * for the bus to land on. The pads are drawn as a repeating gradient rather than
 * a fixed count, so pitch stays constant and a taller part simply grows more
 * pins — which is what a real package does.
 */
interface Props {
    designator: string;
    label: string;
    children: ReactNode;
    id?: string;
}

export default function ComponentOutline({ designator, label, children, id }: Props) {
    return (
        <section className="ckt-part" id={id}>
            <div className="ckt-part-head">
                <span className="ckt-desig">{designator}</span>
                <span className="ckt-silk">{label}</span>
            </div>

            <div className="ckt-part-body">
                <span className="ckt-pads ckt-pads-left" aria-hidden="true" />
                <span className="ckt-pads ckt-pads-right" aria-hidden="true" />

                {children}
            </div>
        </section>
    );
}
