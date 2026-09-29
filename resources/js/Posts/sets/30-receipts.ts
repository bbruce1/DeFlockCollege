import type { PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, shout, sub, tag } from '@/Posts/kit';

/**
 * Receipts: Flock Safety's own words, then what they leave out.
 *
 * Every line in quotation marks is copied character for character from a live
 * flocksafety.com page, with the page noted beside it. That is the whole trick:
 * the company cannot argue with these posts without arguing with its website.
 * If a page changes and a line no longer appears there, the post comes out —
 * it is never reworded to keep it alive, because a paraphrase in quote marks is
 * the one mistake this family cannot survive. Our own jokes about what a line
 * means ("Flock, basically") never wear quote marks.
 */

const PRIVACY_PAGE = 'flocksafety.com/trust/data-privacy';
const CAMPUS_PAGE = 'flocksafety.com/industries/education-campus';

// https://www.flocksafety.com/trust/data-privacy — the FAQ "Is Flock's LPR
// system mass surveillance?" answers: "In plain terms: Not everyone, not all the time."
const NOT_EVERYONE = 'Not everyone,';
const NOT_ALL_THE_TIME = 'not all the time.';

// https://www.flocksafety.com/industries/education-campus — section heading.
const PERIMETER_OPENING = 'Protect the Perimeter';
const PERIMETER_CLOSING = '24/7';

// https://www.flocksafety.com/trust/data-privacy — "That means: It captures vehicles. Not people."
const VEHICLES_OPENING = 'It captures vehicles.';
const VEHICLES_CLOSING = 'Not people.';

const HILLS = { photo: '/posts/receipts/hills.jpg', credit: 'Photo: Tony Webster / CC BY 4.0' };
const NIGHT = { photo: '/posts/receipts/night.jpg', credit: 'Photo: Themis3000 / CC0' };
const SOLAR = { photo: '/posts/receipts/solar.jpg', credit: 'Photo: MiracleMiles / CC BY 4.0' };
const PASSING = { photo: '/posts/receipts/passing.jpg', credit: 'Photo: Themis3000 / CC0' };

/** "(theres 52 within a mile of campus btw)" as a caption line, or nothing before the survey. */
function nearbyLine(input: PostInput): string {
    const nearby = input.readersWithinMile;

    if (typeof nearby !== 'number' || nearby <= 0) {
        return '';
    }

    return nearby === 1
        ? `(theres 1 within a mile of campus btw)\n\n`
        : `(theres ${count(nearby)} within a mile of campus btw)\n\n`;
}

const family: PostFamily = (input) => [
    {
        id: 'receipts-all-the-time',
        kind: 'meme',
        purpose: 'Flock denies mass surveillance, then sells colleges the same cameras running 24/7. Both lines are theirs.',
        caption:
            `flock on whether its mass surveillance: "${NOT_EVERYONE} ${NOT_ALL_THE_TIME}"\n`
            + `flock selling it to colleges: "${PERIMETER_OPENING} ${PERIMETER_CLOSING}"\n\n`
            + 'pick one bro 💀 both are on their own website\n\n'
            + nearbyLine(input)
            + `sources: ${PRIVACY_PAGE} + ${CAMPUS_PAGE}\n`
            + input.address,
        slides: [
            {
                id: 'receipts-all-the-time-1',
                ...HILLS,
                tint: 'duotone',
                // The camera and its panel hang in the sky; the quote goes down
                // on the empty hills beneath them.
                focus: [0.75, 0.5],
                alt: `A Flock license plate camera on a pole above empty hills, captioned: Flock swears it's not mass surveillance. "${NOT_EVERYONE} ${NOT_ALL_THE_TIME}"`,
                blocks: [
                    tag('Flock swears it\'s not mass surveillance'),
                    shout(`“${NOT_EVERYONE} ${NOT_ALL_THE_TIME}”`),
                ],
            },
            {
                id: 'receipts-all-the-time-2',
                ...NIGHT,
                tint: 'wash',
                focus: [0.35, 0.5],
                alt: `A Flock camera on a street pole at night, captioned: also Flock, to colleges. "${PERIMETER_OPENING} ${PERIMETER_CLOSING}" Pick a lane.`,
                blocks: [
                    tag('Also Flock, to colleges'),
                    sub(`“${PERIMETER_OPENING}\n${PERIMETER_CLOSING}”`, { at: 'upper' }),
                    hook('Pick a lane'),
                ],
            },
        ],
    },
    {
        id: 'receipts-not-people',
        kind: 'meme',
        purpose: 'Flock says its cameras capture vehicles, not people. Lands on what that is: location tracking, with the police as the parents.',
        caption:
            `"${VEHICLES_OPENING} ${VEHICLES_CLOSING}" ok and who do they think is driving 💀\n\n`
            + 'every car it logs has a person in it. thats the whole point\n\n'
            + nearbyLine(input)
            + `source: ${PRIVACY_PAGE}\n`
            + input.address,
        slides: [
            {
                id: 'receipts-not-people-1',
                ...SOLAR,
                tint: 'duotone',
                // The camera hangs low in this frame, so the whole quote goes up
                // top over the sky and the panel.
                focus: [0.45, 0.5],
                alt: `A Flock license plate camera under its solar panel, captioned with Flock's privacy page: "${VEHICLES_OPENING} ${VEHICLES_CLOSING}"`,
                blocks: [
                    tag('Nah, Flock really said'),
                    shout(`“${VEHICLES_OPENING} ${VEHICLES_CLOSING}”`, { at: 'upper' }),
                ],
            },
            {
                id: 'receipts-not-people-2',
                ...PASSING,
                tint: 'wash',
                focus: [0.6, 0.5],
                // The car crossing the frame is the one being tracked, so the
                // words stay above it in the sky and the trees.
                alt: 'A car driving past a Flock camera pole on a snowy street, captioned: so it\'s Life360, but the cops are your parents.',
                blocks: [
                    tag('So it\'s Life360'),
                    hook('But the cops are your parents', { at: 'upper' }),
                ],
            },
        ],
    },
];

export default family;
