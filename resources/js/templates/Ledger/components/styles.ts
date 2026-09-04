/**
 * Every rule is nested under `.lg`, so this template cannot style anything
 * outside its own root and nothing outside can reach in. The shared contract
 * tokens are set on that root in index.tsx; the `--lg-*` values are this desk's
 * private vocabulary.
 *
 * Written as a stylesheet rather than inline styles because a dense book needs
 * sticky headers, hairline gap grids, keyframes and media queries, none of which
 * a style attribute can express.
 */
export const LEDGER_CSS = `
.lg {
  position: relative;
  z-index: 1;
  isolation: isolate;
  min-height: 100vh;
  background: var(--t-bg);
  color: var(--t-ink);
  font-family: var(--t-body);
  font-size: 1rem;
  line-height: 1.55;
  overflow-x: hidden;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}

.lg *, .lg *::before, .lg *::after { box-sizing: border-box; }

.lg h1, .lg h2, .lg h3, .lg p, .lg ul, .lg ol, .lg figure, .lg table { margin: 0; }
.lg ul, .lg ol { padding: 0; list-style: none; }

/* Faint horizontal rules across the whole page, like ruled ledger paper seen
   through a screen. Cheap, and it holds the grain together between panels. */
.lg::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--lg-rule) 0px,
    var(--lg-rule) 1px,
    transparent 1px,
    transparent 7px
  );
  opacity: 0.5;
}

.lg-shell {
  position: relative;
  z-index: 1;
  max-width: 82rem;
  margin-inline: auto;
  padding: 0 clamp(0.75rem, 2.5vw, 2rem) 5rem;
}

.lg-mono {
  font-family: var(--t-data);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
}

/* ---- session bar ------------------------------------------------------- */

.lg-session {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 1.25rem;
  border-bottom: 1px solid var(--t-line);
  padding: 0.6rem 0;
  font-family: var(--t-data);
  font-size: 0.625rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
}

.lg-session b {
  color: var(--t-accent);
  font-weight: 500;
}

.lg-session-name {
  color: var(--t-ink);
  overflow-wrap: anywhere;
}

.lg-live {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--t-accent);
}

.lg-live i {
  width: 6px;
  height: 6px;
  background: var(--t-accent);
  display: block;
  animation: lg-pulse 2.2s steps(2, end) infinite;
}

@keyframes lg-pulse { 50% { opacity: 0.25; } }

/* ---- ticker ------------------------------------------------------------ */

.lg-tape {
  border-bottom: 1px solid var(--t-line);
  overflow: hidden;
  padding: 0.5rem 0;
}

.lg-tape-track {
  display: flex;
  width: max-content;
  animation: lg-tape 46s linear infinite;
}

.lg-tape-run {
  display: flex;
  gap: 2.5rem;
  padding-right: 2.5rem;
  white-space: nowrap;
  font-family: var(--t-data);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
}

.lg-tape-run b { color: var(--t-ink); font-weight: 500; }
.lg-tape-run span { color: var(--t-accent); }

@keyframes lg-tape { to { transform: translateX(-50%); } }

/* ---- panels ------------------------------------------------------------ */

.lg-panel {
  border: 1px solid var(--t-line);
  background: var(--t-surface);
  margin-top: 1.25rem;
}

.lg-panel-bar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--t-line);
  background: var(--lg-tint);
  font-family: var(--t-data);
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--t-accent);
}

.lg-panel-bar em { font-style: normal; color: var(--t-ink-soft); }

.lg-panel-body { padding: clamp(0.75rem, 2vw, 1.25rem); }

/* ---- hero -------------------------------------------------------------- */

.lg-hero {
  border-bottom: 1px solid var(--t-line);
  padding: clamp(2rem, 7vw, 4.5rem) 0 clamp(1.5rem, 4vw, 2.5rem);
}

.lg-hero-tag {
  font-family: var(--t-data);
  font-size: 0.625rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
  margin-bottom: 1rem;
}

.lg-hero h1 {
  font-family: var(--t-display);
  font-weight: 500;
  text-transform: uppercase;
  line-height: 0.92;
  letter-spacing: -0.02em;
  font-size: clamp(2.5rem, 13vw, 8.5rem);
  overflow-wrap: anywhere;
}

.lg-hero-first {
  display: block;
  font-size: 0.42em;
  letter-spacing: 0.12em;
  color: var(--t-ink-soft);
  margin-bottom: 0.35em;
}

.lg-hero-word { color: var(--t-accent); }

.lg-caret {
  display: inline-block;
  width: 0.42em;
  height: 0.78em;
  margin-left: 0.12em;
  background: var(--t-accent);
  vertical-align: baseline;
  animation: lg-blink 1.1s steps(2, end) infinite;
}

@keyframes lg-blink { 50% { opacity: 0; } }

.lg-hero-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: clamp(1.5rem, 4vw, 2.25rem);
}

.lg-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.6rem;
  background: var(--t-accent);
  color: var(--t-accent-ink);
  font-family: var(--t-data);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid var(--t-accent);
  transition: background-color 140ms linear, color 140ms linear;
}

.lg-cta:hover { background: transparent; color: var(--t-accent); }

.lg-hero-note {
  font-family: var(--t-data);
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  color: var(--t-ink-soft);
  max-width: 26rem;
}

/* ---- quote grid -------------------------------------------------------- */

.lg-quotes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  gap: 1px;
  background: var(--t-line);
  border: 1px solid var(--t-line);
  margin-top: 1.25rem;
}

.lg-quote {
  background: var(--t-surface);
  padding: 0.85rem 0.9rem 0.95rem;
}

.lg-quote-key {
  font-family: var(--t-data);
  font-size: 0.5625rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
}

.lg-quote-val {
  font-family: var(--t-display);
  font-size: clamp(1.75rem, 6vw, 2.6rem);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--t-ink);
  margin-top: 0.3rem;
}

.lg-quote-val.is-accent { color: var(--t-accent); }

.lg-quote-sub {
  font-family: var(--t-data);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
  margin-top: 0.35rem;
}

.lg-up { color: var(--lg-up); }
.lg-down { color: var(--lg-down); }

/* ---- tables ------------------------------------------------------------ */

.lg-scroll {
  max-height: 27rem;
  overflow-y: auto;
  overflow-x: hidden;
  border-top: 1px solid var(--t-line);
}

.lg-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-family: var(--t-data);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.lg-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--t-bg);
  border-bottom: 1px solid var(--t-line);
  padding: 0.45rem 0.4rem;
  text-align: right;
  font-weight: 500;
  font-size: 0.5625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
  white-space: nowrap;
}

.lg-table th:first-child, .lg-table td:first-child { text-align: left; padding-left: 0.7rem; }
.lg-table th:last-child, .lg-table td:last-child { padding-right: 0.7rem; }

.lg-sort {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: inherit;
}

.lg-sort:hover { color: var(--t-accent); }
.lg-sort[data-active="true"] { color: var(--t-accent); }
.lg-sort i { font-style: normal; opacity: 0.7; }

.lg-table td {
  padding: 0.3rem 0.4rem;
  text-align: right;
  border-bottom: 1px solid var(--lg-rule);
  color: var(--t-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lg-table tbody tr:hover td { background: var(--lg-tint); }
.lg-idx { color: var(--t-ink-soft); }
.lg-flock { color: var(--t-signal); }
.lg-dash { color: var(--t-ink-soft); }

.lg-face { display: inline-flex; align-items: center; gap: 0.35rem; justify-content: flex-end; }

/* ---- horizon ladder ---------------------------------------------------- */

.lg-ladder-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

@media (min-width: 46rem) {
  .lg-ladder-wrap { grid-template-columns: 13rem minmax(0, 1fr); align-items: start; }
}

.lg-big {
  font-family: var(--t-display);
  font-size: clamp(3rem, 12vw, 4.75rem);
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: -0.05em;
  color: var(--t-accent);
}

.lg-big-sub {
  font-family: var(--t-data);
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
  margin-top: 0.5rem;
}

.lg-ladder { display: grid; gap: 1px; }

.lg-rung {
  display: grid;
  grid-template-columns: 4.6rem 1fr 2.4rem;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--t-data);
  font-size: 0.5625rem;
  letter-spacing: 0.08em;
  color: var(--t-ink-soft);
  height: 14px;
}

.lg-rung-bar {
  height: 7px;
  border: 1px solid var(--t-line);
  position: relative;
}

.lg-rung-fill { position: absolute; inset: 0 auto 0 0; background: var(--t-signal); }
.lg-rung.is-open .lg-rung-fill { display: none; }
.lg-rung.is-open { color: var(--t-ink-soft); }
.lg-rung.is-covered { color: var(--t-ink); }
.lg-rung-flag { text-align: right; }
.lg-rung.is-covered .lg-rung-flag { color: var(--t-signal); }

/* ---- ratio bars -------------------------------------------------------- */

.lg-ratio { display: grid; gap: 0.9rem; }

.lg-ratio-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.3rem;
}

.lg-ratio-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-family: var(--t-data);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
}

.lg-ratio-head b { color: var(--t-ink); font-weight: 500; font-size: 0.8125rem; }

.lg-ratio-track {
  height: 18px;
  border: 1px solid var(--t-line);
  position: relative;
  background: repeating-linear-gradient(
    90deg, var(--lg-rule) 0 1px, transparent 1px 12px
  );
}

.lg-ratio-fill { position: absolute; inset: 0 auto 0 0; background: var(--t-accent); }
.lg-ratio-fill.is-signal { background: var(--t-signal); }

/* ---- delta ------------------------------------------------------------- */

.lg-delta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.75rem 1.5rem;
}

.lg-delta-fig {
  font-family: var(--t-display);
  font-size: clamp(2rem, 9vw, 3.5rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
}

/* ---- prose ------------------------------------------------------------- */

.lg-entry h2 {
  font-family: var(--t-display);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 1.06;
  font-size: clamp(1.4rem, 4.6vw, 2.5rem);
  color: var(--t-ink);
  overflow-wrap: anywhere;
}

.lg-entry h2 em { font-style: normal; color: var(--t-accent); }

.lg-entry p {
  margin-top: 0.85rem;
  color: var(--t-ink-soft);
  font-size: 1rem;
  max-width: 42rem;
}

.lg-entry.is-split { display: grid; gap: 1rem; }

@media (min-width: 46rem) {
  .lg-entry.is-split { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 2.5rem; }
  .lg-entry.is-split p { margin-top: 0.35rem; }
}

.lg-entry.is-centered { text-align: center; }
.lg-entry.is-centered p { margin-inline: auto; }

.lg-entry.is-banner {
  border-block: 1px solid var(--t-accent);
  padding-block: clamp(1.25rem, 4vw, 2.25rem);
  background: var(--lg-tint);
}

/* ---- commitments ------------------------------------------------------- */

.lg-commit {
  display: grid;
  gap: 1px;
  background: var(--t-line);
  border: 1px solid var(--t-line);
  margin-top: 1.25rem;
}

.lg-commit > li { background: var(--t-surface); padding: clamp(1rem, 3vw, 1.75rem); }

.lg-commit h3 {
  font-family: var(--t-display);
  font-weight: 500;
  text-transform: uppercase;
  font-size: clamp(1.15rem, 3.6vw, 1.7rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
  margin-top: 0.5rem;
  color: var(--t-ink);
}

.lg-commit p { margin-top: 0.7rem; color: var(--t-ink-soft); max-width: 44rem; }

.lg-key {
  font-family: var(--t-data);
  font-size: 0.5625rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--t-accent);
}

.lg-link {
  color: var(--t-accent);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
}

.lg-link:hover { color: var(--t-ink); }

.lg-handles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin-top: 0.9rem;
  font-family: var(--t-data);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

/* ---- empty book -------------------------------------------------------- */

.lg-empty p { color: var(--t-ink-soft); max-width: 40rem; margin-top: 0.8rem; }

.lg-empty-fig {
  font-family: var(--t-display);
  font-size: clamp(3rem, 14vw, 6rem);
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 0.9;
  color: var(--t-ink-soft);
}

/* ---- foot -------------------------------------------------------------- */

.lg-foot {
  margin-top: 2.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--t-line);
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.5rem;
  font-family: var(--t-data);
  font-size: 0.5625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--t-ink-soft);
}

.lg :where(a, button, [tabindex]):focus-visible {
  outline: 2px solid var(--t-accent);
  outline-offset: 2px;
}

@media (max-width: 30rem) {
  .lg-table { font-size: 0.6875rem; }
  .lg-table th { font-size: 0.5rem; letter-spacing: 0.1em; }
  .lg-table td, .lg-table th { padding-inline: 0.25rem; }
  .lg-rung { grid-template-columns: 4rem 1fr 1.9rem; }
}

@media (prefers-reduced-motion: reduce) {
  .lg-tape-track { animation: none; width: 100%; }
  .lg-tape-run { white-space: normal; flex-wrap: wrap; }
  .lg-caret, .lg-live i { animation: none; }
}
`;
