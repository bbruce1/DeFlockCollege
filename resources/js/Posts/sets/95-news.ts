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

/**
 * Slide 2's headline sits on a box: these photos are city halls and courthouse
 * facades, and a white shout over a wall of windows is unreadable.
 */
const HEADLINE = { at: 'upper', box: 'black', stroke: null } as const;

const RACINE_CITY_HALL = { photo: '/posts/news/racine-city-hall.jpg', credit: 'Photo: Michael Barera / CC BY-SA 4.0' };
const RACINE_COURTHOUSE = { photo: '/posts/news/racine-courthouse.jpg', credit: 'Photo: Tim Kiser / CC BY-SA 4.0' };
const LA_CROSSE_POLE = { photo: '/posts/news/la-crosse-pole.jpg', credit: 'Photo: Snoowastaken / CC0' };
const LA_CROSSE_INTERSECTION = { photo: '/posts/news/la-crosse-intersection.jpg', credit: 'Photo: Snoowastaken / CC0' };
const DAYTON_CITY_HALL = { photo: '/posts/news/dayton-city-hall.jpg', credit: 'Photo: Steve Morgan / CC BY-SA 4.0' };
const DAYTON_CORNER = { photo: '/posts/news/dayton-city-hall-corner.jpg', credit: 'Photo: Tysto / Public domain' };
const PARMA = { photo: '/posts/news/parma.jpg', credit: 'Photo: MilesHigher / CC BY 4.0' };
const WA_CAPITOL = { photo: '/posts/news/wa-capitol.jpg', credit: 'Photo: Martin Kraft / CC BY-SA 4.0' };
const LAKEWOOD = { photo: '/posts/news/lakewood.jpg', credit: 'Photo: 2x2x2x2x2 / CC0' };
const AURORA = { photo: '/posts/news/aurora.jpg', credit: 'Photo: LemononoM / CC0' };
const LA_CROSSE_CLOSE = { photo: '/posts/news/la-crosse-close.jpg', credit: 'Photo: Snoowastaken / CC0' };
const ADDISON = { photo: '/posts/news/addison.jpg', credit: 'Photo: HolstMyBeer / CC0' };
const TEXAS_ROADSIDE = { photo: '/posts/news/texas-roadside.jpg', credit: 'Photo: Biabee3 / CC0' };
const MIDLAND_SKYLINE = { photo: '/posts/news/midland-skyline.jpg', credit: 'Photo: Quintin Soloviev / CC BY 4.0' };
const TULSA_FEDERAL_BUILDING = { photo: '/posts/news/tulsa-federal-building.jpg', credit: 'Photo: G. Edward Johnson / CC BY 4.0' };
const INDIANAPOLIS_CITY_COUNTY = { photo: '/posts/news/indianapolis-city-county.jpg', credit: 'Photo: Momoneymoproblemz / CC BY-SA 4.0' };
// Commons has no clear Flock camera photographed in Ohio, Oklahoma or Indiana,
// so these stand in for any Flock camera. Their alt text never places them in the city.
const FLOCK_SKY = { photo: '/posts/news/flock-sky.jpg', credit: 'Photo: Epicdeflocker64 / CC0' };
const FLOCK_TREES = { photo: '/posts/news/flock-trees.jpg', credit: 'Photo: ILoveturles9 / CC0' };
const FLOCK_FENCE = { photo: '/posts/news/flock-fence.jpg', credit: 'Photo: Epicdeflocker64 / CC0' };
const FLOCK_ORCHARD = { photo: '/posts/news/flock-orchard.jpg', credit: 'Photo: LemononoM / CC0' };

const MRT_MIDLAND = 'https://www.mrt.com/news/article/details-flock-safety-camera-contract-termination-22475829.php';
const KMID_MIDLAND = 'https://www.yahoo.com/news/us/articles/451k-extension-midland-reverses-course-164813011.html';
const FOUR04_TULSA_RULING = 'https://www.404media.co/federal-judge-rules-a-flock-search-was-indiscriminate-mass-surveillance-and-unconstitutional/';
const TECHCRUNCH_TULSA_RULING = 'https://techcrunch.com/2026/10/03/federal-judge-calls-flock-indiscriminate-mass-surveillance/';
// The Washington Post's story, as syndicated by the Anchorage Daily News.
const WAPO_INDIANAPOLIS = 'https://adn.com/nation-world/2026/09/23/prosecutors-charge-5-indianapolis-police-officers-accused-of-misusing-access-to-flock-license-plate-reader-cameras';
const ABC_INDIANAPOLIS = 'https://www.goodmorningamerica.com/news/story/5-indianapolis-police-officers-charged-misusing-license-plate-136696856';
const EFF_LMAO = 'https://www.eff.org/deeplinks/2026/09/high-crime-lmao-how-cops-are-treating-mass-surveillance-joke';
const FOUR04_LMAO = 'https://www.404media.co/cops-search-thousands-of-flock-cameras-for-reasons-of-lmao-idk-hehe-and-asdfg/';
const WISN_WI_VOTES = 'https://www.wisn.com/article/3-more-se-wisconsin-cities-vote-to-cut-ties-with-flock-cameras/73758897';
const FOX6_RACINE = 'https://www.fox6now.com/news/flock-cameras-racine-mayor-tie-vote';
const TMJ4_RACINE_SHERIFF = 'https://www.tmj4.com/news/local-news/in-your-community/racine-county/not-what-we-agreed-to-racine-county-sheriff-orders-removal-of-all-flock-cameras';
const WPR_WI_EXITS = 'https://www.wpr.org/news/wisconsin-cities-disable-flock-cameras-cancel-contracts';
const WYSO_DAYTON = 'https://www.wyso.org/news/2026-05-01/dayton-suspends-automated-license-plate-readers-after-egregious-data-sharing-violations';
const DDN_DAYTON_LOGS = 'https://www.daytondailynews.com/local/dayton-releases-flock-camera-data-here-s-how-system-was-used-for-immigration-enforcement/article_fa86a69c-4aaf-5b48-9647-c77b1178c598.html';
const WKEF_DAYTON_LOGS = 'https://dayton247now.com/news/local/records-show-agencies-nationwide-accessed-dayton-flock-camera-data-before-shutdown';
const KOMO_WA_LAW = 'https://komonews.com/news/local/ferguson-signs-driver-privacy-act-regulating-license-plate-readers-personal-data-sharing-flock-camera-immigration-ice-religion-reproductive-facility-protest-warrant-id-identity-legal-crime-aclu-';

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
        id: 'news-midland',
        kind: 'news',
        // Midland Reporter-Telegram, published 2026-10-13: "the unanimous decision on Oct. 13".
        date: '2026-10-13',
        purpose: 'Win. Midland, Texas votes unanimously to remove all 73 of its Flock cameras, eight months after approving a $451K extension.',
        caption:
            'midland, texas voted unanimously to take down all 73 of its flock cameras, eight months after approving a $451k extension 🔥\n'
            + 'county and privately owned cameras aren’t covered though\n\n'
            + `sources: ${MRT_MIDLAND} ${KMID_MIDLAND}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-midland-1',
                ...ADDISON,
                tint: 'duotone',
                // Tall frame: keep the cameras under the panel in the upper two thirds,
                // clear of the hook.
                focus: [0.5, 0.75],
                alt: 'Two Flock cameras under a solar panel on a pole in Addison, Texas, with the words: Flock cameras, Midland, Texas, October 2026. W. They stop tracking you.',
                blocks: [
                    tag('Flock cameras · Midland, TX · Oct 2026'),
                    shout('W. They stop tracking you'),
                ],
            },
            {
                id: 'news-midland-2',
                ...MIDLAND_SKYLINE,
                tint: 'wash',
                focus: [0.5, 0.5],
                alt: 'The Midland, Texas skyline, explaining that the city council voted unanimously to end its Flock contract.',
                blocks: [
                    tag('What happened'),
                    sub('Midland votes to remove all 73 cameras', HEADLINE),
                    // Midland Reporter-Telegram: "Midland City Council has voted unanimously to remove the
                    // city’s network of 73 Flock cameras, terminating Midland's contract with Flock Safety."
                    // KMID: "The October 13 decision comes just eight months after the council approved
                    // a two-year, $451,000 contract extension with the company in February."
                    note('the council voted unanimously to end its flock contract, eight months after approving a $451k extension'),
                ],
            },
            {
                id: 'news-midland-3',
                ...MIDLAND_SKYLINE,
                tint: 'wash',
                focus: [0.9, 0.5],
                alt: 'The Midland, Texas skyline, with a councilman’s words: an involuntary relinquishment of information. The police chief’s view underneath.',
                blocks: [
                    tag('Councilman Jack Ladd'),
                    // Midland Reporter-Telegram, Ladd: "This is an involuntary relinquishment of information"
                    sub('“An involuntary relinquishment of information”', { at: 'upper' }),
                    // KMID: "Midland Police Chief Greg Snow previously defended the technology as an important
                    // investigative tool."
                    // Midland Reporter-Telegram: "Flock Safety will be receiving a notice to remove the cameras
                    // within a 60-day time period, ending Dec. 12." ... "hardware removal and site restoration
                    // are Flock's responsibility at no cost to the city."
                    note('police chief greg snow has defended them as an investigative tool. flock has 60 days to take them down, at no cost to the city'),
                ],
            },
            localSlide(input, 'news-midland-4', TEXAS_ROADSIDE, [0.5, 0]),
        ],
    },
    {
        id: 'news-tulsa-ruling',
        kind: 'news',
        // 404 Media broke it, published 2026-10-02: the judge "ruled Thursday", which is Oct. 1.
        date: '2026-10-02',
        purpose: 'Win, with the catch stated: a federal judge in Oklahoma rules a warrantless Flock search unconstitutional. One district court, not binding, and Flock expects an appeal.',
        caption:
            'a federal judge called a warrantless flock search “a type of indiscriminate mass surveillance” and threw out the evidence ⚖️\n'
            + 'it’s one court and not binding though, and flock expects it to be appealed and overturned\n\n'
            + `sources: ${FOUR04_TULSA_RULING} ${TECHCRUNCH_TULSA_RULING}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-tulsa-ruling-1',
                ...FLOCK_TREES,
                tint: 'duotone',
                // Tall frame: the camera hangs mid-pole, so lift it clear of the hook.
                focus: [0.5, 0.6],
                alt: 'A Flock camera and solar panel on a pole in front of trees, with the words: Flock cameras, Tulsa, Oklahoma, October 2026. W. Judge: mass surveillance.',
                blocks: [
                    tag('Flock cameras · Tulsa, OK · Oct 2026'),
                    shout('W. Judge: mass surveillance'),
                ],
            },
            {
                id: 'news-tulsa-ruling-2',
                ...TULSA_FEDERAL_BUILDING,
                tint: 'wash',
                focus: [0.5, 0.5],
                alt: 'The Page Belcher Federal Building in Tulsa, home to a federal courthouse, explaining that a judge ruled a Flock search unconstitutional.',
                blocks: [
                    tag('What happened'),
                    sub('Judge rules a Flock search unconstitutional', HEADLINE),
                    // TechCrunch: "Judge Sara Hill said the deputy should have obtained a warrant before searching
                    // the Flock database for the woman’s license plate, as he had “no apparent reason” for the
                    // search “other than the fact that [the woman’s vehicle] had a California license plate.”"
                    note('a federal judge says a deputy should’ve gotten a warrant to search a woman’s plate in flock, since her california plate was his only reason'),
                ],
            },
            {
                id: 'news-tulsa-ruling-3',
                ...TULSA_FEDERAL_BUILDING,
                tint: 'wash',
                focus: [0.2, 0.5],
                alt: 'The federal building in Tulsa, with the judge’s words: a type of indiscriminate mass surveillance. The catch underneath.',
                blocks: [
                    tag('Judge Sara Hill'),
                    // 404 Media, quoting the opinion: "This is a type of indiscriminate mass surveillance."
                    sub('“A type of indiscriminate mass surveillance”', { at: 'upper' }),
                    // 404 Media: "she was found to have 91 pounds of meth in the vehicle. Hill ruled that all Flock
                    // evidence and all evidence from Alaniz’s search of the car must be thrown out." ... "Hill's
                    // decision will not set a binding precedent"
                    // 404 Media, Flock spokesperson: "we expect it will be appealed and ultimately overturned."
                    note('the thrown-out evidence includes 91 pounds of meth found in her car. it’s not binding, and flock expects it to be appealed and overturned'),
                ],
            },
            localSlide(input, 'news-tulsa-ruling-4', LA_CROSSE_INTERSECTION),
        ],
    },
    {
        id: 'news-indianapolis',
        kind: 'news',
        // The Washington Post, published 2026-09-23: "criminally charged five Indianapolis police officers Wednesday".
        date: '2026-09-23',
        purpose: 'Scandal. Prosecutors charge five Indianapolis officers with misusing Flock, including searches of ex-wives’ plates. Flock’s answer is in the caption.',
        caption:
            'five indianapolis cops got charged over flock searches. one allegedly searched his ex-wife’s plate more than 1,000 times 💀\n'
            + 'flock says “misuse of any law enforcement tool is unacceptable”\n\n'
            + `sources: ${WAPO_INDIANAPOLIS} ${ABC_INDIANAPOLIS}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-indianapolis-1',
                ...FLOCK_ORCHARD,
                tint: 'duotone',
                // Tall frame: the camera is small and high on the pole, well above the hook.
                focus: [0.5, 0.3],
                alt: 'A Flock camera on a pole beside a row of trees, with the words: Flock cameras, Indianapolis, Indiana, September 2026. No shot. A cop tracked his ex?',
                blocks: [
                    tag('Flock cameras · Indianapolis, IN · Sep 2026'),
                    // One officer, and an allegation: the charges say he searched his
                    // ex-wife's plate, so the hook says that and no more.
                    shout('No shot. A cop tracked his ex??'),
                ],
            },
            {
                id: 'news-indianapolis-2',
                ...INDIANAPOLIS_CITY_COUNTY,
                tint: 'wash',
                focus: [0.5, 0.4],
                alt: 'The Indianapolis City-County Building, explaining that prosecutors charged five police officers over Flock searches.',
                blocks: [
                    tag('What happened'),
                    sub('Five Indy cops charged over Flock searches', HEADLINE),
                    // Washington Post: "criminally charged five Indianapolis police officers Wednesday, accusing
                    // them of misusing their access to Flock license-plate-reader cameras." ... "Binford searched
                    // the plate of his ex-wife more than 1,000 times between April 2024 and April 2025."
                    // ABC News: "one officer allegedly used the system to track his ex-wife."
                    note('prosecutors accuse them of misusing flock. one allegedly searched his ex-wife’s plate more than 1,000 times'),
                ],
            },
            {
                id: 'news-indianapolis-3',
                ...INDIANAPOLIS_CITY_COUNTY,
                tint: 'wash',
                focus: [0.8, 0.4],
                alt: 'The Indianapolis City-County Building, with the prosecutor’s words: real-world victims. Flock’s response underneath.',
                blocks: [
                    tag('Prosecutor Ryan Mears'),
                    // Washington Post: Mears said the case demonstrated that misuse of Flock technology has "real-world victims."
                    sub('“Real-world victims”', { at: 'upper' }),
                    // Washington Post, Flock spokesman: "Misuse of any law enforcement tool is unacceptable"
                    // Washington Post: "Cramer resigned, while the four other officers have been suspended and
                    // recommended for termination"
                    note('“Misuse of any law enforcement tool is unacceptable,” flock said. one officer resigned, the other four are suspended'),
                ],
            },
            localSlide(input, 'news-indianapolis-4', AURORA, [0.5, 0.8]),
        ],
    },
    {
        id: 'news-racine-tiebreak',
        kind: 'news',
        // WISN, published 2026-09-16: "following votes Tuesday night", so Tuesday, Sept. 15.
        date: '2026-09-15',
        purpose: 'Win, with the catch stated: Racine’s mayor breaks a 7-7 tie to end the city’s Flock contract; Oconomowoc and Waukesha vote the same night. Racine police say they are getting quotes on other plate readers.',
        caption:
            'racine’s council tied 7-7 on dropping flock and the mayor broke the tie to end it 🔥\n'
            // FOX6: "As the Flock cameras will be removed on October 15th, the Racine Police Department
            // said they plan to look into other automated license plate readers and obtain quotes."
            + 'the cameras come down oct 15, though police say they’re getting quotes on other plate readers\n\n'
            + `sources: ${WISN_WI_VOTES} ${FOX6_RACINE}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-racine-tiebreak-1',
                ...LA_CROSSE_CLOSE,
                tint: 'duotone',
                // The camera hangs high in the frame. A condensed hook stays on one
                // line, low enough to clear the bottom of the housing.
                focus: [0.75, 0.4],
                alt: 'A Flock camera on a pole at night in La Crosse, Wisconsin, with the words: Flock cameras, Racine, Wisconsin, September 2026. Let’s gooo.',
                blocks: [
                    tag('Flock cameras · Racine, WI · Sep 2026'),
                    shout('Let’s gooo'),
                ],
            },
            {
                id: 'news-racine-tiebreak-2',
                // City hall rather than a camera: on the pole shot the four-line note sat over the camera.
                ...RACINE_CITY_HALL,
                tint: 'wash',
                focus: [0.2, 0.5],
                alt: 'Racine City Hall, explaining that Racine’s council tied 7-7 and the mayor broke the tie to end the city’s Flock contract.',
                blocks: [
                    tag('What happened'),
                    sub('Racine votes out its plate cameras', HEADLINE),
                    // WISN: "Mayor Cory Mason broke a 7-7 tie in favor of ending the agreement."
                    // WISN: "Oconomowoc's Common Council voted 5-2 Tuesday night to cancel its Flock contract."
                    // WISN: "Waukesha's Common Council also voted Tuesday to stop funding its Flock Safety program after 2026"
                    note(
                        'the mayor broke the tie to end the flock contract. oconomowoc voted 5-2 to cancel the same night, '
                        + 'and waukesha to stop funding it after 2026',
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
        id: 'news-lmao',
        kind: 'news',
        // EFF and 404 Media, both published 2026-09-14.
        date: '2026-09-14',
        purpose: 'Scandal. EFF finds cops logging “LMAO”, “idk” and keyboard mashing as the reason for Flock searches. Flock’s fix, and EFF’s answer to it, are in the caption.',
        caption:
            'a cop searched more than 19,000 flock cameras for a plate and typed “LMAO” as the reason 💀\n'
            + 'flock swapped the reason box for a dropdown. the eff calls that “a loss for transparency”\n\n'
            + `sources: ${EFF_LMAO} ${FOUR04_LMAO}\n\n`
            + captionClose(input),
        slides: [
            {
                id: 'news-lmao-1',
                ...FLOCK_FENCE,
                tint: 'duotone',
                // Tall frame: keep the camera above the fence line and clear of the hook.
                focus: [0.5, 0.62],
                alt: 'A Flock camera and solar panel on a pole above a chain-link fence, with the words: Flock cameras, across the US, September 2026. Bro ran a plate for LMAO.',
                blocks: [
                    tag('Flock cameras · Across the US · Sep 2026'),
                    shout('Bro ran a plate for “LMAO”'),
                ],
            },
            {
                id: 'news-lmao-2',
                ...AURORA,
                tint: 'wash',
                focus: [0.5, 0.8],
                alt: 'A Flock camera in Aurora, Illinois, explaining that police logged jokes and keyboard mashing as their reasons for Flock searches.',
                blocks: [
                    tag('What happened'),
                    sub('Search reason: “LMAO”', HEADLINE),
                    // EFF: "logging reasons like "LOL" (short for “laugh out loud”), "LMAO" ... "sexy," and
                    // "idk"" ... "Richmond Police Department (Calif.) employees ran multiple searches in
                    // November 2024 for “Hehe.”" ... "officers are just mashing keyboard buttons rather than
                    // articulating the nature of their searches."
                    note('eff dug through flock search logs and found cops typing “lol”, “idk”, “hehe” and keyboard mashing as the reason for a search'),
                ],
            },
            {
                id: 'news-lmao-3',
                ...FLOCK_SKY,
                tint: 'wash',
                // Lift the camera into the gap between the headline and the note.
                focus: [0.5, 0.45],
                alt: 'A Flock camera against a grey sky, noting that one search logged as LMAO ran across more than 19,000 cameras.',
                blocks: [
                    tag('Lake County, IN sheriff’s dept'),
                    // 404 Media: "used Flock’s surveillance search engine to look for a license plate across
                    // more than 19,000 cameras in 1,558 cities and towns. The cop’s stated reason for the
                    // search, according to a record of Flock’s system, was “LMAO.”"
                    sub('One “LMAO” search ran across 19,000+ cameras', { at: 'upper' }),
                    // 404 Media: "Flock now has a drop-down list of prepopulated reasons, which the EFF
                    // called “a loss for transparency.”"
                    note('flock now makes cops pick a reason from a dropdown. eff calls that “a loss for transparency”'),
                ],
            },
            localSlide(input, 'news-lmao-4', FLOCK_TREES, [0.5, 0.6]),
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
                alt: 'A Flock camera and solar panel on a pole at night in La Crosse, Wisconsin, with the words: Flock cameras, Racine County, Wisconsin, September 2026. Holy s***.',
                blocks: [
                    tag('Flock cameras · Racine County, WI · Sep 2026'),
                    hook('Holy s***'),
                ],
            },
            {
                id: 'news-racine-sheriff-2',
                // The courthouse rather than the close-up, whose camera sat under the headline box.
                ...RACINE_COURTHOUSE,
                tint: 'wash',
                focus: [0.8, 0.5],
                alt: 'The Racine County Courthouse, explaining that the Racine County sheriff ordered his office’s Flock cameras removed.',
                blocks: [
                    tag('What happened'),
                    sub('The sheriff pulls every Flock camera', HEADLINE),
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
                alt: 'A Flock camera and solar panel on a pole against a grey sky, with the words: Flock cameras, Dayton, Ohio, May 2026. What tf.',
                blocks: [
                    tag('Flock cameras · Dayton, OH · May 2026'),
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
                    sub('Top search reason: “ICE”', HEADLINE),
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
                alt: 'A Flock camera on a pole in Lakewood, Washington, with the words: Flock cameras, Washington State, March 2026. We’re so back.',
                blocks: [
                    tag('Flock cameras · Washington State · Mar 2026'),
                    // Condensed: one line, so it clears the headline above it.
                    shout('We’re so back'),
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
                    sub('New law reins in plate cameras', HEADLINE),
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
            localSlide(input, 'news-washington-law-4', AURORA, [0.5, 0.8]),
        ],
    },
];

export default family;
