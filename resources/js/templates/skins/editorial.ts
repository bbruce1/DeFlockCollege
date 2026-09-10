/**
 * Editorial and print.
 *
 * Eight looks borrowed from things that were actually printed: paperback
 * imprints, duplicated pamphlets, concert programmes, the plate section bound
 * into the middle of a hardback. Each palette comes from one identifiable
 * artefact rather than from a general idea of "print", because the general idea
 * of print is beige paper and a serif, and that is not a design.
 *
 * Colour is punctuation here. Most of these pages are two neutrals and one
 * saturated hue, and the saturated hue is spent on a single thing at a time.
 */

import type { Skin } from '../skins';

const ARCHIVO = '"Archivo Variable", "Archivo", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const SERIF = 'ui-serif, Georgia, "Times New Roman", serif';

export const skins: Skin[] = [
    /**
     * Pelican Books, 1937. Pale blue-grey boards, a petrol band across the
     * top, humanist sans on the cover and a book face inside — the look of
     * public education sold for sixpence, which is roughly the errand here.
     */
    {
        id: 'ed-pelican',
        bg: '#c7d8db', surface: '#e4eded', line: '#a3bbbe',
        ink: '#10201f', inkSoft: '#42585a',
        accent: '#14415c', accentInk: '#ffffff', signal: '#b0182b',
        display: ARCHIVO, body: SERIF, data: MONO,
        heroShape: 'banner', texture: 'none', radius: 0, upperLabels: true,
    },

    /**
     * A risograph pamphlet on newsprint. Two drums, so two inks: federal blue
     * does the structural work and fluorescent pink is held back for the
     * cameras, where a colour that cannot be mistaken for typography is
     * exactly what is wanted. The dots are the halftone the machine leaves.
     */
    {
        id: 'ed-riso',
        bg: '#dedbd2', surface: '#efece4', line: '#bab7ac',
        ink: '#1b1b19', inkSoft: '#5a574e',
        accent: '#2b4b8c', accentInk: '#ffffff', signal: '#c4005e',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'split', texture: 'dots', radius: 0, upperLabels: true,
    },

    /**
     * The sage-green spine of a mid-century modern-classics paperback. The
     * green is the whole identity, so nothing else is allowed to be loud; the
     * aubergine accent sits opposite it on the wheel and stays put.
     */
    {
        id: 'ed-modernclassic',
        bg: '#c6d1b9', surface: '#e0e7d7', line: '#a1af92',
        ink: '#14180f', inkSoft: '#4a5340',
        accent: '#4a2545', accentInk: '#ffffff', signal: '#9e1230',
        display: SERIF, body: ARCHIVO, data: MONO,
        heroShape: 'stack', texture: 'none', radius: 2, upperLabels: false,
    },

    /**
     * Spirit-duplicated samizdat: typescript, aniline purple, paper that has
     * gone faintly lilac from the solvent. Monospaced display because the
     * original had no display face — whoever set it had a typewriter and a
     * deadline. The noise is the uneven transfer of a ditto master.
     */
    {
        id: 'ed-samizdat',
        bg: '#e4e1e6', surface: '#f3f1f5', line: '#c3bfca',
        ink: '#221c2b', inkSoft: '#5c5568',
        accent: '#47276f', accentInk: '#ffffff', signal: '#c1003a',
        display: SERIF, body: SERIF, data: MONO,
        heroShape: 'stack', texture: 'noise', radius: 0, upperLabels: true,
    },

    /**
     * A letterpress concert programme on dove card: bottle green, deep
     * margins, everything set in one family at three sizes. Figures stay in
     * the book face rather than switching to mono, because a programme lists
     * its numbers in the same voice it lists everything else.
     */
    {
        id: 'ed-programme',
        bg: '#d7d9d3', surface: '#ebece7', line: '#aab0a8',
        ink: '#131917', inkSoft: '#4b5654',
        accent: '#17453a', accentInk: '#ffffff', signal: '#af1d2f',
        display: SERIF, body: SERIF, data: SERIF,
        heroShape: 'number-first', texture: 'none', radius: 0, upperLabels: true,
    },

    /**
     * A gallery catalogue: cool graphite board, brass foil on the cover, plate
     * captions in sans and the essay in a book face. The brass is a stamped
     * surface, not a highlight, so it appears once per screen at most.
     */
    {
        id: 'ed-vitrine',
        bg: '#191c20', surface: '#22262b', line: '#343a41',
        ink: '#eceef1', inkSoft: '#9aa3ad',
        accent: '#c9ac70', accentInk: '#17130b', signal: '#ff2d5e',
        display: ARCHIVO, body: SERIF, data: MONO,
        heroShape: 'split', texture: 'none', radius: 0, upperLabels: false,
    },

    /**
     * The glossy plate section bound into the middle of a hardback — coated
     * stock, a photogravure grey pulled up around the images, captions in small
     * sans. Mid grey rather than black: the ground is there to make a
     * photograph look printed, not to look like a dark interface.
     */
    {
        id: 'ed-plate',
        bg: '#3b3f42', surface: '#4a4f53', line: '#5e6469',
        ink: '#f4f5f6', inkSoft: '#bec3c7',
        accent: '#e8e6e0', accentInk: '#26292b', signal: '#ffb627',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'banner', texture: 'noise', radius: 3, upperLabels: false,
    },

    /**
     * A bound volume of a journal: oxblood cloth, gilt on the spine, the year
     * stamped larger than the title. Gilt is the accent and it is warm and
     * low-chroma, which is why the camera signal is a flat bright red — the one
     * colour on the page that could not have come from a bindery.
     */
    {
        id: 'ed-oxblood',
        bg: '#241419', surface: '#2e1b21', line: '#452830',
        ink: '#f2e9e6', inkSoft: '#b79e9e',
        accent: '#d8c79c', accentInk: '#1c1216', signal: '#ff5252',
        display: SERIF, body: SERIF, data: MONO,
        heroShape: 'number-first', texture: 'none', radius: 1, upperLabels: true,
    },
];
