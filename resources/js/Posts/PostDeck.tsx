import { useState } from 'react';
import type { PostInput } from '@/Posts/postTemplates';
import { buildPosts } from '@/Posts/postTemplates';
import InstagramPost from '@/Posts/InstagramPost';

/** How many cards deep the stack goes before one stops being drawn. */
const VISIBLE_DEPTH = 2;

/**
 * The posts, dealt face on with the rest angled away behind.
 *
 * The deck has no ends. Each card's place is worked out from the shortest way
 * round rather than from its index, so the one on the far left of the stack is
 * also the one waiting on the right — going forward from the last post arrives
 * at the first, and neither arrow is ever dead.
 *
 * Every post stays mounted at every position. Cards past the visible depth are
 * transparent, not removed, so all of the text is in the document at first
 * paint and none of it depends on the transition running.
 */
export default function PostDeck({ input, handle }: { input: PostInput; handle: string }) {
    const posts = buildPosts(input);
    const [active, setActive] = useState(0);

    const wrap = (index: number) => ((index % posts.length) + posts.length) % posts.length;

    return (
        <div>
            <div
                tabIndex={0}
                role="group"
                aria-label="The posts made for this chapter"
                onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft') {
                        event.preventDefault();
                        setActive((n) => wrap(n - 1));
                    }

                    if (event.key === 'ArrowRight') {
                        event.preventDefault();
                        setActive((n) => wrap(n + 1));
                    }
                }}
                style={{
                    perspective: '1400px',
                    position: 'relative',
                    height: 'clamp(25rem, 80vw, 31rem)',
                }}
            >
                {posts.map((slide, index) => {
                    /*
                     * The shortest signed distance round the loop. A card three
                     * to the right of the front in a deck of five is really two
                     * to the left, and placing it there is what makes the ends
                     * disappear.
                     */
                    const forward = wrap(index - active);
                    const offset = forward > posts.length / 2 ? forward - posts.length : forward;
                    const depth = Math.abs(offset);
                    const facing = offset === 0;
                    const hidden = depth > VISIBLE_DEPTH;

                    return (
                        <div
                            key={slide.id}
                            onClick={() => setActive(index)}
                            aria-hidden={!facing}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                width: 'clamp(13rem, 46vw, 16.5rem)',
                                marginLeft: 'calc(clamp(13rem, 46vw, 16.5rem) / -2)',
                                transform:
                                    `translateX(${offset * 62}%) ` +
                                    `translateZ(${-depth * 190}px) ` +
                                    `rotateY(${offset * -26}deg) ` +
                                    `scale(${Math.max(0.7, 1 - depth * 0.05)})`,
                                zIndex: posts.length - depth,
                                opacity: hidden ? 0 : 1,
                                filter: facing ? 'none' : `brightness(${0.72 - depth * 0.08})`,
                                pointerEvents: hidden ? 'none' : 'auto',
                                cursor: facing ? 'default' : 'pointer',
                                transition:
                                    'transform 460ms cubic-bezier(0.2, 0.7, 0.3, 1), opacity 460ms, filter 460ms',
                                containerType: 'inline-size',
                            }}
                        >
                            <InstagramPost
                                slide={slide.slides[0]}
                                caption={slide.caption}
                                slideCount={slide.slides.length}
                                handle={handle}
                                accent={input.primary}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
                {/* Never disabled: the deck loops, so there is nowhere it cannot go. */}
                <button
                    type="button"
                    onClick={() => setActive((n) => wrap(n - 1))}
                    className="map-zoom"
                    aria-label="Previous post"
                >
                    ‹
                </button>

                <div className="flex items-center gap-2">
                    {posts.map((slide, index) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => setActive(index)}
                            aria-label={`Show post ${index + 1}: ${slide.purpose}`}
                            aria-current={index === active}
                            style={{
                                width: index === active ? 22 : 8,
                                height: 8,
                                borderRadius: 4,
                                border: 'none',
                                cursor: 'pointer',
                                background: index === active ? 'var(--color-net)' : 'var(--color-hair-lit)',
                                transition: 'width 240ms, background 240ms',
                            }}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => setActive((n) => wrap(n + 1))}
                    className="map-zoom"
                    aria-label="Next post"
                >
                    ›
                </button>
            </div>

            <p className="mt-4 text-center annot text-faint">
                {active + 1} of {posts.length} · {posts[active].purpose}
            </p>
        </div>
    );
}
