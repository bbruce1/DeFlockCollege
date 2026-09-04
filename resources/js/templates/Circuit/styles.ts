/**
 * Every rule is nested under `.ckt-root`, so this template cannot reach any
 * other. The contract tokens are set on the root element itself in index.tsx;
 * the `--ckt-*` values below are this board's own vocabulary and deliberately
 * not part of the shared naming.
 */
export const BOARD_CSS = `
.ckt-root {
  --ckt-silk: #dfe9dd;
  --ckt-silk-soft: rgba(223, 233, 221, 0.42);
  --ckt-copper: #b57f2c;
  --ckt-mask-lit: #114029;
  --ckt-hole: #030b07;

  position: relative;
  z-index: 1;
  min-height: 100vh;
  background: var(--t-bg);
  color: var(--t-ink);
  font-family: var(--t-body);
  font-size: 1rem;
  line-height: 1.55;
  padding: clamp(0.75rem, 2vw, 2rem);
  overflow-x: hidden;
}

.ckt-root *, .ckt-root *::before, .ckt-root *::after { box-sizing: border-box; }

.ckt-board {
  position: relative;
  max-width: 74rem;
  margin-inline: auto;
  padding: clamp(1.25rem, 3.5vw, 3rem);
  background:
    radial-gradient(120% 70% at 50% -10%, var(--ckt-mask-lit) 0%, transparent 60%),
    linear-gradient(180deg, #0a2517 0%, #071c11 55%, #061810 100%);
  border: 2px solid var(--ckt-copper);
  box-shadow:
    inset 0 0 0 1px rgba(232, 179, 58, 0.22),
    inset 0 0 90px rgba(0, 0, 0, 0.55),
    0 0 0 1px #030b07;
}

/* Woven glass, faint enough to be substrate rather than pattern. */
.ckt-weave {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(90deg, rgba(255,255,255,0.028) 0 2px, transparent 2px 9px),
    repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 2px, transparent 2px 9px);
}

.ckt-underlay { position: absolute; inset: 0; pointer-events: none; opacity: 0.5; }

.ckt-inner { position: relative; z-index: 2; }

.ckt-mount {
  position: absolute;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--ckt-hole) 0 34%, var(--t-accent) 36% 70%, transparent 72%);
}

.ckt-fiducial {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--t-accent);
  opacity: 0.75;
}

/* Silkscreen annotation. The voice of anything printed on the board. */
.ckt-silk {
  font-family: var(--t-data);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ckt-silk);
  opacity: 0.72;
}

.ckt-desig {
  font-family: var(--t-data);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--t-accent);
}

.ckt-title-block {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 1px;
  border: 1px solid var(--ckt-silk-soft);
  background: var(--ckt-silk-soft);
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.ckt-title-cell {
  background: #08200f;
  padding: 0.75rem 0.9rem;
  min-width: 0;
}

.ckt-title-cell dt {
  font-family: var(--t-data);
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
  margin: 0 0 0.3rem;
}

.ckt-title-cell dd {
  margin: 0;
  font-family: var(--t-data);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--t-ink);
  overflow-wrap: anywhere;
}

/* A part on the board: silkscreen outline, body fill, pads down both edges. */
.ckt-part { position: relative; margin-block: 0; }

.ckt-part-body {
  position: relative;
  border: 1px solid var(--ckt-silk-soft);
  background: linear-gradient(180deg, rgba(20, 58, 38, 0.86), rgba(11, 38, 24, 0.86));
  padding: clamp(1.25rem, 3vw, 2.25rem);
}

.ckt-part-body::after {
  content: "";
  position: absolute;
  top: 10px;
  left: 10px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ckt-silk);
  opacity: 0.6;
}

.ckt-part-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-left: 1rem;
}

/* Plated pads at a constant 24px pitch, however tall the part turns out. */
.ckt-pads {
  position: absolute;
  top: 14px;
  bottom: 14px;
  width: 10px;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    var(--t-accent) 0 4px,
    var(--ckt-hole) 4px 10px,
    var(--t-accent) 10px 14px,
    transparent 14px 38px
  );
}
.ckt-pads-left { left: -11px; }
.ckt-pads-right { right: -11px; }

.ckt-h {
  font-family: var(--t-display);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.03;
  margin: 0;
  color: var(--t-ink);
  text-wrap: balance;
}

.ckt-h-part { font-size: clamp(1.5rem, 4.2vw, 2.4rem); }
.ckt-h-banner { font-size: clamp(2rem, 6.5vw, 3.6rem); }
.ckt-h-hero { font-size: clamp(2.6rem, 11vw, 6rem); }

.ckt-em {
  font-style: normal;
  color: var(--t-accent);
  text-shadow: 0 0 26px rgba(232, 179, 58, 0.5);
}

.ckt-body {
  margin: 0.9rem 0 0;
  max-width: 46ch;
  color: var(--t-ink-soft);
  font-size: 1rem;
  line-height: 1.62;
}

.ckt-hero {
  position: relative;
  border: 2px solid var(--t-accent);
  background: linear-gradient(180deg, #0b2c1b, #071d12);
  padding: clamp(2rem, 6vw, 4rem) clamp(1.25rem, 4vw, 3rem);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.6), 0 0 40px rgba(232, 179, 58, 0.08);
}

/* The chip notch: the mark that tells you which end pin 1 is. */
.ckt-notch {
  position: absolute;
  top: -2px;
  left: 50%;
  width: 62px;
  height: 31px;
  transform: translateX(-50%);
  border: 2px solid var(--t-accent);
  border-top-color: transparent;
  border-radius: 0 0 62px 62px;
  background: var(--t-bg);
}

.ckt-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: clamp(1.5rem, 4vw, 2.25rem);
  padding: 1rem 1.9rem;
  background: var(--t-accent);
  color: var(--t-accent-ink);
  font-family: var(--t-data);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid var(--t-accent);
  box-shadow: 0 0 0 4px rgba(232, 179, 58, 0.14);
  transition: background-color 160ms ease, box-shadow 160ms ease;
}

.ckt-cta:hover { background: #ffd166; box-shadow: 0 0 0 6px rgba(232, 179, 58, 0.22); }

.ckt-link {
  color: var(--t-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.ckt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: clamp(1rem, 2.5vw, 1.75rem);
  align-items: start;
}

.ckt-figure { margin: 0; }
.ckt-figure svg { display: block; width: 100%; height: auto; }

.ckt-readout {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.6rem;
  margin-top: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--t-line);
}

.ckt-readout div { min-width: 0; }
.ckt-readout dt {
  font-family: var(--t-data);
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
  margin: 0;
}
.ckt-readout dd {
  margin: 0.15rem 0 0;
  font-family: var(--t-data);
  font-size: 1.35rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--t-accent);
}
.ckt-readout dd.ckt-signal { color: var(--t-signal); }

.ckt-stack { display: grid; gap: clamp(1.75rem, 4vw, 2.75rem); }
.ckt-bus { display: block; width: 100%; height: 92px; }

.ckt-note {
  border-left: 3px solid var(--t-signal);
  padding: 0.75rem 0 0.75rem 1rem;
  margin-top: 1.25rem;
  color: var(--t-ink-soft);
  font-size: 0.9375rem;
}

.ckt-footer {
  margin-top: clamp(2rem, 5vw, 3.5rem);
  padding-top: 1.25rem;
  border-top: 1px dashed var(--ckt-silk-soft);
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  justify-content: space-between;
}

@media (max-width: 640px) {
  .ckt-pads { display: none; }
  .ckt-bus { height: 64px; }
  .ckt-body { font-size: 0.9375rem; }
}
`;
