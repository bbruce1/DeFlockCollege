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
use Tests\TestCase;

/**
 * Who is allowed to write to a chapter that already exists.
 *
 * Every route that changes a chapter has to name the proof it wants and check
 * it against that chapter. A route that writes on nothing but a URL is a route
 * anybody can point at any chapter in the network.
 */
final class ChapterWriteAuthorisationTest extends TestCase
{
    private const SLUG = 'authtestchapter';

    private const OTHER_SLUG = 'authtestneighbour';

    private const KEY = 'ABCDE-FGHJK-LMNPQ-RSTUV';

    private const OWNER = 'owner@authtest.edu';

    private const TIKTOK = 'deflock.authtest';

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedChapter(self::SLUG, 'authtest.edu');
        $this->seedChapter(self::OTHER_SLUG, 'neighbour.edu');
    }

    public function test_a_stranger_cannot_acknowledge_somebody_elses_chapter(): void
    {
        // The welcome screen is reached with the key flashed into the session by
        // the create request. Without it this is a write to a stranger's chapter
        // by anybody who can read its address off the public index.
        $this->post('/'.self::SLUG.'/acknowledge', [
            'savedKey' => true,
            'knowsEditButton' => true,
        ])->assertRedirect('/'.self::SLUG);

        $this->assertNull(
            $this->reload(self::SLUG)->acknowledgedAt,
            'a request carrying no proof must not be recorded as the creator confirming anything',
        );
    }

    public function test_the_creator_can_still_acknowledge_from_the_welcome_screen(): void
    {
        $this->withSession(['editKey' => self::KEY])
            ->post('/'.self::SLUG.'/acknowledge', [
                'savedKey' => true,
                'knowsEditButton' => true,
            ])->assertRedirect('/'.self::SLUG);

        $this->assertNotNull($this->reload(self::SLUG)->acknowledgedAt);
    }

    public function test_an_edit_pass_for_one_chapter_cannot_save_another(): void
    {
        $pass = EditPass::issue(self::OTHER_SLUG)->toToken();

        $this->patch('/'.self::SLUG, [
            'pass' => $pass,
            'instagram' => 'taken.over',
        ])->assertSessionHasErrors('key');

        $this->assertSame(
            'deflock.authtest',
            $this->reload(self::SLUG)->instagram,
            'a pass issued for one chapter must not write to another',
        );
    }

    /**
     * The counterpart of the retention tests: a field the form did send, empty,
     * still clears. Absence means "unchanged", not "cleared", but an empty
     * value has to keep meaning what a creator deleting it expects.
     */
    public function test_an_explicitly_emptied_field_is_still_cleared(): void
    {
        $this->patch('/'.self::SLUG, [
            'pass' => EditPass::issue(self::SLUG)->toToken(),
            'instagram' => 'deflock.authtest',
            'tiktok' => '',
        ])->assertSessionHasNoErrors();

        $this->assertNull($this->reload(self::SLUG)->tiktok);
    }

    private function reload(string $slug): Chapter
    {
        return app(ChapterRepository::class)->find(Slug::fromString($slug));
    }

    private function seedChapter(string $slug, string $domain): void
    {
        app(ChapterRepository::class)->save(new Chapter(
            slug: $slug,
            schoolName: 'Authorisation Test University',
            shortName: 'AuthTest',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: $domain,
            ownerRecord: Ownership::record(self::OWNER),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 5, 2, 9846, '2026-09-09'),
            instagram: 'deflock.authtest',
            tiktok: self::TIKTOK,
            editKeyHash: EditKey::hash(self::KEY),
            colours: new SchoolColours('#003057', '#b3a369'),
            createdAt: '2026-09-09T00:00:00+00:00',
            updatedAt: '2026-09-09T00:00:00+00:00',
        ));
    }
}
