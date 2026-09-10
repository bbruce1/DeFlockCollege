<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\Slug;
use Tests\TestCase;

/**
 * What a shared link looks like in a message.
 *
 * Every tag here has to be in the HTML the server returns. Messages, Slack and
 * every search crawler fetch the URL and read it without running JavaScript, so
 * a tag set from a React component is never seen — which is exactly what was
 * happening to the canonical link before this existed.
 */
final class LinkPreviewTest extends TestCase
{
    private const SLUG = 'previewtest';

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedChapter();
    }

    protected function tearDown(): void
    {
        app(ChapterRepository::class)->delete(Slug::fromString(self::SLUG));

        parent::tearDown();
    }

    public function test_the_front_page_carries_a_full_preview_in_its_html(): void
    {
        $html = $this->get('/')->assertOk()->getContent();

        foreach ([
            'property="og:title"',
            'property="og:description"',
            'property="og:image"',
            'property="og:url"',
            'property="og:type"',
            'property="og:site_name"',
            'name="twitter:card"',
            'name="description"',
            'rel="canonical"',
        ] as $tag) {
            $this->assertStringContainsString($tag, $html, "{$tag} is missing from the server's HTML.");
        }
    }

    /** A preview image has to be absolute; a path has nothing to resolve against. */
    public function test_the_preview_image_is_an_absolute_url(): void
    {
        preg_match('/property="og:image" content="([^"]+)"/', $this->get('/')->getContent(), $m);

        $this->assertNotEmpty($m, 'No og:image was rendered.');
        $this->assertMatchesRegularExpression('#\Ahttps?://#', $m[1]);
    }

    public function test_the_preview_image_actually_exists(): void
    {
        foreach ([
            'og-image.png', 'favicon.ico', 'apple-touch-icon.png',
            'favicon-32.png', 'favicon-16.png', 'icon-192.png', 'icon-512.png',
        ] as $file) {
            $this->assertFileExists(public_path($file));
        }
    }

    public function test_a_chapter_carries_its_own_school_not_the_site_boilerplate(): void
    {
        $html = $this->get('/'.self::SLUG)->assertOk()->getContent();

        $this->assertStringContainsString('Preview Tech', $html);
        $this->assertStringContainsString('property="og:type" content="article"', $html);
        $this->assertStringNotContainsString(
            'Get plate readers off your campus',
            $html,
            'A chapter is showing the front page\'s preview text.'
        );
    }

    /** A preview must never state a figure the chapter does not have. */
    public function test_an_unsurveyed_chapter_states_no_count(): void
    {
        $this->seedChapter(readersWithinMile: null);

        preg_match(
            '/property="og:description" content="([^"]*)"/',
            $this->get('/'.self::SLUG)->getContent(),
            $m,
        );

        $this->assertNotEmpty($m);
        $this->assertStringNotContainsString('0 automated', $m[1]);
        $this->assertDoesNotMatchRegularExpression('/\b\d+ automated plate readers\b/', $m[1]);
    }

    public function test_pages_behind_a_signed_link_are_not_indexed(): void
    {
        // The unlock screen is the one private page reachable without a ticket.
        $html = $this->get('/'.self::SLUG.'/edit')->assertOk()->getContent();

        $this->assertStringContainsString('name="robots" content="noindex', $html);
        $this->assertStringNotContainsString('rel="canonical"', $html);
    }

    /** Nothing gated should be crawled either, whatever its tags say. */
    public function test_robots_txt_keeps_crawlers_off_the_gated_paths(): void
    {
        $robots = file_get_contents(public_path('robots.txt'));

        foreach (['/admin', '/start', '/districts', '/*/welcome', '/*/edit'] as $path) {
            $this->assertStringContainsString("Disallow: {$path}", $robots);
        }
    }

    public function test_each_page_has_its_own_title(): void
    {
        $titles = [];

        foreach (['/', '/about', '/contact', '/chapters', '/'.self::SLUG] as $path) {
            preg_match('/<title[^>]*>([^<]*)<\/title>/', $this->get($path)->getContent(), $m);
            $titles[$path] = trim($m[1] ?? '');
        }

        $this->assertSame(
            count($titles),
            count(array_unique($titles)),
            'Two pages share a title: '.json_encode($titles)
        );
    }

    private function seedChapter(?int $readersWithinMile = 41): void
    {
        app(ChapterRepository::class)->save(new Chapter(
            slug: self::SLUG,
            schoolName: 'Preview Institute of Technology',
            shortName: 'Preview Tech',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'preview.edu',
            ownerRecord: Ownership::record('owner@preview.edu'),
            survey: new ReaderSurvey(
                point: new CampusPoint(33.7756, -84.3963),
                readersWithinMile: $readersWithinMile,
                flockCount: $readersWithinMile === null ? null : 12,
                readersInState: 9855,
                generatedAt: '2026-09-09',
            ),
            instagram: null,
            tiktok: null,
            petitionUrl: null,
            officials: [],
            editKeyHash: '',
            acknowledgedAt: null,
            colours: null,
            createdAt: '2026-09-09T00:00:00+00:00',
            updatedAt: '2026-09-09T00:00:00+00:00',
        ));
    }
}
