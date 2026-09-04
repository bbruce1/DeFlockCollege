import type { Reader } from '../contract';

/**
 * Polar maths for the scope.
 *
 * The station treats the campus as the origin and every reader as a contact at a
 * bearing and a range. OpenStreetMap gives each reader a compass heading, which
 * is the unusual part of this dataset, so a contact carries two angles: the
 * bearing from campus TO the camera, and the direction the camera itself faces.
 */

export const SECTOR_COUNT = 24;
export const SECTOR_DEGREES = 360 / SECTOR_COUNT;

/** The reader space is 0-1000 tall and 1000 * aspect wide. */
const SPACE_HEIGHT = 1000;

export interface Contact {
    index: number;
    /** Distance from the origin as a share of the frame's corner radius, 0 to 1. */
    range: number;
    /** Bearing from campus to the reader, degrees clockwise from north. */
    bearing: number;
    /** Direction the camera faces, or -1 when the map records no heading. */
    heading: number;
    isFlock: boolean;
}

export function normaliseDegrees(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
}

export function frameWidth(aspect: number): number {
    return SPACE_HEIGHT * (aspect > 0 ? aspect : 1);
}

/** Screen point for a bearing and radius, north up and bearings running clockwise. */
export function polar(centre: number, bearing: number, radius: number): { x: number; y: number } {
    const radians = (bearing * Math.PI) / 180;

    return {
        x: centre + Math.sin(radians) * radius,
        y: centre - Math.cos(radians) * radius,
    };
}

export function toContacts(readers: Reader[], aspect: number): Contact[] {
    const centreX = frameWidth(aspect) / 2;
    const centreY = SPACE_HEIGHT / 2;
    // Corner distance, so every reader in the frame lands inside the outer ring
    // and the rings mean a fixed fraction of the framed area rather than drifting
    // with whichever campus happens to have the furthest camera.
    const frameRadius = Math.hypot(centreX, centreY) || 1;

    return readers.map((reader, index) => {
        const [x, y, heading, isFlock] = reader;
        const dx = x - centreX;
        const dy = y - centreY;

        return {
            index,
            range: Math.min(Math.hypot(dx, dy) / frameRadius, 1),
            bearing: normaliseDegrees((Math.atan2(dx, -dy) * 180) / Math.PI),
            heading: heading >= 0 ? normaliseDegrees(heading) : -1,
            isFlock: isFlock === 1,
        };
    });
}

/** Which 15 degree sectors of the horizon a camera is pointed into. */
export function coveredSectors(contacts: Contact[]): Set<number> {
    const sectors = new Set<number>();

    for (const contact of contacts) {
        if (contact.heading >= 0) {
            sectors.add(Math.floor(contact.heading / SECTOR_DEGREES) % SECTOR_COUNT);
        }
    }

    return sectors;
}

const COMPASS_POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function compassPoint(bearing: number): string {
    return COMPASS_POINTS[Math.round(normaliseDegrees(bearing) / 22.5) % 16];
}

export function padBearing(bearing: number): string {
    return String(Math.round(normaliseDegrees(bearing))).padStart(3, '0');
}
