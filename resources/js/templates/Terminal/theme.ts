import type { CSSProperties } from 'react';
import type { TemplateTokens } from '../contract';

/**
 * A VT220 someone has SSH'd into.
 *
 * P1 phosphor green for everything the machine says, amber held back for the one
 * word the page is about. Red belongs to the cameras and to nothing else, which
 * is the only rule this palette has that is not decorative.
 */
export const TERMINAL_TOKENS: TemplateTokens = {
    '--t-bg': '#040a07',
    '--t-surface': '#08120d',
    '--t-line': '#163d29',
    '--t-ink': '#5cf7a5',
    '--t-ink-soft': '#3c9a6b',
    '--t-accent': '#ffb220',
    '--t-accent-ink': '#06100a',
    '--t-signal': '#ff5340',
    '--t-display': '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    '--t-body': '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    '--t-data': '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

export const TERMINAL_STYLE = TERMINAL_TOKENS as unknown as CSSProperties;

/**
 * Scoped to .tt so this template cannot reach anything outside its own root, and
 * nothing outside can reach in. Written as a stylesheet rather than inline styles
 * because a CRT needs pseudo-elements, keyframes and media queries, none of which
 * a style attribute can express.
 */
export const TERMINAL_CSS = `
.tt {
  --tt-glow: rgba(92, 247, 165, 0.35);
  position: relative;
  isolation: isolate;
  background: var(--t-bg);
  color: var(--t-ink);
  font-family: var(--t-data);
  font-size: 14px;
  line-height: 1.7;
  letter-spacing: 0.01em;
  overflow-x: clip;
  padding-bottom: 5rem;
}

.tt *, .tt *::before, .tt *::after { box-sizing: border-box; }
.tt p, .tt h1, .tt h2, .tt h3, .tt ul, .tt ol, .tt figure { margin: 0; }
.tt ul, .tt ol { padding: 0; list-style: none; }

/* The glass: scanlines, a slow raster sweep, and a corner vignette. Fixed and
   inert, so scrolling never repaints it. */
.tt__glass {
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  background:
    repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.34) 2px 4px),
    radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.72) 100%);
}

.tt__sweep {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 22vh;
  z-index: 41;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(92,247,165,0) 0%, rgba(92,247,165,0.055) 55%, rgba(92,247,165,0) 100%);
  animation: tt-sweep 9s linear infinite;
}

@keyframes tt-sweep {
  from { transform: translateY(-30vh); }
  to { transform: translateY(115vh); }
}

@media (prefers-reduced-motion: reduce) {
  .tt__sweep { animation: none; opacity: 0.35; }
  .tt__cursor { animation: none; }
}

.tt__page {
  position: relative;
  z-index: 1;
  max-width: 68rem;
  margin: 0 auto;
  padding: 0 18px;
}

/* Window chrome. */
.tt__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  align-items: baseline;
  border-bottom: 1px solid var(--t-line);
  padding: 0.75rem 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
}
.tt__bar-spacer { flex: 1 1 auto; }
.tt__live { color: var(--t-accent); }

.tt__cursor {
  display: inline-block;
  width: 0.62em;
  height: 1.05em;
  vertical-align: -0.16em;
  background: var(--t-accent);
  animation: tt-blink 1.06s steps(1) infinite;
}
@keyframes tt-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

.tt__cmd {
  display: block;
  margin: 3.25rem 0 0.9rem;
  color: var(--t-ink-soft);
  font-size: 13px;
  word-break: break-word;
}
.tt__cmd em { font-style: normal; color: var(--t-ink); }
.tt__cmd-user { color: var(--t-accent); }

.tt__out {
  border-left: 1px solid var(--t-line);
  padding-left: clamp(0.75rem, 3vw, 1.6rem);
}

.tt__label {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
}

.tt__h {
  font-family: var(--t-display);
  font-weight: 500;
  font-size: clamp(1.4rem, 4.6vw, 2.35rem);
  line-height: 1.18;
  letter-spacing: -0.03em;
  text-wrap: balance;
  margin: 0.5rem 0 0.75rem;
  text-shadow: 0 0 14px var(--tt-glow);
}

.tt__body {
  max-width: 62ch;
  color: var(--t-ink);
  opacity: 0.86;
}

.tt__accent {
  color: var(--t-accent);
  text-shadow: 0 0 16px rgba(255, 178, 32, 0.4);
}

/* An inverted run of text is how a terminal shouts. */
.tt__inv {
  background: var(--t-accent);
  color: var(--t-accent-ink);
  padding: 0 0.22em;
  text-shadow: none;
}

.tt__hero {
  padding: 2.5rem 0 1rem;
}
.tt__hero h1 {
  font-family: var(--t-display);
  font-weight: 500;
  font-size: clamp(2.1rem, 12.5vw, 6.2rem);
  line-height: 0.98;
  letter-spacing: -0.06em;
  text-transform: uppercase;
  text-shadow: 0 0 26px var(--tt-glow);
}
.tt__hero-line { display: block; }

.tt__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 2rem;
  padding: 0.85rem 1.4rem;
  border: 1px solid var(--t-accent);
  background: transparent;
  color: var(--t-accent);
  font: inherit;
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 140ms linear, color 140ms linear;
}
.tt__cta:hover, .tt__cta:focus-visible {
  background: var(--t-accent);
  color: var(--t-accent-ink);
}

.tt a { color: var(--t-accent); text-decoration: none; border-bottom: 1px solid currentColor; }
.tt a:hover { background: var(--t-accent); color: var(--t-accent-ink); border-color: transparent; }
.tt :where(a, button, [tabindex]):focus-visible {
  outline: 2px solid var(--t-accent);
  outline-offset: 2px;
}

/* Boot log. */
.tt__boot { padding: 1.5rem 0 0; font-size: 12.5px; }
.tt__boot li { display: flex; gap: 0.75rem; align-items: baseline; flex-wrap: wrap; }
.tt__boot-t { color: var(--t-ink-soft); flex: 0 0 auto; }
.tt__boot-msg { flex: 1 1 12rem; min-width: 0; overflow-wrap: anywhere; }
.tt__boot-v { color: var(--t-accent); flex: 0 0 auto; }
.tt__boot-v--red { color: var(--t-signal); }

/* Dot-leader readout. */
.tt__readout { font-size: 13px; }
.tt__readout li {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.18rem 0;
  border-bottom: 1px dotted var(--t-line);
}
.tt__readout-k { color: var(--t-ink-soft); text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; }
.tt__readout-fill { flex: 1 1 auto; }
.tt__readout-v { font-size: 15px; color: var(--t-ink); }

/* ASCII meters. */
.tt__meter { display: block; padding: 0.35rem 0; }
.tt__meter-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.35rem 0.9rem; }
.tt__meter-name { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--t-ink-soft); }
.tt__meter-val { font-size: 15px; }
.tt__meter-bar {
  display: block;
  font-size: clamp(11px, 3.1vw, 15px);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  color: var(--t-ink-soft);
}
.tt__meter-bar b { font-weight: 500; color: var(--t-signal); }
.tt__meter-bar--accent b { color: var(--t-accent); }

.tt__grid {
  display: grid;
  gap: clamp(1.25rem, 4vw, 2.5rem);
  grid-template-columns: 1fr;
  align-items: start;
}
@media (min-width: 780px) {
  .tt__grid--split { grid-template-columns: minmax(0, 20rem) minmax(0, 1fr); }
}

.tt__plot { width: 100%; height: auto; display: block; border: 1px solid var(--t-line); background: var(--t-surface); }
.tt__plot g[tabindex] { cursor: crosshair; }

.tt__status {
  min-height: 3.2em;
  margin-top: 0.6rem;
  font-size: 12px;
  color: var(--t-ink-soft);
  overflow-wrap: anywhere;
}
.tt__status b { font-weight: 500; color: var(--t-ink); }

/* Diff output for the change-since-last-refresh section. */
.tt__diff { font-size: 13px; overflow-x: auto; }
.tt__diff div { white-space: pre; }
.tt__diff .add { color: var(--t-signal); }
.tt__diff .del { color: var(--t-ink); }
.tt__diff .meta { color: var(--t-ink-soft); }

.tt__file {
  border: 1px solid var(--t-line);
  background: var(--t-surface);
  padding: clamp(1rem, 3.5vw, 1.6rem);
}
.tt__file + .tt__file { margin-top: 1rem; }
.tt__file-path { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--t-accent); }
.tt__file h3 {
  font-family: var(--t-display);
  font-weight: 500;
  font-size: clamp(1.15rem, 3.6vw, 1.6rem);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0.4rem 0 0.6rem;
}

.tt__section { scroll-margin-top: 2rem; }
.tt__widget { margin-top: 1.75rem; }
.tt__meters { display: grid; gap: 1.1rem; max-width: 46rem; }
.tt__files { display: block; margin-top: 1.5rem; }

.tt__scope { display: grid; gap: 0.5rem; justify-items: start; }
.tt__scope-svg { width: 100%; max-width: 21rem; height: auto; display: block; }

.tt__scope-sweep {
  transform-origin: 50% 50%;
  animation: tt-spin 5.5s linear infinite;
}
@keyframes tt-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .tt__scope-sweep { animation: none; }
}

.tt__foot {
  margin-top: 4rem;
  border-top: 1px solid var(--t-line);
  padding-top: 1rem;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--t-ink-soft);
  overflow-wrap: anywhere;
}

.tt__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
`;
