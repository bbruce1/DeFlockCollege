<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\EditKey;
use App\Chapters\EditPass;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\SchoolColours;
use App\Chapters\Slug;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * Fields a creator set must survive every later write to their chapter.
 *
 * A chapter is one JSON file rewritten whole on every save, so any write path
 * that forgets a field deletes it. There is no column left behind to notice, no
 * error, and no diff a creator is shown — the page simply comes back without
 * the thing they chose. These are the writes that a creator's own actions
 * trigger, checked against the two fields nothing on the way in re-supplies.
 */
final class ChapterFieldRetentionTest extends TestCase
{
    private const SLUG = 'retentiontest';

    private const KEY = 'ABCDE-FGHJK-LMNPQ-RSTUV';

    private const OWNER = 'owner@retention.edu';

    private const PRIMARY = '#003057';

    private const SECONDARY = '#b3a369';

    private const TIKTOK = 'deflock.retention';

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedChapter();
        RateLimiter::clear('chapter-unlock:'.self::SLUG);
    }

    public function test_acknowledging_the_edit_key_keeps_the_school_colours(): void
    {
        $this->withSession(['editKey' => self::KEY])
            ->post('/'.self::SLUG.'/acknowledge', [
                'savedKey' => true,
                'knowsEditButton' => true,
            ])
            ->assertRedirect('/'.self::SLUG);

        $colours = $this->reload()->colours;

        $this->assertNotNull(
            $colours,
            'ticking the two boxes on the welcome screen must not discard the colours the creator chose',
        );
        $this->assertSame(self::PRIMARY, $colours->primary);
        $this->assertSame(self::SECONDARY, $colours->secondary);
    }

    public function test_acknowledging_the_edit_key_keeps_the_tiktok_handle(): void
    {
        $this->withSession(['editKey' => self::KEY])
            ->post('/'.self::SLUG.'/acknowledge', [
                'savedKey' => true,
                'knowsEditButton' => true,
            ]);

        $this->assertSame(self::TIKTOK, $this->reload()->tiktok);
    }

    /**
     * The edit form posts exactly these keys. It carries no colour fields, so a
     * save that only re-supplies what the form holds must leave the rest alone
     * rather than reading absence as "the creator cleared this".
     */
    public function test_saving_from_the_edit_form_keeps_the_school_colours(): void
    {
        $this->patch('/'.self::SLUG, [
            'pass' => EditPass::issue(self::SLUG)->toToken(),
            'ticket' => '',
            'instagram' => 'deflock.retention',
            'petitionUrl' => '',
            'officials' => [
                ['name' => 'A Councillor', 'title' => 'Ward 1', 'email' => 'a@example.gov', 'url' => '', 'role' => 'city-council'],
            ],
        ])->assertSessionHasNoErrors();

        $colours = $this->reload()->colours;

        $this->assertNotNull(
            $colours,
            'editing an unrelated field must not discard the colours the creator chose',
        );
        $this->assertSame(self::PRIMARY, $colours->primary);
    }

    public function test_saving_from_the_edit_form_keeps_the_tiktok_handle(): void
    {
        $this->patch('/'.self::SLUG, [
            'pass' => EditPass::issue(self::SLUG)->toToken(),
            'ticket' => '',
            'instagram' => 'deflock.retention',
            'petitionUrl' => '',
            'officials' => [],
        ])->assertSessionHasNoErrors();

        $this->assertSame(self::TIKTOK, $this->reload()->tiktok);
    }

    private function reload(): Chapter
    {
        return app(ChapterRepository::class)->find(Slug::fromString(self::SLUG));
    }

    private function seedChapter(): void
    {
        app(ChapterRepository::class)->save(new Chapter(
            slug: self::SLUG,
            schoolName: 'Retention Institute of Technology',
            shortName: 'Retention',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'retention.edu',
            ownerRecord: Ownership::record(self::OWNER),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 5, 2, 9846, '2026-09-09'),
            instagram: 'deflock.retention',
            tiktok: self::TIKTOK,
            editKeyHash: EditKey::hash(self::KEY),
            colours: new SchoolColours(self::PRIMARY, self::SECONDARY),
            createdAt: '2026-09-09T00:00:00+00:00',
            updatedAt: '2026-09-09T00:00:00+00:00',
        ));
    }
}
