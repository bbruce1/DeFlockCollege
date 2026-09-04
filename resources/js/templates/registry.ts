import type { ComponentType } from 'react';
import type { TemplateProps } from './contract';

/**
 * The template registry.
 *
 * A chapter is assigned one of these by a seed derived from its slug, so the
 * assignment is stable without anything being stored, and two schools with the
 * same data still get visually different pages.
 *
 * Templates are loaded lazily: a visitor downloads the one their chapter uses,
 * not all ten. That matters because the whole point is that they share no code.
 */
export const TEMPLATE_NAMES = [
    'Terminal',
    'Dossier',
    'Signal',
    'Blueprint',
    'Broadcast',
    'Manifest',
    'Circuit',
    'Surveil',
    'Ledger',
    'Wireframe',
] as const;

export type TemplateName = (typeof TEMPLATE_NAMES)[number];

/** FNV-1a. Small and well distributed over short slugs. */
export function hashSlug(slug: string): number {
    let hash = 0x811c9dc5;

    for (let i = 0; i < slug.length; i += 1) {
        hash ^= slug.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    return hash >>> 0;
}

export function templateFor(slug: string): TemplateName {
    return TEMPLATE_NAMES[hashSlug(slug) % TEMPLATE_NAMES.length];
}

/**
 * Vite needs a statically analysable glob, so the map is built from one rather
 * than from a dynamic path.
 */
const modules = import.meta.glob<{ default: ComponentType<TemplateProps> }>(
    './*/index.tsx',
);

export function loadTemplate(name: TemplateName) {
    const loader = modules[`./${name}/index.tsx`];

    if (!loader) {
        throw new Error(
            `Template "${name}" is in the registry but has no index.tsx. Every name in ` +
                'TEMPLATE_NAMES must have a folder beside it.',
        );
    }

    return loader;
}
