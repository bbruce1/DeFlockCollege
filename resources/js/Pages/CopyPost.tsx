import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import { allPosts, type Post, type PostSlide } from '@/Posts/postTemplates';
import { drawSlide } from '@/Posts/renderSlide';
import { loadPostFonts, POST_FONTS } from '@/Posts/exportSlide';
import { usePhoto } from '@/Posts/usePhoto';

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

/**
 * One post, ready to be taken away.
 *
 * Everything here is produced in the browser: the slides are drawn to a canvas
 * at full size so they save as real files, and the caption is text. Nothing is
 * stored, nothing is uploaded, and nothing touches anybody's account.
 */
export default function CopyPost({
    postId,
    chapter,
}: {
    postId: string;
    chapter: ChapterSummary | null;
}) {
    const input = {
        schoolName: chapter?.schoolName ?? 'Your school',
        shortName: chapter?.shortName ?? 'your campus',
        primary: chapter?.primaryColour ?? '#22d3ee',
        secondary: chapter?.secondaryColour ?? '#f43f5e',
        readersWithinMile: chapter?.readersWithinMile ?? null,
        readersInState: chapter?.readersInState ?? null,
        stateName: chapter?.stateName ?? null,
        address: chapter ? `deflock.school/${chapter.slug}` : 'deflock.school',
    };

    const post =
        allPosts(input).find((p) => p.id === postId) ?? null;
    const [copied, setCopied] = useState(false);


    useEffect(() => {
        if (!copied) {
            return;
        }

        const timer = window.setTimeout(() => setCopied(false), 1800);

        return () => window.clearTimeout(timer);
    }, [copied]);

    if (!post) {
        return (
            <Shell>
                <Head title="No such post" />
                <section className="shell grid min-h-[60vh] content-center gap-5 py-24">
                    <p className="annot text-signal">Not found</p>
                    <h1 className="text-[clamp(2rem,6vw,3.25rem)] uppercase">No post by that name</h1>
                    <p className="max-w-[46ch] text-dim">
                        The set changes as posts are added, so a saved link can go stale.
                    </p>
                    <Link href="/social" className="btn btn-primary justify-self-start">
                        Back to the catalogue
                    </Link>
                </section>
            </Shell>
        );
    }

    async function copyCaption() {
        try {
            await navigator.clipboard.writeText(post!.caption);
            setCopied(true);
        } catch {
            // Clipboard access is refused in some browsers; the caption is on
            // screen and selectable either way.
            setCopied(false);
        }
    }

    return (
        <Shell>
            <Head title={`${post.purpose} — copy this post`} />

            {/*
              * No headings, no explainer. Somebody arriving here has already
              * chosen this post and knows what it is for — what they came for is
              * the files and the words, so that is all there is.
              */}
            <section className="shell grid gap-6 py-10">
                <Link href={`/social${chapter ? `?chapter=${chapter.slug}` : ''}`} className="annot text-net">
                    ← All posts
                </Link>

                {post.audio ? <AudioSheet audio={post.audio} slides={post.slides.length} /> : null}


                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {post.slides.map((slide, index) => (
                        <SlideCard
                            key={slide.id}
                            slide={slide}
                            index={index}
                            total={post.slides.length}
                            name={`${chapter?.slug ?? 'deflock'}-${post.id}-${index + 1}.png`}
                        />
                    ))}
                </div>

                <div className="grid gap-3">
                    <p className="max-w-[60ch] whitespace-pre-wrap border border-hair bg-panel p-5 leading-relaxed">
                        {post.caption}
                    </p>

                    <button type="button" onClick={copyCaption} className="btn btn-primary justify-self-start">
                        {copied ? 'Copied' : 'Copy the caption'}
                    </button>
                </div>
            </section>

        </Shell>
    );
}

function SlideCard({
    slide,
    index,
    total,
    name,
}: {
    slide: PostSlide;
    index: number;
    total: number;
    name: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const photo = usePhoto(slide.photo);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        // Waits for the webfonts, or the first draw measures fallback metrics
        // and wraps the headline in the wrong places. The slide is drawn again
        // once its photo arrives, and the earlier wait can finish second, so
        // only the latest draw is allowed to paint.
        let isCurrent = true;

        loadPostFonts().then(() => {
            if (isCurrent) {
                drawSlide(canvas, slide, POST_FONTS, photo);
            }
        });

        return () => {
            isCurrent = false;
        };
    }, [slide, photo]);

    function download() {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const link = document.createElement('a');
        link.download = name;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    return (
        <div className="grid gap-3">
            <canvas
                ref={canvasRef}
                className="w-full border border-hair"
                style={{ aspectRatio: '1 / 1' }}
                role="img"
                aria-label={slide.alt}
            />

            <div className="flex items-center justify-between gap-3">
                {/*
                  * The number carries the weight, because it is the one thing
                  * that has to survive a glance: these are saved in order and
                  * uploaded in order, and getting that wrong reorders the post.
                  */}
                <span className="annot text-glow">
                    <strong className="font-bold">Slide {index + 1}</strong>
                    {total > 1 ? ` of ${total}` : ''}
                </span>
                <button type="button" onClick={download} className="btn btn-quiet">
                    Save PNG
                </button>
            </div>
        </div>
    );
}

/**
 * When each slide should land, for anyone posting this as a reel.
 *
 * The timings belong to the post. The track does not: naming one would be
 * claiming it still exists, still has that edit, and still changes where we say
 * — none of which can be checked from here.
 */
function AudioSheet({
    audio,
    slides,
}: {
    audio: NonNullable<Post['audio']>;
    slides: number;
}) {
    return (
        <div className="grid gap-3">
            <p className="max-w-[54ch] text-sm text-dim">{audio.style}</p>

            <ol className="grid max-w-[46rem] gap-2">
                {audio.cues.map((cue) => (
                    <li
                        key={cue.atSeconds}
                        className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border border-hair bg-panel px-4 py-3"
                    >
                        <span className="font-data text-lg font-semibold text-net">
                            {timecode(cue.atSeconds)}
                        </span>
                        <span>
                            <strong className="font-bold text-glow">Slide {cue.slide}</strong>
                            {cue.slide > slides ? ' (not in this post)' : ''}
                        </span>
                        <span className="text-sm text-dim">{cue.note}</span>
                    </li>
                ))}
            </ol>

            <p className="max-w-[54ch] text-sm text-faint">
                {audio.title
                    ? `Set to ${audio.title}${audio.artist ? ` by ${audio.artist}` : ''}.`
                    : 'No track is named on purpose — we cannot check that a given song still has the edit these timings assume. Pick one, then check the changes land where they should.'}
            </p>
        </div>
    );
}

function timecode(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    // Half-second cues are real ("the drop at 2.5s"), so keep one decimal
    // rather than rounding a cue onto the wrong beat.
    const shown = Number.isInteger(rest) ? String(rest) : rest.toFixed(1);

    return `${minutes}:${shown.padStart(Number.isInteger(rest) ? 2 : 4, '0')}`;
}
