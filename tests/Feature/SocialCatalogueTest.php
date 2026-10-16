<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\SchoolColours;
use App\Site\PostCatalogue;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

/** The post catalogue and the page each post is taken away from. */
final class SocialCatalogueTest extends TestCase
{
    private const SLUG = 'cataloguetest';

    /** A post that exists for any chapter, surveyed or not. */
    private const POST = 'clingy-ex';

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
        $this->get('/social/'.self::POST)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('CopyPost')
                ->where('postId', self::POST));
    }

    /** A soft 404 tells a search engine that a stale link is a real page. */
    public function test_an_unknown_post_is_a_real_404(): void
    {
        $this->get('/social/no-such-post')
            ->assertNotFound()
            ->assertInertia(fn ($page) => $page
                ->component('Error')
                ->where('status', 404)
                ->where('meta.noindex', true));
    }

    public function test_a_slide_id_is_not_a_post(): void
    {
        $this->get('/social/'.self::POST.'-1')->assertNotFound();
    }

    /**
     * The server reads post ids out of the TypeScript sets. Every post declares
     * a kind, so counting those is an independent count of posts: if the two
     * disagree, a post was written in a shape the reader cannot see, or two
     * posts share an id, and either would 404 a real post.
     */
    public function test_the_server_sees_every_post_in_the_sets(): void
    {
        $declared = 0;

        foreach (File::glob(resource_path('js/Posts/sets/*.ts')) as $file) {
            $declared += preg_match_all('/^\s*kind:\s*[\'"]/m', File::get($file));
        }

        $ids = app(PostCatalogue::class)->ids();

        $this->assertGreaterThan(0, $declared);
        $this->assertCount($declared, $ids, 'A post in resources/js/Posts/sets was not found by its id.');
        $this->assertSame($ids, array_values(array_unique($ids)), 'Two posts share an id.');
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
