/**
 * Every rule this template owns, scoped under `.bcast`.
 *
 * It is emitted inline rather than imported as a stylesheet so a template can
 * never leak into the nine others: nothing here matches outside the root, and
 * nothing outside this file styles a Broadcast page.
 *
 * The house rule of the design is in here twice and is worth stating: the
 * glitch belongs to the CHROME. Ghost channels are drawn behind a solid,
 * fully-opaque text layer, so a headline is legible at first paint whether or
 * not a frame ever lands, and every instrument value is plain SVG text. Nothing
 * animates from `opacity: 0`.
 */
const CSS = `
.bcast {
  --bc-cyan: #2ef2ff;
  --bc-mag: #ff2bd6;
  --bc-yellow: #ffe23d;
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  background: var(--t-bg);
  color: var(--t-ink);
  font-family: var(--t-body);
  overflow-x: clip;
  padding-bottom: 4rem;
}
.bcast *, .bcast *::before, .bcast *::after { box-sizing: border-box; }
.bcast p { margin: 0; }

.bcast-rail {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 74rem;
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 2.75rem);
}

.bcast-mono {
  font-family: var(--t-data);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
}

/* ---- fixed interference. Decorative, inert, and silent under reduced motion. */
.bcast-fx { position: fixed; inset: 0; z-index: 40; pointer-events: none; }
.bcast-fx-scan {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.34) 2px 3px);
  opacity: 0.5;
}
.bcast-fx-track {
  position: absolute;
  left: -10%;
  width: 120%;
  height: 16vh;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0%,
    rgba(46,242,255,0.05) 34%,
    rgba(255,43,214,0.09) 52%,
    rgba(0,0,0,0) 100%
  );
  animation: bcast-roll 9s linear infinite;
}
.bcast-fx-vig {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%);
}

@keyframes bcast-roll {
  from { transform: translateY(-30vh); }
  to { transform: translateY(115vh); }
}

/* ---- station furniture, burned into the corners of the picture. */
.bcast-ident, .bcast-tc {
  position: fixed;
  z-index: 45;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.55rem;
  background: rgba(4, 5, 10, 0.72);
  border: 1px solid var(--t-line);
  font-family: var(--t-data);
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  max-width: calc(100vw - 1.5rem);
  overflow: hidden;
  text-overflow: ellipsis;
}
.bcast-ident { top: 0.75rem; left: 0.75rem; color: var(--t-ink); }
.bcast-tc { bottom: 0.75rem; right: 0.75rem; color: var(--bc-yellow); }
.bcast-rec {
  width: 0.5rem;
  height: 0.5rem;
  flex: 0 0 auto;
  background: var(--t-accent);
  animation: bcast-blink 1.4s steps(1, end) infinite;
}
@keyframes bcast-blink { 0%, 55% { opacity: 1; } 56%, 100% { opacity: 0.15; } }

/* ---- RGB separation. The readable layer sits on top and never moves. */
.bcast-split { position: relative; display: inline-block; }
.bcast-split-real { position: relative; z-index: 3; color: inherit; }
.bcast-split-ghost {
  position: absolute;
  inset: 0;
  z-index: 1;
  user-select: none;
  mix-blend-mode: screen;
  white-space: inherit;
}
.bcast-split-ghost--mag { color: var(--bc-mag); animation: bcast-shift-a 2.6s steps(2, end) infinite; }
.bcast-split-ghost--cyan { color: var(--bc-cyan); animation: bcast-shift-b 3.4s steps(2, end) infinite; }

@keyframes bcast-shift-a {
  0%, 88% { transform: translate3d(-2px, 0, 0); }
  90% { transform: translate3d(-7px, 1px, 0); }
  94% { transform: translate3d(3px, -1px, 0); }
  96%, 100% { transform: translate3d(-2px, 0, 0); }
}
@keyframes bcast-shift-b {
  0%, 90% { transform: translate3d(2px, 0, 0); }
  92% { transform: translate3d(8px, -1px, 0); }
  95% { transform: translate3d(-3px, 1px, 0); }
  97%, 100% { transform: translate3d(2px, 0, 0); }
}

/* ---- colour bars. */
.bcast-bars { display: flex; width: 100%; }
.bcast-bars > span { flex: 1 1 0; }

/* ---- hero. */
.bcast-hero { padding-top: clamp(3.5rem, 9vw, 6rem); padding-bottom: clamp(2rem, 5vw, 3.5rem); }
.bcast-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.7rem;
  background: var(--t-accent);
  color: var(--t-accent-ink);
  font-family: var(--t-data);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.bcast-h1 {
  margin: 1.25rem 0 0;
  font-family: var(--t-display);
  font-weight: 700;
  line-height: 0.92;
  letter-spacing: -0.045em;
  text-transform: uppercase;
}
.bcast-h1-line { display: block; font-size: clamp(2.4rem, 11vw, 6rem); }
.bcast-h1-word {
  display: block;
  font-size: clamp(3.6rem, 20vw, 11rem);
  color: var(--t-accent);
}
.bcast-deck {
  max-width: 44ch;
  margin-top: 1.5rem;
  font-size: clamp(1rem, 2.2vw, 1.1875rem);
  line-height: 1.5;
  color: var(--t-ink-soft);
}
.bcast-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.75rem;
  padding: 1rem 1.6rem;
  background: var(--t-ink);
  color: var(--t-bg);
  border: 1px solid var(--t-ink);
  font-family: var(--t-data);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background-color 140ms linear, color 140ms linear;
}
.bcast-cta:hover { background: var(--t-accent); border-color: var(--t-accent); color: var(--t-accent-ink); }

/* ---- the burn-in stat ticker under the hero. */
.bcast-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  border: 1px solid var(--t-line);
  background: var(--t-surface);
  margin-top: clamp(2rem, 5vw, 3rem);
}
.bcast-strip > div {
  padding: 0.9rem 1rem;
  border-right: 1px solid var(--t-line);
}
.bcast-strip > div:last-child { border-right: 0; }
.bcast-strip dt {
  font-family: var(--t-data);
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
}
.bcast-strip dd {
  margin: 0.35rem 0 0;
  font-family: var(--t-display);
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--bc-yellow);
}

/* ---- slates. */
.bcast-slate { padding-block: clamp(2.75rem, 7vw, 4.5rem); border-top: 1px solid var(--t-line); }
.bcast-slate-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.bcast-tag {
  padding: 0.3rem 0.5rem;
  background: var(--bc-cyan);
  color: var(--t-bg);
  font-family: var(--t-data);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.bcast-h2 {
  margin: 0;
  font-family: var(--t-display);
  font-weight: 700;
  font-size: clamp(1.9rem, 6vw, 3.4rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  text-wrap: balance;
}
.bcast-h2 .bcast-accent { color: var(--t-accent); }
.bcast-body {
  max-width: 52ch;
  margin-top: 1.1rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--t-ink-soft);
}
.bcast-slate--banner {
  background: linear-gradient(90deg, rgba(255,43,214,0.14), rgba(46,242,255,0.08));
  border-block: 1px solid var(--t-line);
}
.bcast-slate--centered { text-align: center; }
.bcast-slate--centered .bcast-body { margin-inline: auto; }
.bcast-slate--centered .bcast-slate-head { justify-content: center; }
.bcast-cols { display: grid; gap: clamp(1.5rem, 4vw, 3rem); }
@media (min-width: 62rem) {
  .bcast-cols { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
}

/* ---- monitors: the frame every instrument sits in. */
.bcast-monitor {
  position: relative;
  margin-top: 1.75rem;
  padding: clamp(1rem, 3vw, 1.75rem);
  background: var(--t-surface);
  border: 1px solid var(--t-line);
}
.bcast-monitor::before, .bcast-monitor::after {
  content: "";
  position: absolute;
  width: 15px;
  height: 15px;
  border: 2px solid var(--t-accent);
}
.bcast-monitor::before { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
.bcast-monitor::after { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }
.bcast-monitor-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  padding-bottom: 0.85rem;
  margin-bottom: 1.1rem;
  border-bottom: 1px solid var(--t-line);
}
.bcast-readout {
  margin-top: 0.9rem;
  min-height: 2.6em;
  font-family: var(--t-data);
  font-size: 0.75rem;
  line-height: 1.5;
  letter-spacing: 0.06em;
  color: var(--t-ink-soft);
}
.bcast-readout b { color: var(--bc-yellow); font-weight: 500; }

.bcast-figure { margin: 0; display: grid; gap: 1rem; justify-items: center; }
.bcast-figure svg { display: block; width: 100%; height: auto; }

/* ---- public service announcements: the three fixed commitments. */
.bcast-psa-grid { display: grid; gap: 1px; background: var(--t-line); border: 1px solid var(--t-line); }
@media (min-width: 60rem) { .bcast-psa-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.bcast-psa { display: flex; flex-direction: column; gap: 0.75rem; padding: clamp(1.25rem, 3vw, 1.75rem); background: var(--t-bg); }
.bcast-psa h3 {
  margin: 0;
  font-family: var(--t-display);
  font-size: clamp(1.3rem, 3.4vw, 1.75rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}
.bcast-psa p { font-size: 0.9375rem; line-height: 1.55; color: var(--t-ink-soft); }
.bcast-link {
  color: var(--bc-cyan);
  font-family: var(--t-data);
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  align-self: flex-start;
  word-break: break-all;
}
.bcast-link:hover { color: var(--t-accent); }

/* ---- sign-off. */
.bcast-signoff { margin-top: clamp(2.5rem, 6vw, 4rem); border-top: 1px solid var(--t-line); padding-top: 1.5rem; }
.bcast-signoff-word {
  font-family: var(--t-display);
  font-size: clamp(1.6rem, 6vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  line-height: 1;
}
.bcast-fine {
  margin-top: 1rem;
  display: grid;
  gap: 0.4rem;
  font-family: var(--t-data);
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  color: var(--t-ink-soft);
  word-break: break-word;
}

.bcast a:focus-visible, .bcast [tabindex]:focus-visible {
  outline: 2px solid var(--bc-yellow);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .bcast-fx-track { display: none; }
  .bcast-rec { animation: none; opacity: 1; }
  .bcast-split-ghost--mag { animation: none; transform: translate3d(-2px, 0, 0); }
  .bcast-split-ghost--cyan { animation: none; transform: translate3d(2px, 0, 0); }
  .bcast-cta { transition: none; }
}
`;

export default function BroadcastStyles() {
    return <style>{CSS}</style>;
}
