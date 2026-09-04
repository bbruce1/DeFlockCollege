import { FIXED } from '../../contract';
import ComponentOutline from './ComponentOutline';

/**
 * The three that appear on every chapter, whatever template it drew.
 *
 * Each takes the part its job suggests: the socials are the connector, because
 * they are the only thing this page plugs into; the conduct rule is the fuse,
 * the component whose entire purpose is to fail safe before it takes the rest
 * with it; and the disclaimer is the isolator, which exists precisely so two
 * sides of a board share no ground.
 *
 * Handles are user-supplied and are rendered as text. Never as markup.
 */
interface Props {
    instagram: string | null;
    tiktok: string | null;
    schoolName: string;
    shortName: string;
}

function profileUrl(base: string, handle: string): string {
    return base + encodeURIComponent(handle.replace(/^@/, ''));
}

export default function Commitments({ instagram, tiktok, schoolName, shortName }: Props) {
    const socials: Array<[string, string]> = [];

    if (instagram) {
        socials.push(['Instagram', profileUrl('https://instagram.com/', instagram)]);
    }

    if (tiktok) {
        socials.push(['TikTok', profileUrl('https://www.tiktok.com/@', tiktok)]);
    }

    return (
        <>
            <ComponentOutline designator="J1" label={FIXED.commitments.instagram.label} id="push-back">
                <h2 className="ckt-h ckt-h-part">
                    Make the <em className="ckt-em">Instagram</em>.
                </h2>

                {socials.length > 0 ? (
                    <>
                        <p className="ckt-body">
                            {shortName} posts here. This is the connector: the page is generated, the
                            audience is not.
                        </p>
                        <ul style={{ listStyle: 'none', margin: '1.25rem 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                            {socials.map(([label, url]) => (
                                <li key={label}>
                                    <a className="ckt-link" href={url} target="_blank" rel="noopener nofollow">
                                        {label}: {label === 'Instagram' ? instagram : tiktok}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="ckt-body">
                        The one thing this generator cannot build for you. It makes the site; it
                        cannot make an audience. Open the account, put the handle on this page, and
                        the chapter has somewhere to speak from.
                    </p>
                )}
            </ComponentOutline>

            <ComponentOutline designator="F1" label={FIXED.commitments.conduct.label}>
                <h2 className="ckt-h ckt-h-part">
                    Emails and votes. Never <em className="ckt-em">vandalism</em>.
                </h2>
                <p className="ckt-body">{FIXED.commitments.conduct.body}</p>
                <p className="ckt-note">
                    A fuse is the part that fails first so nothing else has to. This is that part.
                </p>
            </ComponentOutline>

            <ComponentOutline designator="U9" label={FIXED.commitments.affiliation.label}>
                <h2 className="ckt-h ckt-h-part">
                    Students. Not the <em className="ckt-em">school</em>.
                </h2>
                <p className="ckt-body">
                    This chapter is run by students. It is not operated by, endorsed by, or
                    affiliated with {schoolName}, and the accounts linked above are theirs rather
                    than the institution&rsquo;s. Two grounds, deliberately never joined.
                </p>
            </ComponentOutline>
        </>
    );
}
