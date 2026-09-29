import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import type { Post } from '@/Posts/postTemplates';
import { usePhoto } from '@/Posts/usePhoto';
import { canCopyImages, copySlide, downloadSlide, slideFilename } from '@/Posts/exportSlide';

/**
 * Taking a post away, from the catalogue.
 *
 * "Copy this post" used to be a link to another screen, which is a fair thing
 * to offer and not what the words promise. The image goes to the clipboard
 * here, and the caption with it.
 *
 * A post with more than one slide still opens: a clipboard holds one image, and
 * handing somebody slide one of five without saying so would be worse than
 * making them click.
 */
export default function PostActions({
    post,
    slug,
}: {
    post: Post;
    slug?: string;
}) {
    const [state, setState] = useState<'idle' | 'copied' | 'saved' | 'captioned' | 'failed'>('idle');
    const photo = usePhoto(post.slides[0]?.photo);
    const single = post.slides.length === 1;
    const href = `/social/${post.id}${slug ? `?chapter=${slug}` : ''}`;

    useEffect(() => {
        if (state === 'idle') {
            return;
        }

        const timer = window.setTimeout(() => setState('idle'), 2200);

        return () => window.clearTimeout(timer);
    }, [state]);

    async function copyImage() {
        try {
            await copySlide(post.slides[0], photo);
            setState('copied');
        } catch {
            // A browser that will not take an image still gets the post: the
            // file is the thing, the clipboard was only the shortcut.
            try {
                await downloadSlide(post.slides[0], slideFilename(post.id, 0, 1, slug), photo);
                setState('saved');
            } catch {
                setState('failed');
            }
        }
    }

    async function save() {
        try {
            await downloadSlide(post.slides[0], slideFilename(post.id, 0, 1, slug), photo);
            setState('saved');
        } catch {
            setState('failed');
        }
    }

    async function copyCaption() {
        try {
            await navigator.clipboard.writeText(post.caption);
            setState('captioned');
        } catch {
            setState('failed');
        }
    }

    return (
        <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
                {single ? (
                    <button
                        type="button"
                        onClick={copyImage}
                        className="btn btn-primary"
                        style={{ touchAction: 'manipulation' }}
                    >
                        {canCopyImages() ? 'Copy image' : 'Save image'}
                    </button>
                ) : (
                    <Link href={href} className="btn btn-primary">
                        Open all {post.slides.length} slides
                    </Link>
                )}

                <button
                    type="button"
                    onClick={copyCaption}
                    className="btn btn-quiet"
                    style={{ touchAction: 'manipulation' }}
                >
                    Copy caption
                </button>

                {single ? (
                    <button
                        type="button"
                        onClick={save}
                        className="btn btn-quiet"
                        style={{ touchAction: 'manipulation' }}
                    >
                        Save PNG
                    </button>
                ) : null}
            </div>

            {/* Announced, because a clipboard gives no sign that it worked. */}
            <p role="status" aria-live="polite" className="annot min-h-[1.2rem] text-faint">
                {state === 'copied' ? 'Image copied — paste it into your post' : null}
                {state === 'saved' ? 'Saved to your downloads' : null}
                {state === 'captioned' ? 'Caption copied' : null}
                {state === 'failed' ? 'That did not work. Open the post and save it there.' : null}
            </p>
        </div>
    );
}
