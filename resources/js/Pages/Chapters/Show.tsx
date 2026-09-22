import { Head } from '@inertiajs/react';
import type { PageProps } from '@/templates/contract';
import { FIXED } from '@/templates/contract';
import { skinFor, skinVars } from '@/templates/skins';
import Texture from '@/Chapter/Texture';
import CoverageField from '@/Chapter/CoverageField';
import type { Coverage } from '@/Chapter/CoverageField';
import Hero from '@/Chapter/Hero';
import Numbers from '@/Chapter/Numbers';
import Officials from '@/Chapter/Officials';
import Instagram from '@/Chapter/Instagram';
import Petition from '@/Chapter/Petition';
import Commitment from '@/Chapter/Commitment';
import PageFooter from '@/Chapter/PageFooter';
import Meetings from '@/Chapter/Meetings';
import type { Meeting } from '@/Chapter/Meetings';
import Carousel from '@/Chapter/Carousel';
import Dossier from '@/Chapter/Dossier';
import Evidence from '@/Chapter/Evidence';
import Faq from '@/Chapter/Faq';
import { PROBLEM } from '@/Chapter/content';

/**
 * A chapter page.
 *
 * The order is the argument: see the count, find the people who run it, then
 * write to them one at a time. Instagram sits second on every chapter because
 * an audience is the one thing the generator cannot build, and the two
 * commitments close every page at full size.
 *
 * The statewide field sits behind the whole page and does not move with the
 * scroll, so a reader keeps their own state in view the whole way down. Body
 * copy rides on a scrim rather than directly on the dots: the field stays
 * legible as atmosphere, and the words stay legible as words.
 */
export default function Show({
    chapter,
    stateName,
    officials,
    canonical,
    coverage,
    meetings,
}: PageProps & { coverage: Coverage | null; meetings: Meeting[] }) {
    const skin = skinFor(chapter.slug, chapter.colours);

    return (
        <div
            className={`motion-${skin.motion}`}
            style={{
                ...skinVars(skin),
                background: 'var(--bg)',
                color: 'var(--ink)',
                fontFamily: 'var(--body)',
                minHeight: '100vh',
                overflowX: 'hidden',
            }}
        >
            <Head>
                <title>{`${chapter.shortName} · DeFlock Campus`}</title>
                <meta
                    name="description"
                    content={`Students at ${chapter.schoolName} organising against automated license plate readers.`}
                />
                <link rel="canonical" href={canonical} />
            </Head>

            <Texture kind={skin.texture} />
            {/*
              * Pushed right so the hero has a column to itself. The state stays
              * whole and at full size; it just stops sitting under the words.
              */}
            {coverage ? <CoverageField coverage={{ ...coverage, sideShift: 0.26 }} /> : null}

            <div style={{ position: 'relative', zIndex: 1 }}>
                <Hero chapter={chapter} stateName={stateName} skin={skin} />
            </div>

            {/*
              * Nearly opaque, not fully: enough of the field reads through to
              * keep the page feeling like it sits on the map, not enough to
              * compete with a paragraph.
              */}
            <main
                style={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'color-mix(in srgb, var(--bg) 97%, transparent)',
                    backdropFilter: 'blur(3px)',
                }}
            >
                <Instagram chapter={chapter} />

                {chapter.petitionUrl ? (
                    <Petition url={chapter.petitionUrl} />
                ) : null}

                <Officials chapter={chapter} officials={officials} stateName={stateName} />

                {/*
                  * After the asks, not before them. Someone who will only do one
                  * thing should be given the email first; turning up in person is
                  * a bigger commitment and belongs to the reader who is still
                  * going after making it.
                  */}
                <Meetings meetings={meetings} />

                <Numbers chapter={chapter} stateName={stateName} />

                {/*
                  * The case itself, for a reader who arrived knowing none of it.
                  * It sits after the ask rather than before, so somebody who
                  * already agrees is not made to read an argument first.
                  */}
                {/*
                  * Turned one at a time rather than tiled. Six in a grid wrapped
                  * to four and two, leaving the second row stranded.
                  */}
                <Carousel
                    id="problem"
                    label="The problem"
                    headline="What a plate reader actually does."
                    standfirst="It is not a speed camera, and it is not looking for you in particular. That is the part that matters."
                    cards={PROBLEM}
                />

                <Evidence />

                <Dossier />

                <Faq />

                <Commitment
                    id="conduct"
                    headline={FIXED.conduct.headline}
                    body={FIXED.conduct.body}
                    tone="warn"
                />

                <Commitment
                    id="affiliation"
                    headline={FIXED.affiliation.headline}
                    body={FIXED.affiliation.body}
                />
            </main>

            <div style={{ position: 'relative', zIndex: 1, background: 'var(--bg)' }}>
                <PageFooter chapter={chapter} />
            </div>
        </div>
    );
}
