import type { PostFamily, PostInput } from '@/Posts/postTemplates';
import { count, hook, shout, tag } from '@/Posts/kit';

/**
 * Hypocrisy: the rules Flock keeps for itself, next to the ones it keeps for you.
 *
 * Each post is an ironic reversal. Slide one sets up something reasonable
 * (police can find a plate, a website lets you decline cookies, a system warns
 * off intruders) and slide two shows the same rule does not run the other way
 * for the person driving past the camera.
 *
 * Every line about Flock is quoted from its own privacy notice, noted beside
 * each constant. If the page changes and a line is gone, the post comes out
 * rather than being reworded: a paraphrase in quote marks is the one thing
 * these cannot survive. Nothing here says Flock breaks a law; the joke is only
 * ever the asymmetry, and every caption lands on writing to the officials who
 * bought the cameras.
 */

const PRIVACY_PAGE = 'flocksafety.com/legal/privacy-policy';

// https://www.flocksafety.com/legal/privacy-policy — "Any license plate data
// that may be searched by authorized law enforcement requires justification to
// verify the legitimacy of the search and create an audit trail."
const POLICE_SEARCH = 'may be searched by authorized law enforcement';

// https://www.flocksafety.com/legal/privacy-policy — "As a result, Flock cannot
// verify the identity of individuals whose effects (i.e., license plates)
// appear in the Footage and are unable to process data subject requests
// related to such images."
const NO_REQUESTS = 'unable to process data subject requests related to such images';

// https://www.flocksafety.com/legal/privacy-policy — "You may change your
// cookie settings by selecting the “Your Cookie Choices” link at the bottom of
// this Privacy Notice."
const COOKIE_CHOICES = 'Your Cookie Choices';

// https://www.flocksafety.com/legal/privacy-policy — from the notice's
// "Disclosure" section on logging into the Site.
const UNAUTHORIZED_USE = 'Unauthorized use of the system is prohibited and subject to criminal and civil penalties';

const CRUISER = { photo: '/posts/hypocrisy/cruiser.jpg', credit: 'Photo: Vincent Hilary / CC BY-SA 4.0' };
const DUAL = { photo: '/posts/hypocrisy/dual.jpg', credit: 'Photo: Epicdeflocker64 / CC0' };
const COOKIES = { photo: '/posts/hypocrisy/cookies.jpg', credit: 'Photo: Mshuang2 / CC0' };
const STREET = { photo: '/posts/hypocrisy/street.jpg', credit: 'Photo: Bruxton / CC0' };
const AUTHORIZED = { photo: '/posts/hypocrisy/authorized.jpg', credit: 'Photo: dankeck / CC0' };
const MODULES = { photo: '/posts/hypocrisy/modules.jpg', credit: 'Photo: Bruxton / CC0' };

/** "there are 7 of these within a mile of Georgia Tech", or nothing before a survey. */
function nearbyLine(input: PostInput): string {
    const nearby = input.readersWithinMile;

    if (typeof nearby === 'number' && nearby > 0) {
        return `there are ${count(nearby)} of these within a mile of ${input.shortName}\n\n`;
    }

    const statewide = input.readersInState;

    if (typeof statewide === 'number' && statewide > 0 && input.stateName) {
        return `there are ${count(statewide)} of these across ${input.stateName}\n\n`;
    }

    return '';
}

const family: PostFamily = (input) => {
    const nearby = nearbyLine(input);

    return [
        {
            id: 'hypocrisy-found',
            kind: 'meme',
            purpose: 'Police can search your plate in Flock; Flock says it cannot process your request for the same data. Both lines are from its privacy notice.',
            caption:
                'so cops can search your plate but you can\'t even ask flock about it 💀\n'
                + `their policy says it "${POLICE_SEARCH}" but they're "${NO_REQUESTS}"\n\n`
                + nearby
                + `source: ${PRIVACY_PAGE}\n\n`
                + input.address,
            slides: [
                {
                    id: 'hypocrisy-found-1',
                    ...CRUISER,
                    tint: 'duotone',
                    focus: [0.52, 0.5],
                    alt: 'A parked police cruiser, with the words: your plate, when police search it. Found you.',
                    blocks: [
                        tag('Your plate, when police search it'),
                        hook('Found you'),
                    ],
                },
                {
                    id: 'hypocrisy-found-2',
                    ...DUAL,
                    tint: 'wash',
                    focus: [0.5, 0.3],
                    alt: 'Two Flock plate-reader cameras on one pole, with the words: your plate, when you ask Flock for it. Never heard of her.',
                    blocks: [
                        tag('Your plate, when YOU ask Flock for it'),
                        // Under the cameras, not across them: the joke is that
                        // the camera is right there and still "never heard of" you.
                        shout('Never heard of her'),
                    ],
                },
            ],
        },
        {
            id: 'hypocrisy-cookies',
            kind: 'meme',
            purpose: 'Flock\'s website lets you turn down its cookies. Its camera is the tracking cookie you cannot turn down.',
            caption:
                `flock's website gives you "${COOKIE_CHOICES}" but the camera on the pole just reads your plate, no decline button 💀\n\n`
                + nearby
                + `source: ${PRIVACY_PAGE}\n\n`
                + input.address,
            slides: [
                {
                    id: 'hypocrisy-cookies-1',
                    ...COOKIES,
                    // Left as it is: slide one should read as a food post, and
                    // the school's colours arriving on slide two is the swipe.
                    tint: 'none',
                    focus: [0.35, 0.5],
                    alt: 'Chocolate chip cookies on a cutting board, with the words: the plate camera company\'s website. Decline all?',
                    blocks: [
                        tag('The plate camera company\'s website'),
                        hook('Decline all?'),
                    ],
                },
                {
                    id: 'hypocrisy-cookies-2',
                    ...STREET,
                    tint: 'duotone',
                    focus: [0.5, 0.5],
                    alt: 'A Flock plate reader on a pole above a town street, with the words: Flock\'s IRL tracking cookie. Auto-accepted.',
                    blocks: [
                        tag('Flock\'s IRL tracking cookie'),
                        shout('Auto-accepted'),
                    ],
                },
            ],
        },
        {
            id: 'hypocrisy-crime',
            kind: 'meme',
            purpose: 'Poking around Flock\'s system uninvited carries penalties, per Flock. Its camera logging your car uninvited is what it sells.',
            caption:
                `their policy says "${UNAUTHORIZED_USE}"\n`
                + 'meanwhile their camera logs my car without asking, and that\'s the product 💀\n\n'
                + nearby
                + `source: ${PRIVACY_PAGE}\n\n`
                + input.address,
            slides: [
                {
                    id: 'hypocrisy-crime-1',
                    ...AUTHORIZED,
                    tint: 'wash',
                    // The sign hangs low on its chain, so the words go up on
                    // the brick and the sign stays clear below them.
                    focus: [0.5, 1],
                    alt: 'A caution sign on a chain reading authorized personnel only, with the words: me, unauthorized, in the plate camera database. A crime.',
                    blocks: [
                        tag('Me, unauthorized, in the plate camera database'),
                        hook('A crime', { at: 'upper' }),
                    ],
                },
                {
                    id: 'hypocrisy-crime-2',
                    ...MODULES,
                    tint: 'duotone',
                    focus: [0.55, 0.5],
                    alt: 'A Flock camera under its solar panel against the sky, with the words: Flock, logging my car without asking. A product.',
                    blocks: [
                        tag('Flock, logging my car without asking'),
                        shout('A product'),
                    ],
                },
            ],
        },
    ];
};

export default family;
