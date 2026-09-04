/**
 * Every rule is prefixed with the template's own class, and every colour comes
 * from a --t-* token set on the root element, so nothing here can reach a page
 * running one of the other nine templates.
 */
export const SIGNAL_CSS = `
.sig { position: relative; z-index: 1; min-height: 100vh; background: var(--t-bg); color: var(--t-ink); font-family: var(--t-body); font-size: 1rem; line-height: 1.6; }
.sig *, .sig *::before, .sig *::after { box-sizing: border-box; }
.sig h1, .sig h2, .sig h3 { margin: 0; font-family: var(--t-display); font-weight: 600; letter-spacing: -0.01em; line-height: 1.05; }
.sig p { margin: 0; }
.sig a { color: inherit; }

.sig-backdrop { position: fixed; inset: 0; z-index: 0; pointer-events: none; background:
  radial-gradient(ellipse 120% 80% at 50% 0%, rgba(43, 245, 192, 0.09), transparent 62%),
  radial-gradient(ellipse 90% 70% at 50% 100%, rgba(20, 120, 160, 0.10), transparent 66%),
  var(--t-bg); }
.sig-grain { position: fixed; inset: 0; z-index: 40; pointer-events: none; opacity: 0.5;
  background: repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.30) 2px 3px); }
.sig-body { position: relative; z-index: 2; }

.sig-rail { max-width: 74rem; margin-inline: auto; padding-inline: 1.5rem; }
@media (max-width: 640px) { .sig-rail { padding-inline: 1rem; } }

.sig-mono { font-family: var(--t-data); font-size: 0.6875rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--t-ink-soft); }
.sig-mono-lit { color: var(--t-accent); }

/* The console frame: hairlines and corner ticks instead of boxes and radii. */
.sig-panel { position: relative; border: 1px solid var(--t-line); background: var(--t-surface); }
.sig-panel::before, .sig-panel::after { content: ""; position: absolute; width: 9px; height: 9px; border: 1px solid var(--t-accent); pointer-events: none; }
.sig-panel::before { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
.sig-panel::after { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }
.sig-panel-head { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: baseline; justify-content: space-between; padding: 0.6rem 0.9rem; border-bottom: 1px solid var(--t-line); }
.sig-panel-body { padding: 1.1rem 0.9rem; }

.sig-status { display: flex; flex-wrap: wrap; gap: 0.25rem 1.5rem; align-items: center; padding: 0.55rem 0; border-bottom: 1px solid var(--t-line); }
.sig-led { display: inline-block; width: 6px; height: 6px; background: var(--t-accent); margin-right: 0.5rem; vertical-align: 1px; }

/* Hero */
.sig-hero { padding: 3.5rem 0 2.5rem; }
.sig-hero-line { font-family: var(--t-display); font-weight: 500; font-size: clamp(1.6rem, 6.5vw, 3.1rem); letter-spacing: 0.02em; text-transform: uppercase; line-height: 1.06; color: var(--t-ink); }
.sig-hero-accent { display: inline-block; font-family: var(--t-display); font-weight: 600; font-size: clamp(2.6rem, 15vw, 7.5rem); letter-spacing: -0.03em; text-transform: lowercase; line-height: 0.92; color: var(--t-accent); word-break: break-word; }
.sig-hero-accent::before { content: "> "; color: var(--t-ink-soft); }
.sig-cta { display: inline-flex; align-items: center; gap: 0.7rem; margin-top: 1.75rem; padding: 0.95rem 1.6rem; border: 1px solid var(--t-accent); background: var(--t-accent); color: var(--t-accent-ink); font-family: var(--t-data); font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; text-decoration: none; }
.sig-cta:hover { background: transparent; color: var(--t-accent); }

/* Scope */
.sig-scope-wrap { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 1px; background: var(--t-line); border: 1px solid var(--t-line); }
@media (max-width: 860px) { .sig-scope-wrap { grid-template-columns: minmax(0, 1fr); } }
.sig-scope-cell { background: var(--t-surface); padding: 1rem; min-width: 0; }
.sig-scope { display: block; width: 100%; height: auto; }

.sig-sweep { transform-origin: 200px 200px; }
@media (prefers-reduced-motion: no-preference) {
  .sig-sweep { animation: sig-rotate 7s linear infinite; }
  .sig-ping { animation: sig-ping 7s ease-out infinite; transform-origin: 200px 200px; }
}
@keyframes sig-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes sig-ping { 0% { opacity: 0.9; } 55% { opacity: 0.28; } 100% { opacity: 0.9; } }

/* Contact log */
.sig-log { max-height: 19rem; overflow-y: auto; overflow-x: auto; }
.sig-table { width: 100%; border-collapse: collapse; font-family: var(--t-data); font-size: 0.6875rem; letter-spacing: 0.06em; white-space: nowrap; }
.sig-table th { position: sticky; top: 0; z-index: 1; background: var(--t-surface); text-align: left; font-weight: 500; color: var(--t-ink-soft); letter-spacing: 0.16em; text-transform: uppercase; padding: 0.45rem 0.6rem; border-bottom: 1px solid var(--t-line); }
.sig-table td { padding: 0.34rem 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.045); color: var(--t-ink); }
.sig-table tr:hover td { background: rgba(43, 245, 192, 0.07); }
.sig-tag-flock { color: var(--t-signal); }
.sig-tag-other { color: var(--t-ink-soft); }

/* Readouts */
.sig-readouts { display: grid; grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr)); gap: 1px; background: var(--t-line); border: 1px solid var(--t-line); margin-top: 1px; }
.sig-readout { background: var(--t-surface); padding: 1rem 0.9rem; min-width: 0; }
.sig-figure { display: block; font-family: var(--t-data); font-weight: 600; font-size: clamp(1.7rem, 5.5vw, 2.5rem); line-height: 1; letter-spacing: -0.02em; color: var(--t-accent); overflow-wrap: anywhere; }
.sig-figure-quiet { color: var(--t-ink); }
.sig-readout-note { display: block; margin-top: 0.45rem; font-family: var(--t-data); font-size: 0.625rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--t-ink-soft); }

/* Sections */
.sig-section { padding: 3rem 0; border-top: 1px solid var(--t-line); }
.sig-section-index { display: flex; align-items: baseline; gap: 0.9rem; margin-bottom: 1.1rem; }
.sig-headline { font-family: var(--t-display); font-weight: 600; font-size: clamp(1.5rem, 4.6vw, 2.5rem); letter-spacing: -0.025em; line-height: 1.08; color: var(--t-ink); text-wrap: balance; }
.sig-accent { color: var(--t-accent); }
.sig-copy { margin-top: 1rem; max-width: 46ch; color: var(--t-ink-soft); font-size: 1.0625rem; }
.sig-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2rem; align-items: start; }
@media (max-width: 760px) { .sig-split { grid-template-columns: minmax(0, 1fr); gap: 1.1rem; } }
.sig-centred { text-align: center; }
.sig-centred .sig-copy { margin-inline: auto; }
.sig-centred .sig-section-index { justify-content: center; }
.sig-banner { border-block: 1px solid var(--t-accent); padding: 2.2rem 1.1rem; background: rgba(43, 245, 192, 0.06); }

/* Bars used by the scale, vendor and delta returns */
.sig-bar-track { position: relative; height: 2.2rem; border: 1px solid var(--t-line); background: rgba(255,255,255,0.03); overflow: hidden; }
.sig-bar-fill { position: absolute; inset-block: 0; left: 0; background: var(--t-accent); }
.sig-bar-fill-signal { background: var(--t-signal); }
.sig-bar-row { display: grid; gap: 0.4rem; margin-bottom: 1.1rem; }
.sig-bar-label { display: flex; justify-content: space-between; gap: 1rem; font-family: var(--t-data); font-size: 0.6875rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--t-ink-soft); }

/* Commitments */
.sig-directives { display: grid; gap: 1px; background: var(--t-line); border: 1px solid var(--t-line); }
.sig-directive { background: var(--t-surface); padding: 1.5rem 1.2rem; }
.sig-directive h3 { font-size: clamp(1.15rem, 3.4vw, 1.6rem); margin-bottom: 0.6rem; }
.sig-link { color: var(--t-accent); text-underline-offset: 4px; }

.sig-foot { padding: 2.5rem 0 3.5rem; border-top: 1px solid var(--t-line); }
`;
