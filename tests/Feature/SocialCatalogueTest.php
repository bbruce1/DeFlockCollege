<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\SchoolColours;
use Tests\TestCase;

/** The post catalogue and the page each post is taken away from. */
final class SocialCatalogueTest extends TestCase
{
    private const SLUG = 'cataloguetest';

    /**
     * Storage is isolated per test, so a chapter has to be made rather than
     * assumed. That isolation is deliberate: without it these would read and
     * write the operator's real chapters.
     */
    protected function setUp(): void
    {
        parent::setUp();

        app(ChapterRepository::class)->save(new Chapter(
            slug: self::SLUG,
            schoolName: 'Catalogue Test University',
            shortName: 'Catalogue',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'cataloguetest.edu',
            ownerRecord: Ownership::record('owner@cataloguetest.edu'),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 12, 4, 9846, '2026-09-15'),
            instagram: 'deflock.catalogue',
            colours: new SchoolColours('#003057', '#b3a369'),
            createdAt: '2026-09-15T00:00:00+00:00',
            updatedAt: '2026-09-15T00:00:00+00:00',
        ));
    }

    public function test_the_catalogue_lists_every_chapter_to_choose_from(): void
    {
        $this->get('/social')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Social')->has('chapters'));
    }

    public function test_a_post_has_its_own_page(): void
    {
        $this->get('/social/what')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('CopyPost')
                ->where('postId', 'what'));
    }

    public function test_a_post_page_can_be_opened_in_a_chapters_colours(): void
    {
        $this->get('/social/count?chapter='.self::SLUG)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('CopyPost')
                ->where('chapter.slug', self::SLUG)
                ->where('chapter.primaryColour', '#003057'));
    }

    public function test_an_unknown_chapter_in_the_query_is_ignored_rather_than_fatal(): void
    {
        $this->get('/social/count?chapter=no-such-chapter')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('chapter', null));
    }

    public function test_a_post_id_cannot_carry_a_path(): void
    {
        // The id reaches a route parameter, so the shape is constrained rather
        // than trusted.
        $this->get('/social/..%2F..%2Fetc')->assertNotFound();
        $this->get('/social/WITH-CAPS')->assertNotFound();
    }
}
