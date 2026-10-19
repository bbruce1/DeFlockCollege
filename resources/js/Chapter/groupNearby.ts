/**
 * Marks that sit on top of each other on screen, gathered into groups.
 *
 * Grouping is by screen distance, not by real distance, so it follows the zoom:
 * two campuses that are one blot on the whole country come apart once the map
 * is close enough to show them separately.
 *
 * Grouping is transitive. If A touches B and B touches C, all three are one
 * group even when A and C are apart, because the three rings still read as a
 * single smear and any one of them alone would be hidden by the others.
 *
 * Returns each group as the marks' indices, in the order they were given.
 */
export function groupNearby(points: { x: number; y: number }[], radius: number): number[][] {
    const parent = points.map((_, index) => index);

    const root = (index: number): number => {
        while (parent[index] !== index) {
            parent[index] = parent[parent[index]];
            index = parent[index];
        }

        return index;
    };

    for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
            if (Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y) < radius) {
                parent[root(b)] = root(a);
            }
        }
    }

    const groups = new Map<number, number[]>();

    points.forEach((_, index) => {
        const key = root(index);
        groups.set(key, [...(groups.get(key) ?? []), index]);
    });

    return [...groups.values()];
}

/** The middle of a group, where its count is shown. */
export function centreOf(points: { x: number; y: number }[], members: number[]): { x: number; y: number } {
    const x = members.reduce((sum, index) => sum + points[index].x, 0) / members.length;
    const y = members.reduce((sum, index) => sum + points[index].y, 0) / members.length;

    return { x, y };
}
