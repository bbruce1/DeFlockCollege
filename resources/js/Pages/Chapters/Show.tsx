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
}: PageProps & { coverage: Coverage | null }) {
    const skin = skinFor(chapter.slug, chapter.colours);

    return (
        <div
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
            {coverage ? <CoverageField coverage={coverage} /> : null}

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

                <Numbers chapter={chapter} stateName={stateName} />

                <Commitment
                    id="conduct"
                    headline={FIXED.conduct.headline}
                    body={FIXED.conduct.body}
                    tone="signal"
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
