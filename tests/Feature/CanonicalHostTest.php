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
 * Which host serves what.
 *
 * www is the site's front door; a chapter gets its own subdomain; the bare apex
 * redirects to www so one page does not answer on two addresses. The trap is
 * that the chapter subdomain is a wildcard, so without an exclusion it swallows
 * www and every other reserved label and looks them up as chapters — which it
 * did, returning 404 for the site's own home page.
 */
final class CanonicalHostTest extends TestCase
{
    private const APEX = 'deflock.school';

    /**
     * The apex has to be in the environment before the application boots:
     * routes/web.php reads it while loading, so setting it afterwards leaves
     * the subdomain group unregistered.
     */
    protected function setUp(): void
    {
        putenv('APP_DOMAIN='.self::APEX);
        $_ENV['APP_DOMAIN'] = self::APEX;
        $_SERVER['APP_DOMAIN'] = self::APEX;

        parent::setUp();

        $this->seedChapter();
    }

    protected function tearDown(): void
    {
        app(ChapterRepository::class)->delete(Slug::fromString('hosttest'));

        putenv('APP_DOMAIN');
        unset($_ENV['APP_DOMAIN'], $_SERVER['APP_DOMAIN']);

        parent::tearDown();
    }

    public function test_www_serves_the_front_page(): void
    {
        $this->get('http://www.'.self::APEX.'/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Home'));
    }

    public function test_www_serves_the_rest_of_the_site(): void
    {
        $this->get('http://www.'.self::APEX.'/about')->assertOk();
        $this->get('http://www.'.self::APEX.'/contact')->assertOk();

        $this->get('http://www.'.self::APEX.'/hosttest')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Chapters/Show'));
    }

    public function test_a_chapter_answers_on_its_own_subdomain(): void
    {
        $this->get('http://hosttest.'.self::APEX.'/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Chapters/Show'));
    }

    public function test_the_bare_apex_redirects_to_www(): void
    {
        $this->get('http://'.self::APEX.'/')
            ->assertStatus(301)
            ->assertRedirect('http://www.'.self::APEX.'/');

        $this->get('http://'.self::APEX.'/about?ref=x')
            ->assertStatus(301)
            ->assertRedirect('http://www.'.self::APEX.'/about?ref=x');
    }

    public function test_a_chapter_subdomain_is_never_redirected(): void
    {
        $this->get('http://hosttest.'.self::APEX.'/')->assertOk();
        $this->get('http://www.'.self::APEX.'/')->assertOk();
    }

    /**
     * Every reserved label has to fall through to the site rather than be
     * looked up as a chapter, or pointing DNS at this breaks them all at once.
     */
    public function test_reserved_labels_reach_the_site_not_a_chapter_lookup(): void
    {
        foreach (['www', 'api', 'admin', 'mail', 'app', 'help', 'docs', 'status'] as $label) {
            $this->get("http://{$label}.".self::APEX.'/')
                ->assertOk()
                ->assertInertia(
                    fn ($page) => $page->component('Home'),
                );
        }
    }

    /** A label that merely starts with a reserved word is still a chapter. */
    public function test_a_label_beginning_with_a_reserved_word_is_still_a_chapter(): void
    {
        // "app" is reserved; "appstate" is a real school and must not be.
        $this->get('http://appstate.'.self::APEX.'/')->assertNotFound();

        $this->get('http://notachapter.'.self::APEX.'/')->assertNotFound();
    }

    /**
     * Every local machine runs without an apex, and must not be redirected to
     * "www." followed by nothing. The middleware reads config per request, so
     * this one can be turned off in place.
     */
    public function test_nothing_redirects_when_no_apex_is_configured(): void
    {
        config(['app.domain' => '']);

        $this->get('http://localhost/')->assertOk();
        $this->get('http://localhost/about')->assertOk();
    }

    private function seedChapter(): void
    {
        app(ChapterRepository::class)->save(new Chapter(
            slug: 'hosttest',
            schoolName: 'Host Test College',
            shortName: 'Host Test',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'hosttest.edu',
            ownerRecord: Ownership::record('owner@hosttest.edu'),
            survey: new ReaderSurvey(
                point: new CampusPoint(33.7756, -84.3963),
                readersWithinMile: 4,
                flockCount: 1,
                readersInState: 100,
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
