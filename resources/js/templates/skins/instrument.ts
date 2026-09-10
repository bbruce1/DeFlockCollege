/**
 * Instruments and utility hardware.
 *
 * Eight looks borrowed from things built to be read rather than admired: a
 * cockpit altimeter, a survey monument, a lathe, a safety placard, a signalling
 * panel, a bench of laboratory glass, a strip-chart recorder, and a street
 * marked up by a utility locator. Each palette is taken from one artefact and
 * kept there — the ochre is the lathe's enamel, the salmon is chart paper, the
 * blue is APWA locate paint — because a palette that belongs to something reads
 * as deliberate in a way a tuned hue never does.
 *
 * Colour here does work. On equipment it means gas, or water, or stop, so these
 * skins spend it sparingly and leave the alert colour alone: `signal` marks the
 * cameras and nothing else.
 */

import type { Skin } from '../skins';

// The three stacks the templates load. Duplicated rather than imported because
// skins.ts does not export them, and a contributed family must not edit shared
// code — several of these files land at once.
const ARCHIVO = '"Archivo Variable", "Archivo", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const SERIF = 'ui-serif, Georgia, "Times New Roman", serif';

export const skins: Skin[] = [
    /**
     * Aircraft instrument panel: matte cool black dial, aged radium markings,
     * and the fluorescent orange reserved for the pointer that means act now.
     */
    {
        id: 'in-altimeter',
        bg: '#14171b', surface: '#1e242a', line: '#333d46',
        ink: '#f0ead8', inkSoft: '#97a2ab',
        accent: '#c7d59b', accentInk: '#12151a', signal: '#ff6a1f',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'number-first', texture: 'none', radius: 2, upperLabels: true,
    },
    /**
     * A survey benchmark: a brass disc weathered into a concrete monument, its
     * legend stamped in caps because it has to survive a century of rain.
     */
    {
        id: 'in-benchmark',
        bg: '#d9d8d0', surface: '#e9e8e1', line: '#b0aea3',
        ink: '#1d1c17', inkSoft: '#55534a',
        accent: '#7a5a1c', accentInk: '#ffffff', signal: '#a52a19',
        display: ARCHIVO, body: SERIF, data: MONO,
        heroShape: 'banner', texture: 'noise', radius: 0, upperLabels: true,
    },
    /**
     * Machine-shop ochre: the oil-darkened enamel of an old engine lathe, with
     * cast lettering picked out in cream and the stop button left red.
     */
    {
        id: 'in-lathe',
        bg: '#241d12', surface: '#33291a', line: '#4e402a',
        ink: '#f4e8d0', inkSoft: '#b6a17e',
        accent: '#d9a441', accentInk: '#201a10', signal: '#ef4a2a',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'split', texture: 'none', radius: 4, upperLabels: true,
    },
    /**
     * An industrial safety placard, weathered. Yellow is the field here rather
     * than a highlight, because that is how the sign works — the black legend
     * panel is what the eye lands on, and one grotesque runs the whole card.
     */
    {
        id: 'in-placard',
        bg: '#e6c229', surface: '#faf3dd', line: '#b3941f',
        ink: '#17150c', inkSoft: '#5a4e14',
        accent: '#17150c', accentInk: '#ffffff', signal: '#c8102e',
        display: ARCHIVO, body: ARCHIVO, data: ARCHIVO,
        heroShape: 'stack', texture: 'none', radius: 0, upperLabels: true,
    },
    /**
     * A railway signalling panel: blue-grey steel, a lamp matrix for the track
     * diagram, and the pale blue-white of a route set. Body text is monospaced
     * because a panel's register is a log, not prose.
     */
    {
        id: 'in-signalbox',
        bg: '#17242c', surface: '#21323c', line: '#37505d',
        ink: '#e2edf3', inkSoft: '#92a7b3',
        accent: '#a9cfe2', accentInk: '#0e1a21', signal: '#ff4438',
        display: ARCHIVO, body: MONO, data: MONO,
        heroShape: 'split', texture: 'dots', radius: 0, upperLabels: true,
    },
    /**
     * Laboratory apparatus: bench white, the faint green in borosilicate, and
     * cobalt off a reagent bottle. The serif display is the apparatus
     * catalogue, which is where this equipment gets described.
     */
    {
        id: 'in-labware',
        bg: '#f6f8f6', surface: '#ffffff', line: '#ccd8d3',
        ink: '#16201c', inkSoft: '#5c6a65',
        accent: '#123b96', accentInk: '#ffffff', signal: '#c02f22',
        display: SERIF, body: ARCHIVO, data: MONO,
        heroShape: 'stack', texture: 'none', radius: 6, upperLabels: false,
    },
    /**
     * Strip-chart recorder paper: salmon stock, a printed grid, and a trace in
     * navy ink. The grid texture is the artefact rather than decoration, so the
     * numbers sit on it the way a plotted value does.
     */
    {
        id: 'in-recorder',
        bg: '#f7e6de', surface: '#fdf3ee', line: '#e2b3a0',
        ink: '#2b1a14', inkSoft: '#7d5c50',
        accent: '#243b6b', accentInk: '#ffffff', signal: '#b81f14',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'number-first', texture: 'grid', radius: 0, upperLabels: false,
    },
    /**
     * Utility locate marking: warm weathered asphalt, chalky stencil white, and
     * APWA blue for a water line. The colour is a code out there and it stays
     * one here.
     */
    {
        id: 'in-locate',
        bg: '#2c2b29', surface: '#38372f', line: '#4e4c47',
        ink: '#eeece7', inkSoft: '#a6a29a',
        accent: '#2f8bd6', accentInk: '#171614', signal: '#f04a24',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'banner', texture: 'noise', radius: 0, upperLabels: true,
    },
];
