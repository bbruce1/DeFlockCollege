import type { CSSProperties } from 'react';
import type { TemplateTokens } from '../../contract';

/**
 * A trading terminal at 04:00.
 *
 * Amber phosphor is the chrome — rules, headers, the CTA — because an amber
 * screen reads as instrumentation rather than as brand colour. Red is reserved
 * for the cameras and for a count that has risen; green only ever means a count
 * that has fallen. Nothing else in the palette carries meaning.
 */
export const LEDGER_TOKENS: TemplateTokens = {
    '--t-bg': '#060707',
    '--t-surface': '#0c0e0e',
    '--t-line': '#242322',
    '--t-ink': '#ebe4d6',
    '--t-ink-soft': '#8b8577',
    '--t-accent': '#ffb000',
    '--t-accent-ink': '#0a0800',
    '--t-signal': '#ff4b3e',
    '--t-display': '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    '--t-body': '"Archivo Variable", Archivo, system-ui, sans-serif',
    '--t-data': '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

/**
 * Not part of the shared token vocabulary: a book has a bid side and an ask
 * side, and no other template needs the concept.
 */
const LEDGER_ONLY = {
    '--lg-up': '#ff4b3e',
    '--lg-down': '#3fe08a',
    '--lg-rule': '#1a1918',
    '--lg-tint': 'rgba(255, 176, 0, 0.09)',
};

export const LEDGER_STYLE = { ...LEDGER_TOKENS, ...LEDGER_ONLY } as unknown as CSSProperties;
