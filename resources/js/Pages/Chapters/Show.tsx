import { Head } from '@inertiajs/react';
import { Suspense, lazy, useMemo } from 'react';
import type { Chapter, Section } from '@/templates/contract';
import { loadTemplate, templateFor } from '@/templates/registry';

/**
 * A chapter page.
 *
 * This component chooses a template and gets out of the way. It deliberately
 * renders no chrome of its own: the whole point of ten templates is that a
 * chapter does not look like the network around it.
 *
 * The template is chosen by a seed derived from the slug, so the assignment is
 * stable without being stored, and it is loaded lazily so a visitor downloads
 * one template rather than ten.
 */

interface Props {
    chapter: Chapter;
    sections: Section[];
    stateName: string;
    coverage: number;
}

export default function Show({ chapter, sections, stateName, coverage }: Props) {
    const name = templateFor(chapter.slug);
    const Template = useMemo(() => lazy(loadTemplate(name)), [name]);

    const title =
        chapter.status === 'live'
            ? `${chapter.map.readersWithinMile} plate readers around ${chapter.shortName}`
            : `No plate readers mapped around ${chapter.shortName} yet`;

    const description =
        chapter.status === 'live'
            ? `${chapter.map.readersWithinMile} automated plate readers ring ${chapter.shortName}. ` +
              `See who can remove them and email all of them in about a minute.`
            : `Nobody has mapped plate readers around ${chapter.shortName} yet. ` +
              `See what is there and help put them on the map.`;

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                {/* A chapter with nothing mapped has nothing to say to a search engine yet. */}
                {chapter.status !== 'live' && <meta name="robots" content="noindex" />}
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <Suspense fallback={<div className="min-h-screen bg-void" />}>
                <Template
                    chapter={chapter}
                    sections={sections}
                    stateName={stateName}
                    coverage={coverage}
                />
            </Suspense>
        </>
    );
}
