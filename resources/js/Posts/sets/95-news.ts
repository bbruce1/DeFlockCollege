import type { PostFamily, PostInput, PostSlide } from '@/Posts/postTemplates';
import { count, hook, note, shout, sub, tag } from '@/Posts/kit';

/**
 * News: reactions to things that actually happened, newest first.
 *
 * Every claim sits beside the article it came from, and the wording follows
 * that article: where a source says a sheriff's office "says" something, or a
 * company "markets" a dataset, the post says that and nothing stronger. Each
 * post also carries the other side's answer where one was reported, because a
 * news post that leaves out the rebuttal is the one that gets screenshotted
 * back at the chapter.
 *
 * A story that is later reversed or corrected comes out, or is rewritten from
 * the correction. It is never left up because it performed.
 */

const RACINE_CITY_HALL = { photo: '/posts/news/racine-city-hall.jpg', credit: 'Photo: Michael Barera / CC BY-SA 4.0' };
const RACINE_COURTHOUSE = { photo: '/posts/news/racine-courthouse.jpg', credit: 'Photo: Tim Kiser / CC BY-SA 4.0' };
const LA_CROSSE_POLE = { photo: '/posts/news/la-crosse-pole.jpg', credit: 'Photo: Snoowastaken / CC0' };
const LA_CROSSE_INTERSECTION = { photo: '/posts/news/la-crosse-intersection.jpg', credit: 'Photo: Snoowastaken / CC0' };
const LA_CITY_HALL = { photo: '/posts/news/la-city-hall.jpg', credit: 'Photo: Daniel L. Lu (user:dllu) / CC BY-SA 4.0' };
const HAYWARD = { photo: '/posts/news/hayward.jpg', credit: 'Photo: RailTypes / CC0' };
const DAYTON_CITY_HALL = { photo: '/posts/news/dayton-city-hall.jpg', credit: 'Photo: Steve Morgan / CC BY-SA 4.0' };
const DAYTON_CORNER = { photo: '/posts/news/dayton-city-hall-corner.jpg', credit: 'Photo: Tysto / Public domain' };
const PARMA = { photo: '/posts/news/parma.jpg', credit: 'Photo: MilesHigher / CC BY 4.0' };
const WA_CAPITOL = { photo: '/posts/news/wa-capitol.jpg', credit: 'Photo: Martin Kraft / CC BY-SA 4.0' };
const LAKEWOOD = { photo: '/posts/news/lakewood.jpg', credit: 'Photo: 2x2x2x2x2 / CC0' };
const EVANSTON_CIVIC_CENTER = { photo: '/posts/news/evanston-civic-center.jpg', credit: 'Photo: Zol87 / CC BY-SA 4.0' };
const AURORA = { photo: '/posts/news/aurora.jpg', credit: 'Photo: LemononoM / CC0' };
const LA_CROSSE_CLOSE = { photo: '/posts/news/la-crosse-close.jpg', credit: 'Photo: Snoowastaken / CC0' };
// Commons has no clear Flock camera photographed in Ohio or Illinois, so these
// two stand in for any Flock camera. Their alt text never places them in the city.
const FLOCK_SKY = { photo: '/posts/news/flock-sky.jpg', credit: 'Photo: Epicdeflocker64 / CC0' };
const FLOCK_SOLAR = { photo: '/posts/news/flock-solar.jpg', credit: 'Photo: TexDoe / CC0' };

const WISN_WI_VOTES = 'https://www.wisn.com/article/3-more-se-wisconsin-cities-vote-to-cut-ties-with-flock-cameras/73758897';
const TMJ4_RACINE_SHERIFF = 'https://www.tmj4.com/news/local-news/in-your-community/racine-county/not-what-we-agreed-to-racine-county-sheriff-orders-removal-of-all-flock-cameras';
const WPR_WI_EXITS = 'https://www.wpr.org/news/wisconsin-cities-disable-flock-cameras-cancel-contracts';
const ABC7_LAPD = 'https://abc7.com/post/lapd-ending-agreement-surveillance-company-flock-safety/19483200/';
const FORTUNE_LAPD = 'https://fortune.com/2026/07/15/los-angeles-police-department-flock-safety-contract-immigration-privacy/';
const WYSO_DAYTON = 'https://www.wyso.org/news/2026-05-01/dayton-suspends-automated-license-plate-readers-after-egregious-data-sharing-violations';
const DDN_DAYTON_LOGS = 'https://www.daytondailynews.com/local/dayton-releases-flock-camera-data-here-s-how-system-was-used-for-immigration-enforcement/article_fa86a69c-4aaf-5b48-9647-c77b1178c598.html';
const WKEF_DAYTON_LOGS = 'https://dayton247now.com/news/local/records-show-agencies-nationwide-accessed-dayton-flock-camera-data-before-shutdown';
const KOMO_WA_LAW = 'https://komonews.com/news/local/ferguson-signs-driver-privacy-act-regulating-license-plate-readers-personal-data-sharing-flock-camera-immigration-ice-religion-reproductive-facility-protest-warrant-id-identity-legal-crime-aclu-';
const ROUNDTABLE_EVANSTON = 'https://evanstonroundtable.com/2025/09/24/flock-safety-reinstalls-evanston-cameras/';
const EVANSTON_STATEMENT = 'https://content.govdelivery.com/accounts/ILEVANSTON/bulletins/3efa81d';

/** The chapter's surveyed count, or null before the survey. Never a nought. */
function surveyedNearby(input: PostInput): number | null {
    const nearby = input.readersWithinMile;

    return typeof nearby === 'number' && nearby > 0 ? nearby : null;
}

/** The last slide of every story: bring it home, with the count only when there is one. */
function localSlide(
    input: PostInput,
    id: string,
    art: { photo: string; credit: string },
    focus: [number, number] = [0.5, 0.4],
): PostSlide {
    const nearby = surveyedNearby(input);
    const where = nearby === null
        ? `Plate readers around ${input.shortName}?`
        : `${count(nearby)} within a mile of ${input.shortName}.`;

    return {
        id,
        ...art,
        tint: 'duotone',
        focus,
        alt: `A license plate camera, captioned: ${where} Your council can do this too.`,
        blocks: [
            tag(input.shortName),
            sub(where, { at: 'upper' }),
            shout('Your council can do this too'),
        ],
    };
}

/** The caption's last line: the local count when known, then the chapter's address. */
function captionClose(input: PostInput): string {
    const nearby = surveyedNearby(input);
    const local = nearby === null
        ? 'your council can do this too'
        : `${count(nearby)} of these within a mile of ${input.shortName}. your council can do this too`;

    return `${local}\n\n${input.address}`;
}

const family: PostFamily = (input) => [
    {
        id: 'news-racine-tiebreak',
        kind: 'news',
        // WISN, published 2026-09-16: "following votes Tuesday night", so Tuesday, Sept. 15.
        date: '2026-09-15',
        purpose: 'Win. Racine’s mayor breaks a 7-7 tie to end the city’s Flock contract; Oconomowoc and Waukesha vote the same night.',
        caption:
            'racine’s council tied 7-7 on dropping flock and the mayor broke the tie to end it 🔥\n\n'
            + `source: ${WISN_WI_VOTES}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-racine-tiebreak-1',
                ...LA_CROSSE_CLOSE,
                tint: 'duotone',
                // The camera hangs high in the frame. A condensed hook stays on one
                // line, low enough to clear the bottom of the housing.
                focus: [0.75, 0.4],
                alt: 'A Flock camera on a pole at night in La Crosse, Wisconsin, with the words: Flock cameras, Racine, Wisconsin, September 2026. Racine votes out its plate cameras. Let’s gooo.',
                blocks: [
                    tag('Flock cameras · Racine, WI · Sep 2026'),
                    sub('Racine votes out its plate cameras', { at: 'lower' }),
                    shout('Let’s gooo'),
                ],
            },
            {
                id: 'news-racine-tiebreak-2',
                ...LA_CROSSE_POLE,
                tint: 'wash',
                focus: [0.5, 0.3],
                alt: 'A Flock camera in La Crosse, Wisconsin, explaining that Racine’s council tied 7-7 and the mayor broke the tie to end the city’s Flock contract.',
                blocks: [
                    tag('What happened'),
                    sub('Tied 7-7', { at: 'upper' }),
                    // WISN: "Mayor Cory Mason broke a 7-7 tie in favor of ending the agreement."
                    // WISN: "Oconomowoc's Common Council voted 5-2 Tuesday night to cancel its Flock contract."
                    // WISN: "Waukesha's Common Council also voted Tuesday to stop funding its Flock Safety program after 2026"
                    note(
                        'so the mayor broke the tie and ended the flock contract. same night oconomowoc voted 5-2 to cancel '
                        + 'and waukesha voted to stop funding it after 2026',
                    ),
                ],
            },
            {
                id: 'news-racine-tiebreak-3',
                ...RACINE_CITY_HALL,
                tint: 'wash',
                focus: [0.7, 0.5],
                alt: 'Racine City Hall, with the mayor’s words: deeply troubled by all of this data being given to a private third-party company.',
                blocks: [
                    tag('Mayor Cory Mason'),
                    // WISN: "I'm deeply troubled by all of this data being given to a private
                    // third-party company that is doing things with us, that to me is not transparent"
                    sub('“Deeply troubled”', { at: 'upper' }),
                    note('“I’m deeply troubled by all of this data being given to a private third-party company that is doing things with us, that to me is not transparent.”'),
                ],
            },
            localSlide(input, 'news-racine-tiebreak-4', LA_CROSSE_INTERSECTION),
        ],
    },
    {
        id: 'news-racine-sheriff',
        kind: 'news',
        // TMJ4, published 2026-09-04: "In a release sent out Friday", so Friday, Sept. 4.
        date: '2026-09-04',
        purpose: 'Scandal. A Wisconsin sheriff pulls every Flock camera after learning of a five-year “Traffic Analytics” dataset. Flock’s answer is in the caption.',
        caption:
            'even the sheriff pulled his office’s flock cameras after his office found out flock markets a separate dataset made from them 💀\n'
            + 'flock says it doesn’t sell data\n\n'
            + `sources: ${TMJ4_RACINE_SHERIFF} ${WPR_WI_EXITS} ${WISN_WI_VOTES}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-racine-sheriff-1',
                ...LA_CROSSE_POLE,
                tint: 'duotone',
                // The camera sits under the solar panel, above where the hook lands.
                focus: [0.5, 0.5],
                alt: 'A Flock camera and solar panel on a pole at night in La Crosse, Wisconsin, with the words: Flock cameras, Racine County, Wisconsin, September 2026. The sheriff pulls every Flock camera. Holy s***.',
                blocks: [
                    tag('Flock cameras · Racine County, WI · Sep 2026'),
                    sub('The sheriff pulls every Flock camera', { at: 'lower' }),
                    hook('Holy s***'),
                ],
            },
            {
                id: 'news-racine-sheriff-2',
                ...LA_CROSSE_CLOSE,
                tint: 'wash',
                focus: [0.75, 0.4],
                alt: 'A Flock camera at night in Wisconsin, explaining that the Racine County sheriff ordered his office’s Flock cameras removed.',
                blocks: [
                    tag('What happened'),
                    sub('Even the sheriff', { at: 'upper' }),
                    // TMJ4: "Racine County Sheriff Christopher Schmaling has ordered the removal of
                    // all Flock cameras that are being operated by the sheriff's office."
                    // TMJ4, quoting the sheriff's office: "Flock generates a separate data set from
                    // information collected by its cameras and markets that dataset to other government
                    // and private customers through its 'Traffic Analytics' product" ... "this aggregated
                    // dataset is retained for up to five years"
                    note(
                        'his office says flock makes a separate dataset from the cameras, keeps it up to five years '
                        + 'and markets it. so he pulled every one',
                    ),
                ],
            },
            {
                id: 'news-racine-sheriff-3',
                ...RACINE_COURTHOUSE,
                tint: 'wash',
                focus: [0.3, 0.5],
                alt: 'The Racine County Courthouse, with the sheriff’s words: this is not what we agreed to. Flock’s response underneath.',
                blocks: [
                    tag('Sheriff Christopher Schmaling'),
                    // TMJ4: “This is not what we agreed to, and it is not what the public was led to believe,”
                    sub('“This is not what we agreed to”', { at: 'upper' }),
                    // WISN: "It says the data kept for up to five years is aggregated, de-identified
                    // traffic information, not individual license plate records."
                    // WPR, Flock statement: "Customers own and control their data and Flock does not sell it."
                    note('flock says the five-year data is aggregated, de-identified traffic info, not plate records. and it says it doesn’t sell data'),
                ],
            },
            localSlide(input, 'news-racine-sheriff-4', LA_CROSSE_INTERSECTION),
        ],
    },
    {
        id: 'news-lapd',
        kind: 'news',
        // ABC7 broke it, published 2026-07-11T00:22Z, which is the evening of Friday, July 10 in LA.
        // Police1: "That agreement expired Saturday, July 11."
        date: '2026-07-10',
        purpose: 'Win, with the catch stated: LAPD let its Flock agreement lapse over civil liberties concerns, and is renegotiating.',
        caption:
            'even the lapd let its flock deal expire over civil liberties concerns 🫡\n'
            + 'it’s renegotiating tho so it’s a pause not a ban\n\n'
            + `sources: ${ABC7_LAPD} ${FORTUNE_LAPD}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-lapd-1',
                ...HAYWARD,
                tint: 'duotone',
                focus: [0.55, 0.4],
                alt: 'A Flock camera on a pole in Hayward, California, with the words: Flock cameras, Los Angeles, July 2026. LAPD lets its Flock deal expire. No shot.',
                blocks: [
                    tag('Flock cameras · Los Angeles · Jul 2026'),
                    sub('LAPD lets its Flock deal expire', { at: 'lower' }),
                    hook('No shot'),
                ],
            },
            {
                id: 'news-lapd-2',
                ...LA_CITY_HALL,
                tint: 'wash',
                focus: [0.5, 0.3],
                alt: 'Los Angeles City Hall, explaining that the LAPD let its Flock agreement expire over civil liberties concerns.',
                blocks: [
                    tag('What happened'),
                    sub('Even the LAPD', { at: 'upper' }),
                    // ABC7: "LAPD announced that it will allow its agreement with the company to expire Saturday"
                    // ABC7, Dean Gialamas: "This contract is not being renewed because of serious concerns
                    // around civil liberties and civil rights issues" ... "discontinuing using Flock services
                    // until we can get those data, privacy, security and sharing concerns ironed out"
                    note(
                        'lapd let its flock deal expire over “serious concerns around civil liberties and civil rights issues” '
                        + 'and stopped using it for now',
                    ),
                ],
            },
            {
                id: 'news-lapd-3',
                ...LA_CITY_HALL,
                tint: 'wash',
                focus: [0.5, 0.75],
                alt: 'Los Angeles City Hall, noting that this is a pause and not a ban, and that LAPD is renegotiating.',
                blocks: [
                    tag('The catch'),
                    sub('Pause, not a ban', { at: 'upper' }),
                    // Fortune: "The LAPD confirmed it is renegotiating a deal with the company"
                    // ABC7, Flock statement: "While this latest development comes as a surprise"
                    note('lapd says it’s renegotiating for stronger privacy terms. flock called it a surprise lol'),
                ],
            },
            localSlide(input, 'news-lapd-4', HAYWARD),
        ],
    },
    {
        id: 'news-dayton',
        kind: 'news',
        // WYSO, published 2026-05-01: the suspension was announced "in a new conference on Friday, May 1, 2026."
        date: '2026-05-01',
        purpose: 'Scandal. Dayton’s rule said no immigration enforcement; the logs say “ICE” was the top search reason.',
        caption:
            'the top search reason in dayton’s plate camera logs was literally "ICE" 💀\n'
            + 'cameras are suspended. city says there’s no sign of intentional wrongdoing and it can’t tell if those searches returned dayton data\n\n'
            + `sources: ${WYSO_DAYTON} ${DDN_DAYTON_LOGS} ${WKEF_DAYTON_LOGS}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-dayton-1',
                ...FLOCK_SKY,
                tint: 'duotone',
                // A tall frame: keep the camera in the top half and the bare pole under the hook.
                focus: [0.5, 0.64],
                alt: 'A Flock camera and solar panel on a pole against a grey sky, with the words: Flock cameras, Dayton, Ohio, May 2026. Top search reason on the plate cameras: ICE. What tf.',
                blocks: [
                    tag('Flock cameras · Dayton, OH · May 2026'),
                    sub('Top search reason on the plate cameras: “ICE”', { at: 'lower' }),
                    hook('What tf'),
                ],
            },
            {
                id: 'news-dayton-2',
                ...DAYTON_CORNER,
                tint: 'wash',
                focus: [0.5, 0.4],
                alt: 'Dayton City Hall, explaining that the city suspended its plate readers after finding its safeguards were never put in place.',
                blocks: [
                    tag('What happened'),
                    // WYSO: "The Dayton Police Department indefinitely suspended the use of its fixed
                    // Automated License Plate Readers" ... "didn't implement safeguards to restrict who could
                    // access the data" ... "That included 7,100 search requests citing immigration-related
                    // purposes from various law enforcement agencies."
                    note(
                        'dayton suspended its fixed plate cameras when a review found the data safeguards were never set up. '
                        + 'about 7,100 searches citing immigration-related purposes ran through it',
                    ),
                ],
            },
            {
                id: 'news-dayton-3',
                ...PARMA,
                tint: 'wash',
                focus: [0.5, 0.35],
                alt: 'A license plate reader in Ohio, with figures from Dayton’s search logs.',
                blocks: [
                    tag('The logs · Released Jun 2026'),
                    // Dayton Daily News: "The most common search reason in Dayton's audit logs was simply “ICE,” with 1,776 searches."
                    // Dayton 24/7 Now (WKEF): "Federal Border Patrol accounted for 3,703 of those searches"
                    // City statement, in both: "we cannot currently determine whether any of these requests
                    // resulted in returned information"
                    note(
                        'top search reason: literally “ICE”. 1,776 times 💀 border patrol ran 3,703 of the searches. '
                        + 'city says it can’t tell if any returned dayton data',
                    ),
                ],
            },
            localSlide(input, 'news-dayton-4', DAYTON_CITY_HALL),
        ],
    },
    {
        id: 'news-washington-law',
        kind: 'news',
        // KOMO, published 2026-03-30: "Gov. Bob Ferguson has signed the Driver Privacy Act, Senate Bill 6002, into law"
        date: '2026-03-30',
        purpose: 'Win. Washington State limits plate readers by law, including no immigration enforcement and no selling the data.',
        caption:
            'washington passed a law banning plate readers for immigration enforcement and banning buying and selling the data, per the aclu 🔥\n'
            + 'the aclu also says it "does not fully meet the moment" so not done yet\n\n'
            + `source: ${KOMO_WA_LAW}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-washington-law-1',
                ...LAKEWOOD,
                tint: 'duotone',
                focus: [0.5, 0.2],
                alt: 'A Flock camera on a pole in Lakewood, Washington, with the words: Flock cameras, Washington State, March 2026. New law reins in plate cameras. We’re so back.',
                blocks: [
                    tag('Flock cameras · Washington State · Mar 2026'),
                    sub('New law reins in plate cameras', { at: 'lower' }),
                    hook('We’re so back'),
                ],
            },
            {
                id: 'news-washington-law-2',
                ...WA_CAPITOL,
                tint: 'wash',
                focus: [0.5, 0.35],
                alt: 'The Washington State Capitol, listing what the state’s new law bans.',
                blocks: [
                    tag('What’s banned'),
                    // KOMO, citing the ACLU of Washington: "It also prohibits agencies from using the
                    // technology for immigration investigations and enforcement, or to track people accessing
                    // protected health care services or engaging in constitutionally protected activities
                    // such as protesting." ... "and bans the buying and selling of that data."
                    note(
                        'per the aclu of washington: no plate readers for immigration enforcement or to track people '
                        + 'getting protected health care or protesting. and no buying or selling the data',
                    ),
                ],
            },
            {
                id: 'news-washington-law-3',
                ...WA_CAPITOL,
                tint: 'wash',
                focus: [0.5, 0.8],
                alt: 'The Washington State Capitol, noting the ACLU says the law does not fully meet the moment.',
                blocks: [
                    tag('Not done yet'),
                    // KOMO: the ACLU said the bill “does not fully meet the moment” ... "the law allows
                    // agencies to retain automated license plate reader data for 21 days"
                    sub('“Does not fully meet the moment”', { at: 'upper' }),
                    note('aclu says it’s a first step. data can still be kept for 21 days'),
                ],
            },
            localSlide(input, 'news-washington-law-4', LAKEWOOD),
        ],
    },
    {
        id: 'news-evanston',
        kind: 'news',
        // Evanston RoundTable, published 2025-09-24, reporting the cease-and-desist sent "Tuesday afternoon".
        // The Daily Northwestern dates the order Sept. 18, so the slide gives the month only.
        date: '2025-09-24',
        purpose: 'Scandal. Evanston ended its Flock contract; Flock put the cameras back up without the city’s permission.',
        caption:
            'evanston dropped flock and flock put the cameras back up anyway 💀\n'
            + 'the city says "Flock reinstalled the cameras without the city’s permission." flock said it would take them down after a cease-and-desist\n\n'
            + `sources: ${ROUNDTABLE_EVANSTON} ${EVANSTON_STATEMENT}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-evanston-1',
                ...FLOCK_SOLAR,
                tint: 'duotone',
                focus: [0.5, 0.4],
                alt: 'A Flock camera under its solar panel against the sky, with the words: Flock cameras, Evanston, Illinois, September 2025. Evanston fired Flock, Flock put the cameras back up. Bro what.',
                blocks: [
                    tag('Flock cameras · Evanston, IL · Sep 2025'),
                    sub('Evanston fired Flock. Flock put the cameras back up', { at: 'lower' }),
                    // Condensed so it stays on one line under the camera.
                    shout('Bro what'),
                ],
            },
            {
                id: 'news-evanston-2',
                ...AURORA,
                tint: 'wash',
                focus: [0.5, 0.8],
                alt: 'A Flock camera in Illinois, explaining that Evanston switched off its Flock cameras after a state audit.',
                blocks: [
                    tag('The breakup'),
                    // City of Evanston, Aug. 26, 2025: "deactivated all 19 Flock Safety ALPR cameras" ...
                    // "issued a termination notice to Flock"
                    // RoundTable: "Illinois Secretary of State Alexi Giannoulias discovered that Flock had
                    // allowed U.S. Customs and Border Protection to access Illinois cameras in a “pilot
                    // program” against state law"
                    note(
                        'evanston switched off its 19 flock cameras and ended the contract after illinois’s secretary of state '
                        + 'found flock let customs and border protection access illinois cameras',
                    ),
                ],
            },
            {
                id: 'news-evanston-3',
                ...EVANSTON_CIVIC_CENTER,
                tint: 'wash',
                focus: [0.2, 0.5],
                alt: 'Evanston’s civic center, with the city’s words: Flock reinstalled the cameras without the city’s permission.',
                blocks: [
                    tag('Ex behavior'),
                    // RoundTable, city spokesperson: "meaning Flock reinstalled the cameras without the city’s permission."
                    sub('“Flock reinstalled the cameras without the city’s permission”', { at: 'upper' }),
                    // RoundTable: "We immediately issued a cease-and-desist order to Flock. Earlier this
                    // afternoon, Flock committed to promptly removing the cameras."
                    note('city sent a cease-and-desist and flock committed to taking them down'),
                ],
            },
            localSlide(input, 'news-evanston-4', AURORA, [0.5, 0.8]),
        ],
    },
];

export default family;
