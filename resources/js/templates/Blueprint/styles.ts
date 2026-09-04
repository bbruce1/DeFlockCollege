/**
 * Scoped to .bp and driven entirely by --t-* tokens set on the root element, so
 * nothing here can reach a chapter running one of the other nine templates.
 */
export const BLUEPRINT_CSS = `
.bp { position: relative; z-index: 1; min-height: 100vh; background: var(--t-bg); color: var(--t-ink); font-family: var(--t-body); font-size: 1rem; line-height: 1.6; }
.bp *, .bp *::before, .bp *::after { box-sizing: border-box; }
.bp h1, .bp h2, .bp h3 { margin: 0; font-family: var(--t-display); font-weight: 700; letter-spacing: -0.02em; line-height: 1.04; }
.bp p { margin: 0; }
.bp a { color: var(--t-accent); text-underline-offset: 4px; }

/* Drawing paper: a fine grid over a coarse one, both cyan and both faint. */
.bp-paper { position: fixed; inset: 0; z-index: 0; pointer-events: none; background:
  linear-gradient(to right, rgba(127, 220, 255, 0.055) 1px, transparent 1px) 0 0 / 20px 20px,
  linear-gradient(to bottom, rgba(127, 220, 255, 0.055) 1px, transparent 1px) 0 0 / 20px 20px,
  linear-gradient(to right, rgba(127, 220, 255, 0.10) 1px, transparent 1px) 0 0 / 100px 100px,
  linear-gradient(to bottom, rgba(127, 220, 255, 0.10) 1px, transparent 1px) 0 0 / 100px 100px,
  radial-gradient(ellipse 120% 90% at 50% 0%, rgba(20, 90, 140, 0.35), transparent 70%),
  var(--t-bg); }
.bp-body { position: relative; z-index: 2; }

/* The sheet: a double border with zone rulers, as a drawing sheet is trimmed. */
.bp-sheet { max-width: 78rem; margin: 1rem auto 0; border: 1px solid var(--t-line); outline: 3px solid var(--t-line); outline-offset: 5px; }
@media (max-width: 700px) { .bp-sheet { margin: 0.5rem 0.5rem 0; outline-width: 2px; outline-offset: 3px; } }

.bp-zone { display: flex; border-bottom: 1px solid var(--t-line); }
.bp-zone-foot { border-bottom: 0; border-top: 1px solid var(--t-line); }
.bp-zone span { flex: 1 1 0; text-align: center; padding: 0.2rem 0; font-family: var(--t-data); font-size: 0.5625rem; letter-spacing: 0.2em; color: var(--t-ink-soft); border-right: 1px solid var(--t-line); }
.bp-zone span:last-child { border-right: 0; }

.bp-page { padding: 0 1.5rem; }
@media (max-width: 700px) { .bp-page { padding: 0 0.9rem; } }

.bp-label { font-family: var(--t-data); font-size: 0.625rem; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: var(--t-ink-soft); }
.bp-label-lit { color: var(--t-accent); }

/* Hero: the drawing's title, dimensioned. */
.bp-hero { padding: 3.25rem 0 2.25rem; }
.bp-hero-small { font-family: var(--t-data); font-size: clamp(0.9rem, 3vw, 1.35rem); font-weight: 500; letter-spacing: 0.34em; text-transform: uppercase; color: var(--t-ink-soft); }
.bp-hero-big { display: block; font-family: var(--t-display); font-weight: 700; font-size: clamp(3rem, 17vw, 9rem); line-height: 0.86; letter-spacing: -0.055em; text-transform: uppercase; color: var(--t-accent); word-break: break-word; }
.bp-cta { display: inline-flex; align-items: center; gap: 0.7rem; margin-top: 1.75rem; padding: 0.9rem 1.5rem; border: 1px solid var(--t-accent); background: transparent; color: var(--t-accent); font-family: var(--t-data); font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; box-shadow: 4px 4px 0 rgba(127, 220, 255, 0.16); }
.bp-cta:hover { background: var(--t-accent); color: var(--t-accent-ink); }

/* Every block on the sheet is a drawn frame with a stamped caption. */
.bp-frame { border: 1px solid var(--t-line); background: rgba(6, 22, 36, 0.6); }
.bp-frame-head { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; justify-content: space-between; align-items: baseline; padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--t-line); background: rgba(127, 220, 255, 0.05); }
.bp-frame-body { padding: 1rem 0.8rem; }

.bp-plan { display: block; width: 100%; height: auto; }

.bp-section { padding: 3rem 0; border-top: 1px dashed var(--t-line); }
.bp-headline { font-family: var(--t-display); font-weight: 700; font-size: clamp(1.5rem, 4.8vw, 2.6rem); letter-spacing: -0.03em; line-height: 1.06; text-transform: uppercase; text-wrap: balance; }
.bp-accent { color: var(--t-accent); }
.bp-copy { margin-top: 1rem; max-width: 48ch; color: var(--t-ink-soft); }
.bp-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2rem; align-items: start; }
@media (max-width: 760px) { .bp-split { grid-template-columns: minmax(0, 1fr); gap: 1.25rem; } }
.bp-centred { text-align: center; }
.bp-centred .bp-copy { margin-inline: auto; }
.bp-centred .bp-head-row { justify-content: center; }
.bp-banner { border: 1px solid var(--t-accent); background: rgba(127, 220, 255, 0.07); padding: 2rem 1.1rem; }

.bp-head-row { display: flex; align-items: center; gap: 0.9rem; margin-bottom: 1rem; }

/* Title block and schedules: real tables, because that is what they are. */
.bp-table { width: 100%; border-collapse: collapse; font-family: var(--t-data); font-size: 0.6875rem; }
.bp-table th, .bp-table td { border: 1px solid var(--t-line); padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }
.bp-table th { font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--t-ink-soft); white-space: nowrap; }
.bp-table td { color: var(--t-ink); overflow-wrap: anywhere; }
.bp-table-scroll { overflow-x: auto; }

.bp-titleblock { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); border: 1px solid var(--t-line); border-bottom: 0; border-right: 0; }
.bp-titlecell { border-right: 1px solid var(--t-line); border-bottom: 1px solid var(--t-line); padding: 0.7rem 0.8rem; min-width: 0; }
.bp-titlecell strong { display: block; margin-top: 0.3rem; font-family: var(--t-data); font-size: 0.9375rem; font-weight: 600; letter-spacing: 0.02em; color: var(--t-ink); overflow-wrap: anywhere; }
.bp-titlecell-wide { grid-column: 1 / -1; }

.bp-notes { counter-reset: bp-note; display: grid; gap: 1px; background: var(--t-line); border: 1px solid var(--t-line); }
.bp-note { background: var(--t-bg); padding: 1.5rem 1.2rem 1.5rem 3.4rem; position: relative; }
.bp-note::before { counter-increment: bp-note; content: counter(bp-note, decimal-leading-zero); position: absolute; left: 1.1rem; top: 1.5rem; font-family: var(--t-data); font-size: 0.75rem; font-weight: 600; color: var(--t-accent); }
.bp-note h3 { font-size: clamp(1.1rem, 3.4vw, 1.55rem); text-transform: uppercase; margin-bottom: 0.5rem; }

.bp-figures { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); border-top: 1px solid var(--t-line); border-left: 1px solid var(--t-line); }
.bp-figure-cell { border-right: 1px solid var(--t-line); border-bottom: 1px solid var(--t-line); padding: 1rem 0.8rem; min-width: 0; }
.bp-figure { display: block; font-family: var(--t-display); font-weight: 700; font-size: clamp(1.8rem, 5.5vw, 2.6rem); line-height: 1; letter-spacing: -0.04em; color: var(--t-accent); }
.bp-figure-quiet { color: var(--t-ink); }

.bp-foot { padding: 2.5rem 0 3.5rem; }

@media (prefers-reduced-motion: no-preference) {
  .bp-trace { animation: bp-march 3.2s linear infinite; }
}
@keyframes bp-march { to { stroke-dashoffset: -24; } }
`;
