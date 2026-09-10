/**
 * Civic and collegiate looks.
 *
 * The family a chapter wears when the reader is a city councilmember rather
 * than another student: city hall stationery, park signage, posted ordinances,
 * union banners, the campus's own maroon and gold, the card catalogue, the
 * student paper. Each palette is taken from a real printed object, because a
 * page that looks invented reads as a stunt and a page that looks issued reads
 * as a constituent.
 *
 * Light and mid-toned throughout: the rest of the set skews dark, and a dark
 * page is the wrong register for a public notice.
 */

import type { Skin } from '../skins';

const ARCHIVO = '"Archivo Variable", "Archivo", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const SERIF = 'ui-serif, Georgia, "Times New Roman", serif';

export const skins: Skin[] = [
    /**
     * Blue and buff: the colours of official letterhead and bond paper. Sans
     * headings over a serif body is how a memo from the clerk's office is set.
     */
    {
        id: 'cv-townhall',
        bg: '#e6e3d9', surface: '#f7f5ef', line: '#c2bcab',
        ink: '#191b20', inkSoft: '#565b66',
        accent: '#1d3f72', accentInk: '#ffffff', signal: '#c1272d',
        display: ARCHIVO, body: SERIF, data: MONO,
        heroShape: 'banner', texture: 'none', radius: 2, upperLabels: true,
    },
    /**
     * Routed park-department signage: white lettering cut into a deep enamel
     * green, mounted against the pale sage of weathered post and lawn.
     */
    {
        id: 'cv-parkboard',
        bg: '#dce5da', surface: '#eef3ec', line: '#adbfaa',
        ink: '#13231a', inkSoft: '#4c6053',
        accent: '#1e5631', accentInk: '#ffffff', signal: '#cf2417',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'split', texture: 'none', radius: 4, upperLabels: true,
    },
    /**
     * A student paper: newsprint grey, black type, and press red kept for the
     * one thing on the page that is news. The accent is the ink, not a hue,
     * which is why the red stays free for the cameras.
     */
    {
        id: 'cv-broadsheet',
        bg: '#e9e6df', surface: '#f5f3ee', line: '#c8c3b8',
        ink: '#171614', inkSoft: '#56534c',
        accent: '#1a1a17', accentInk: '#f2f0ea', signal: '#cf1f24',
        display: SERIF, body: SERIF, data: MONO,
        heroShape: 'stack', texture: 'noise', radius: 0, upperLabels: false,
    },
    /**
     * The card catalogue: typewritten drawer cards in a drab olive stock, and
     * the violet of a date-due stamp. Monospace display is the typewriter.
     */
    {
        id: 'cv-datestamp',
        bg: '#e3e2d4', surface: '#f2f1e8', line: '#bfbdaa',
        ink: '#1b1a15', inkSoft: '#5c5a4d',
        accent: '#4b2e83', accentInk: '#ffffff', signal: '#b3141f',
        display: SERIF, body: SERIF, data: MONO,
        heroShape: 'number-first', texture: 'dots', radius: 0, upperLabels: true,
    },
    /**
     * City seal and charter: the deep engraving teal of a municipal crest on
     * pale blue-grey document stock. The only skin here with soft corners,
     * because a seal is round and the rest of the family is not.
     */
    {
        id: 'cv-charter',
        bg: '#e2e9ec', surface: '#f3f7f8', line: '#b7c6cc',
        ink: '#101a1e', inkSoft: '#4c5e67',
        accent: '#0f4c5c', accentInk: '#ffffff', signal: '#cc2936',
        display: SERIF, body: ARCHIVO, data: MONO,
        heroShape: 'split', texture: 'dots', radius: 8, upperLabels: false,
    },
    /**
     * A union banner: gold on a deep indigo field. The one mid-toned member of
     * the family, kept lighter than the dark skins elsewhere in the set so it
     * still reads as fabric rather than as a terminal.
     */
    {
        id: 'cv-unionhall',
        bg: '#23355c', surface: '#2c4070', line: '#44598c',
        ink: '#f1f4fb', inkSoft: '#a8b6d4',
        accent: '#e0a526', accentInk: '#1c1503', signal: '#ff6a5b',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'banner', texture: 'noise', radius: 4, upperLabels: true,
    },
    /**
     * Maroon and old gold on limestone. The gold is taken down until white
     * type sits on it safely, which is also where the colour stops looking
     * like a highlighter and starts looking like a diploma seal.
     */
    {
        id: 'cv-quadrangle',
        bg: '#eeeae2', surface: '#ffffff', line: '#d2cabb',
        ink: '#291418', inkSoft: '#6b5257',
        accent: '#7d6218', accentInk: '#ffffff', signal: '#c0202e',
        display: SERIF, body: ARCHIVO, data: MONO,
        heroShape: 'number-first', texture: 'none', radius: 2, upperLabels: true,
    },
    /**
     * Civic modernism: poured concrete, slate wayfinding plates, stencilled
     * headings. The sober end of the family, for a page that wants to look
     * like the building it is complaining about.
     */
    {
        id: 'cv-plaza',
        bg: '#c9cac4', surface: '#dcdcd7', line: '#a4a69f',
        ink: '#15181a', inkSoft: '#4b4f52',
        accent: '#33474f', accentInk: '#ffffff', signal: '#c8102e',
        display: ARCHIVO, body: ARCHIVO, data: MONO,
        heroShape: 'banner', texture: 'grid', radius: 0, upperLabels: true,
    },
];
