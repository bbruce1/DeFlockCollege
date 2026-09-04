import { FIXED } from '../../contract';
import { displayHandle, handleUrl } from '../social';

interface Props {
    id: string;
    shortName: string;
    instagram: string | null;
    tiktok: string | null;
}

const INSTAGRAM_BASE = 'https://instagram.com/';
const TIKTOK_BASE = 'https://tiktok.com/@';

/**
 * The three lines that appear on every chapter in the network, exempt from the
 * seed. They are directives on this template, at full size and never as footnote
 * type — being the school's disclaimer is not what the third one is for.
 */
export default function Commitments({ id, shortName, instagram, tiktok }: Props) {
    const instagramUrl = handleUrl(INSTAGRAM_BASE, instagram);
    const tiktokUrl = handleUrl(TIKTOK_BASE, tiktok);

    return (
        <section className="sig-section" id={id}>
            <div className="sig-rail">
                <p className="sig-mono sig-mono-lit" style={{ marginBottom: '1.5rem' }}>
                    Standing orders // every chapter
                </p>

                <div className="sig-directives">
                    <div className="sig-directive">
                        <p className="sig-mono">{FIXED.commitments.instagram.label}</p>
                        <h3>{FIXED.commitments.instagram.headline}</h3>
                        {instagram !== null ? (
                            <p className="sig-copy" style={{ marginTop: 0 }}>
                                This chapter posts as{' '}
                                {instagramUrl !== null ? (
                                    <a className="sig-link" href={instagramUrl} target="_blank" rel="noopener nofollow">
                                        {displayHandle(instagram)}
                                    </a>
                                ) : (
                                    displayHandle(instagram)
                                )}
                                {tiktok !== null && (
                                    <>
                                        {' and on TikTok as '}
                                        {tiktokUrl !== null ? (
                                            <a className="sig-link" href={tiktokUrl} target="_blank" rel="noopener nofollow">
                                                {displayHandle(tiktok)}
                                            </a>
                                        ) : (
                                            displayHandle(tiktok)
                                        )}
                                    </>
                                )}
                                . The page is generated; the audience is not.
                            </p>
                        ) : (
                            <p className="sig-copy" style={{ marginTop: 0 }}>
                                This station has no account yet. Everything else on this page was built for you in
                                minutes — the one thing a generator cannot make is people who follow {shortName}.
                            </p>
                        )}
                    </div>

                    <div className="sig-directive">
                        <p className="sig-mono">{FIXED.commitments.conduct.label}</p>
                        <h3>{FIXED.commitments.conduct.headline}</h3>
                        <p className="sig-copy" style={{ marginTop: 0 }}>
                            {FIXED.commitments.conduct.body}
                        </p>
                    </div>

                    <div className="sig-directive">
                        <p className="sig-mono">{FIXED.commitments.affiliation.label}</p>
                        <h3>{FIXED.commitments.affiliation.headline}</h3>
                        <p className="sig-copy" style={{ marginTop: 0 }}>
                            This chapter is run by students. It is not operated by, endorsed by, or associated with{' '}
                            {shortName}, and the accounts above belong to the students who made them.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
