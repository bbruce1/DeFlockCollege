import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import PostActions from '@/Posts/PostActions';
import SuggestPost from '@/Posts/SuggestPost';
import PostDeck from '@/Posts/PostDeck';
import { buildMemes, buildNews, buildPosts, type Post } from '@/Posts/postTemplates';
import InstagramPost from '@/Posts/InstagramPost';

interface ChapterSummary {
    slug: string;
    schoolName: string;
    shortName: string;
    instagram: string | null;
    primaryColour: string;
    secondaryColour: string;
    readersWithinMile: number;
    readersInState?: number | null;
    stateName?: string | null;
}

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Every post, in whatever colours you give it.
 *
 * Drawn in the browser rather than stored, so there is nothing to keep in sync
 * and a new post reaches every chapter the moment it is written. A chapter can
 * be named in the query, which is how the link from a creator's own page
 * arrives already wearing their colours.
 */
export default function Social({
    chapter,
    chapters,
    suggestTo,
}: {
    chapter: ChapterSummary | null;
    chapters: ChapterSummary[];
    /** Where a post suggestion is emailed. Suggestions never land on the site. */
    suggestTo: string;
}) {
    const [picked, setPicked] = useState<ChapterSummary | null>(chapter);
    const [term, setTerm] = useState('');
    const [open, setOpen] = useState(false);

    const handle = picked?.instagram ?? 'yourchapter';

    /*
     * Nothing is offered until something is typed. Dropping the whole network
     * open on focus turns a search box into a list of every chapter, which is
     * the wrong thing to hand somebody looking for one school — and it gets
     * worse with every campus that joins.
     */
    const needle = term.trim().toLowerCase();
    const matches = needle
        ? chapters.filter((c) =>
              `${c.schoolName} ${c.shortName} ${c.slug}`.toLowerCase().includes(needle),
          )
        : [];

    function choose(found: ChapterSummary) {
        setPicked(found);
        setTerm('');
        setOpen(false);
    }

    const input = {
        schoolName: picked?.schoolName ?? 'Your school',
        shortName: picked?.shortName ?? 'your campus',
        primary: HEX.test(picked?.primaryColour ?? '') ? picked!.primaryColour : '#22d3ee',
        secondary: HEX.test(picked?.secondaryColour ?? '') ? picked!.secondaryColour : '#f43f5e',
        readersWithinMile: picked?.readersWithinMile ?? null,
        readersInState: picked?.readersInState ?? null,
        stateName: picked?.stateName ?? null,
        address: picked ? `deflock.school/${picked.slug}` : 'deflock.school',
    };

    const posts = buildPosts(input);
    const memes = buildMemes(input);
    const news = buildNews(input);

    return (
        <Shell>
            <Head title="Posts for your chapter" />

            <section className="shell grid gap-6 py-16">
                <p className="annot text-net">Made for you</p>

                <h1 className="max-w-[20ch] text-[clamp(2rem,6vw,3.5rem)] uppercase leading-[1.05]">
                    Post Template<span className="text-net"> Catalog</span>
                </h1>
            </section>

            <section className="shell grid gap-4 border-t border-hair py-10">

                {picked ? (
                    <div className="flex flex-wrap items-center gap-4">
                        <span
                            className="h-9 w-9 shrink-0 border border-hair"
                            style={{
                                background: `linear-gradient(135deg, ${picked.primaryColour}, ${picked.secondaryColour})`,
                            }}
                            aria-hidden="true"
                        />
                        <span className="grid">
                            <span className="font-semibold text-glow">{picked.schoolName}</span>
                            <span className="annot text-faint">
                                deflock.school/{picked.slug}
                                {picked.instagram ? ` · @${picked.instagram}` : ''}
                            </span>
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setPicked(null);
                                setOpen(true);
                            }}
                            className="ml-auto font-data text-xs uppercase tracking-wider text-net underline underline-offset-4"
                        >
                            Change
                        </button>
                    </div>
                ) : (
                    <div className="relative max-w-lg">
                        <label className="grid gap-1">
                            <span className="annot">Find your school</span>
                            <input
                                value={term}
                                onChange={(e) => {
                                    setTerm(e.target.value);
                                    setOpen(true);
                                }}
                                onFocus={() => setOpen(true)}
                                className="field"
                                placeholder="Start typing a school name…"
                                autoComplete="off"
                                role="combobox"
                                aria-expanded={open}
                                aria-controls="chapter-matches"
                            />
                        </label>

                        {open && needle !== '' ? (
                            <ul
                                id="chapter-matches"
                                className="mt-2 grid max-h-72 gap-1 overflow-y-auto border border-hair bg-panel p-1"
                            >
                                {matches.length === 0 ? (
                                    <li className="px-3 py-3 text-sm text-faint">
                                        No chapter matches that. Check the spelling, or{' '}
                                        <Link href="/" className="text-net">
                                            start one
                                        </Link>
                                        .
                                    </li>
                                ) : (
                                    matches.map((c) => (
                                        <li key={c.slug}>
                                            <button
                                                type="button"
                                                onClick={() => choose(c)}
                                                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-void"
                                            >
                                                <span
                                                    className="h-5 w-5 shrink-0 border border-hair"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${c.primaryColour}, ${c.secondaryColour})`,
                                                    }}
                                                    aria-hidden="true"
                                                />
                                                <span className="grid">
                                                    <span className="text-sm text-glow">{c.schoolName}</span>
                                                    <span className="annot text-faint">
                                                        deflock.school/{c.slug}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        ) : null}
                    </div>
                )}
            </section>

            <section className="shell border-t border-hair py-12">
                <p className="annot text-faint">How they look</p>
                <div className="mt-6">
                    <PostDeck input={input} handle={handle} />
                </div>
            </section>

            <section className="shell border-t border-hair py-12">

                <PostGrid posts={posts} handle={handle} accent={input.primary} slug={picked?.slug} />
            </section>

            {news.length > 0 ? (
                <section className="shell border-t border-hair py-12">
                    <p className="annot text-faint">Just happened</p>
                    <h2 className="mt-2 text-2xl uppercase">News</h2>
                    <p className="mt-2 max-w-[52ch] text-sm text-dim">
                        Wins, and the other kind. Each one is dated and sourced in the caption, so
                        check the date before you post it.
                    </p>

                    <PostGrid posts={news} handle={handle} accent={input.primary} slug={picked?.slug} />
                </section>
            ) : null}

            <section className="shell border-t border-hair py-12">
                <p className="annot text-faint">For the feed</p>
                <h2 className="mt-2 text-2xl uppercase">Memes</h2>
                <p className="mt-2 max-w-[52ch] text-sm text-dim">
                    A picture, one line over it, and the payoff on the swipe. Photos and all, in
                    your colours. Every number in these is your campus's real one.
                </p>

                <PostGrid posts={memes} handle={handle} accent={input.primary} slug={picked?.slug} />
            </section>

            <section className="shell border-t border-hair py-12">
                <p className="annot text-faint">Missing one</p>
                <h2 className="mt-2 text-2xl uppercase">Suggest a post</h2>
                <p className="mt-2 max-w-[52ch] text-sm text-dim">
                    If you have posted something that worked, or there is an argument these do not
                    answer yet, say so. Good ones get drawn in every chapter's colours and appear
                    here for everybody.
                </p>

                <div className="mt-8">
                    <SuggestPost address={suggestTo} />
                </div>
            </section>

            {picked ? (
                <section className="shell border-t border-hair py-10">
                    <Link href={`/${picked.slug}`} className="text-net">
                        ← Back to the {picked.shortName} chapter
                    </Link>
                </section>
            ) : null}
        </Shell>
    );
}


function PostGrid({
    posts,
    handle,
    accent,
    slug,
}: {
    posts: Post[];
    handle: string;
    accent: string;
    slug?: string;
}) {
    return (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
                <div key={post.id} className="grid gap-3" style={{ containerType: 'inline-size' }}>
                    <InstagramPost
                        slide={post.slides[0]}
                        caption={post.caption}
                        slideCount={post.slides.length}
                        handle={handle}
                        accent={accent}
                    />

                    <p className="annot text-faint">
                        {post.date ? (
                            <>
                                <time dateTime={post.date}>{post.date}</time>
                                {' · '}
                            </>
                        ) : null}
                        {post.purpose}
                        {post.slides.length > 1 ? ` · ${post.slides.length} slides` : ''}
                    </p>

                    <PostActions post={post} slug={slug} />
                </div>
            ))}
        </div>
    );
}
