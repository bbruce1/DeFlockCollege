import type { Chapter } from '../../contract';
import { FIXED } from '../../contract';
import { socialUrl } from '../data';
import CommandLine from './CommandLine';

interface Props {
    chapter: Chapter;
    host: string;
}

const LISTING = [
    { mode: '-rw-r--r--', size: '1.2K', name: '01_instagram.md' },
    { mode: '-r--r--r--', size: '2.4K', name: '02_conduct.md' },
    { mode: '-r--r--r--', size: '0.9K', name: '03_affiliation.md' },
];

/**
 * The three things every chapter in the network says, listed as files.
 *
 * Two of them are read-only in the listing on purpose: conduct and affiliation
 * are not a creator's to edit, and the permission bits say so before the prose
 * does.
 */
export default function Commitments({ chapter, host }: Props) {
    const { instagram, conduct, affiliation } = FIXED.commitments;

    return (
        <section className="tt__section" id="act" aria-labelledby="tt-commit-h">
            <CommandLine command="ls -l commitments/" host={host} cwd="~/campus" />
            <div className="tt__out">
                <ul className="tt__boot" aria-hidden="true">
                    {LISTING.map((entry) => (
                        <li key={entry.name}>
                            <span className="tt__boot-t">{entry.mode}</span>
                            <span className="tt__boot-t">students students</span>
                            <span className="tt__boot-msg">{entry.size}</span>
                            <span className="tt__boot-v">{entry.name}</span>
                        </li>
                    ))}
                </ul>

                <h2 className="tt__sr" id="tt-commit-h">
                    What every chapter commits to
                </h2>

                <div className="tt__files">
                    <article className="tt__file">
                        <p className="tt__file-path">01_instagram.md &middot; {instagram.label}</p>
                        <h3>{instagram.headline}</h3>
                        <p className="tt__body">
                            The generator builds the site. It cannot build an audience, and that is the one
                            job it hands back to you. An account is where a meeting gets announced, where a
                            new camera gets photographed, and where the next campus finds out this exists.
                        </p>
                        {chapter.instagram ? (
                            <p className="tt__status">
                                <b>&gt;</b> live at{' '}
                                <a
                                    href={socialUrl('instagram', chapter.instagram)}
                                    target="_blank"
                                    rel="noopener nofollow"
                                >
                                    @{chapter.instagram}
                                </a>
                                {chapter.tiktok ? (
                                    <>
                                        {' '}
                                        &middot;{' '}
                                        <a
                                            href={socialUrl('tiktok', chapter.tiktok)}
                                            target="_blank"
                                            rel="noopener nofollow"
                                        >
                                            @{chapter.tiktok}
                                        </a>{' '}
                                        on TikTok
                                    </>
                                ) : null}
                            </p>
                        ) : (
                            <p className="tt__status">
                                <b>&gt;</b> no account attached yet. Make one, then add it to this chapter.
                            </p>
                        )}
                    </article>

                    <article className="tt__file">
                        <p className="tt__file-path">02_conduct.md &middot; {conduct.label}</p>
                        <h3>{conduct.headline}</h3>
                        <p className="tt__body">{conduct.body}</p>
                    </article>

                    <article className="tt__file">
                        <p className="tt__file-path">03_affiliation.md &middot; {affiliation.label}</p>
                        <h3>{affiliation.headline}</h3>
                        <p className="tt__body">
                            This chapter is run by students. It is not a department, an office, or a club of{' '}
                            {chapter.schoolName}, it does not speak for the school, and the school did not
                            approve it. The accounts above belong to the students who made them, not to
                            DeFlock.
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
}
