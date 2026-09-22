<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Metrics\OutreachLog;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * The count vision.md says the project is judged on.
 *
 * Worth guarding: a number that silently stops moving looks exactly like a
 * project that stopped working, and the two would be indistinguishable.
 */
final class OutreachCountedTest extends TestCase
{
    private const SLUG = 'countedtest';

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::clear('outreach:'.self::SLUG);

        app(ChapterRepository::class)->save(new Chapter(
            slug: self::SLUG,
            schoolName: 'Counted Test University',
            shortName: 'Counted',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'countedtest.edu',
            ownerRecord: Ownership::record('owner@countedtest.edu'),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 9, 3, 9846, '2026-09-15'),
            instagram: 'deflock.counted',
            officials: [[
                'name' => 'Jane Doe',
                'title' => 'Councilmember',
                'email' => 'jane@example.gov',
                'url' => null,
                'role' => 'city-council',
                'scope' => 'chapter',
            ]],
            createdAt: '2026-09-15T00:00:00+00:00',
            updatedAt: '2026-09-15T00:00:00+00:00',
        ));
    }

    public function test_opening_a_letter_is_counted(): void
    {
        $this->assertSame(0, app(OutreachLog::class)->total(self::SLUG));

        $this->postJson('/'.self::SLUG.'/email', ['official' => 0])->assertOk();

        $this->assertSame(1, app(OutreachLog::class)->total(self::SLUG));
    }

    public function test_the_count_holds_no_identity(): void
    {
        $this->postJson('/'.self::SLUG.'/email', ['official' => 0])->assertOk();

        // Whatever is written down must be counts and dates, nothing else: this
        // is a project whose whole posture is holding almost nothing.
        $stored = app(OutreachLog::class)->read(self::SLUG);

        foreach ($stored as $day => $count) {
            $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $day);
            $this->assertIsInt($count);
        }
    }

    public function test_a_chapter_that_does_not_exist_counts_nothing(): void
    {
        $this->postJson('/no-such-chapter/email', ['official' => 0])->assertNotFound();

        $this->assertSame([], app(OutreachLog::class)->totals());
    }
}
