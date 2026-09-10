<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\EditKey;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\SchoolColours;
use App\Chapters\Slug;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * The nightly re-count.
 *
 * It runs unattended against every chapter in the network, which makes it the
 * most dangerous writer in the application: nobody is watching it, and a
 * chapter file is rewritten whole. Anything it forgets to carry across is gone
 * from every chapter at once, and the edit key hash cannot be regenerated.
 */
final class RefreshChaptersCommandTest extends TestCase
{
    private const SLUG = 'refreshtest';

    private const KEY = 'ABCDE-FGHJK-LMNPQ-RSTUV';

    private const TIKTOK = 'deflock.refresh';

    protected function setUp(): void
    {
        parent::setUp();

        // No real query leaves the machine: Overpass is a free community
        // service and a test run is not a reason to spend a slot.
        Http::fake(['*' => Http::response(['elements' => []])]);

        $this->seedChapter();
    }

    public function test_a_refresh_keeps_everything_a_person_authored(): void
    {
        $this->artisan('chapters:refresh', ['--slug' => self::SLUG, '--pause' => 0]);

        $chapter = $this->reload();

        $this->assertTrue(
            EditKey::matches($chapter->editKeyHash, self::KEY),
            'a refresh must not lock the creator out of their own chapter',
        );
        $this->assertSame(self::TIKTOK, $chapter->tiktok);
        $this->assertCount(1, $chapter->officials);
        $this->assertNotNull($chapter->colours, 'the school colours must survive a refresh');
        $this->assertSame('#003057', $chapter->colours->primary);
        $this->assertSame('2026-09-09T00:00:00+00:00', $chapter->acknowledgedAt);
        $this->assertSame('deflock.refresh', $chapter->instagram);
        $this->assertSame('https://example.org/petition', $chapter->petitionUrl);
    }

    public function test_a_refresh_still_carries_the_old_counts_forward(): void
    {
        $this->artisan('chapters:refresh', ['--slug' => self::SLUG, '--pause' => 0]);

        $survey = $this->reload()->survey;

        $this->assertSame(5, $survey->previous['readersWithinMile'] ?? null);
    }

    public function test_an_unknown_slug_refreshes_nothing(): void
    {
        $this->artisan('chapters:refresh', ['--slug' => 'no-such-chapter', '--pause' => 0])
            ->expectsOutputToContain('No chapters to refresh.')
            ->assertExitCode(0);

        $this->assertSame(5, $this->reload()->survey->readersWithinMile);
    }

    private function reload(): Chapter
    {
        return app(ChapterRepository::class)->find(Slug::fromString(self::SLUG));
    }

    private function seedChapter(): void
    {
        app(ChapterRepository::class)->save(new Chapter(
            slug: self::SLUG,
            schoolName: 'Refresh State University',
            shortName: 'Refresh State',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'refresh.edu',
            ownerRecord: Ownership::record('owner@refresh.edu'),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 5, 2, 9846, '2026-09-09'),
            instagram: 'deflock.refresh',
            tiktok: self::TIKTOK,
            petitionUrl: 'https://example.org/petition',
            officials: [[
                'name' => 'A Councillor',
                'title' => 'Ward 1',
                'email' => 'councillor@example.gov',
                'url' => 'https://example.gov/ward-1',
                'role' => 'city-council',
            ]],
            editKeyHash: EditKey::hash(self::KEY),
            acknowledgedAt: '2026-09-09T00:00:00+00:00',
            colours: new SchoolColours('#003057', '#b3a369'),
            createdAt: '2026-09-09T00:00:00+00:00',
            updatedAt: '2026-09-09T00:00:00+00:00',
        ));
    }
}
