import type { PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, note, shout, tag } from '@/Posts/kit';

/**
 * "Wait, it cooked?": the plate reader is not only working for the police.
 *
 * The hook baits the reader into a rare compliment for a camera — it finds
 * stolen cars. The turn is who else buys the scans, and that the one getting
 * cooked might be you. This family names a real company, so every factual line
 * sits beside the page it came from, and it only says what those pages say:
 * DRN, not Motorola, is the one selling to insurers, and Motorola is described
 * as DRN's owner exactly as the press release and the EFF put it. Nobody is
 * accused of anything — the only bait is the headline.
 *
 * If any source below changes or disappears, the line it supports comes out
 * rather than being reworded to survive.
 */

/** Printed in full at the foot of the caption, so anybody can check a line before sharing it. */
const SOURCES = [
    'Motorola Solutions, Jan 7 2019: motorolasolutions.com/newsroom/press-releases/motorola-solutions-acquires-vaas-international-holdings-leader-in-data-and-.html',
    'DRN: drndata.com/insurance',
    'EFF, "Privacy Harm Is Harm", Oct 2025: eff.org/deeplinks/2025/10/privacy-harm-harm',
    'Wired, Oct 3 2024: wired.com/story/license-plate-readers-political-signs-bumper-stickers',
];

// https://drndata.com/insurance/ — "Identify stolen vehicles sooner with LPR
// matching and alerts that help support faster investigations and claim resolution."
const STOLEN_VEHICLE_PITCH = 'LPR matching and alerts';

// https://drndata.com/insurance/ — "Identify garaging discrepancies by comparing
// reported policy information with available vehicle location insights to
// support accurate policy pricing."
const GARAGING_PITCH_SHORT = 'reported policy information with available vehicle location insights';

const CAMERA = { photo: '/posts/insurance/camera.jpg', credit: 'Photo: Varpxt / CC0' };
const GLASS = { photo: '/posts/insurance/glass.jpg', credit: 'Photo: Theonlysilentbob / CC BY-SA 3.0' };
const LOT = { photo: '/posts/insurance/lot.jpg', credit: 'Photo: Birdman of Rhode Island / CC0' };
const TOW = { photo: '/posts/insurance/tow.jpg', credit: 'Photo: Tdorante10 / CC BY-SA 4.0' };

/** The chapter's surveyed count as a sentence, or null before the survey — never a nought. */
function nearbySentence(input: PostInput): string | null {
    const nearby = input.readersWithinMile;

    if (typeof nearby !== 'number' || nearby <= 0) {
        return null;
    }

    return nearby === 1
        ? `1 plate reader mapped within a mile of ${input.shortName}`
        : `${count(nearby)} plate readers mapped within a mile of ${input.shortName}`;
}

function caption(input: PostInput): string {
    const nearby = nearbySentence(input);

    return [
        'wait it finds stolen cars??',
        // https://www.eff.org/deeplinks/2025/10/privacy-harm-harm — "Its customers include
        // law enforcement agencies and private companies, such as insurers, lenders, and
        // repossession firms."
        "nope, you're cooked. DRN's customers include insurers, lenders and repo firms 💀",
        nearby,
        ['sources:', ...SOURCES.map((source) => `• ${source}`)].join('\n'),
        input.address,
    ]
        .filter((line): line is string => line !== null)
        .join('\n\n');
}

const family: PostFamily = (input) => [
    {
        id: 'insurance-caught-stealing',
        kind: 'info',
        purpose: 'Baits a rare compliment for a camera, then shows the plate-scan business selling to insurers. Every fact is sourced in the caption.',
        caption: caption(input),
        slides: [
            {
                id: 'insurance-caught-stealing-1',
                ...CAMERA,
                tint: 'duotone',
                focus: [0.72, 0.5],
                alt: 'A Motorola license plate reader camera on a pole, with the words: the plate camera finds stolen cars. Wait, it cooked?',
                blocks: [
                    tag('The plate camera finds stolen cars'),
                    hook('Wait, it cooked?'),
                ],
            },
            {
                id: 'insurance-caught-stealing-2',
                ...LOT,
                tint: 'wash',
                focus: [0.5, 0.4],
                alt: 'A plate reader on a pole above a university parking lot. Text: no, you\'re cooked. DRN offers insurers a check of your policy address against where your car is seen.',
                blocks: [
                    shout("No. You're cooked.", { at: 'upper', size: 'big' }),
                    // https://drndata.com/insurance/ — see GARAGING_PITCH;
                    // https://www.eff.org/deeplinks/2025/10/privacy-harm-harm for the subsidiary.
                    note(
                        'DRN, a Motorola Solutions subsidiary, pitches car insurers a way of comparing '
                        + `“${GARAGING_PITCH_SHORT}.” insured at home, parked at school? 💀`,
                        { at: 'bottom' },
                    ),
                ],
            },
            {
                id: 'insurance-caught-stealing-3',
                ...GLASS,
                tint: 'duotone',
                focus: [0.5, 0.6],
                alt: 'Broken car-window glass on an empty parking space at night. Text: who is buying: insurers, lenders and repo firms, and stolen-car alerts for insurers.',
                blocks: [
                    tag('Who else is buying'),
                    // https://www.eff.org/deeplinks/2025/10/privacy-harm-harm for the customers;
                    // https://drndata.com/insurance/ for the quote.
                    note(
                        'the EFF says DRN’s customers include insurers, lenders and repo firms. '
                        + `the stolen-car part? pitched to insurers as “${STOLEN_VEHICLE_PITCH}” lol`,
                    ),
                ],
            },
            {
                id: 'insurance-caught-stealing-4',
                ...TOW,
                tint: 'wash',
                focus: [0.42, 0.5],
                alt: 'A flatbed tow truck carrying an SUV down a city street. Text: repo trucks, with cameras. DRN\'s scans also reach police through Vigilant.',
                blocks: [
                    tag('Where the scans come from'),
                    shout('Repo trucks, with cameras', { at: 'upper', size: 'big' }),
                    // https://www.wired.com/story/license-plate-readers-political-signs-bumper-stickers/
                    // — "partly fueled by DRN “affiliates” … such as repossession trucks" and
                    // "Images in DRN’s commercial database are shared with police using its Vigilant system".
                    note(
                        'Wired says DRN’s database is partly fed by cameras on repo trucks, '
                        + 'and its scans get shared with police through Vigilant, '
                        + 'Motorola’s law-enforcement arm 🚨',
                        { at: 'bottom' },
                    ),
                ],
            },
        ],
    },
];

export default family;
