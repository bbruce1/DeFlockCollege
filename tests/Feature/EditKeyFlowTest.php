<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\EditKey;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\Slug;
use App\Mail\EditKeyIssued;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * The edit key: how a creator gets back into their own chapter, and how
 * everybody else is kept out of it.
 */
final class EditKeyFlowTest extends TestCase
{
    private const KEY = 'ABCDE-FGHJK-LMNPQ-RSTUV';

    private const SLUG = 'keyflowtest';

    private const OWNER = 'owner@keyflow.edu';

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        $this->seedChapter();

        foreach ([
            'key-recovery-client:'.hash_hmac('sha256', '127.0.0.1', config('app.key')),
            'key-recovery-address:'.Ownership::record(self::OWNER),
            'key-recovery-address:'.Ownership::record('stranger@keyflow.edu'),
        ] as $limiter) {
            RateLimiter::clear($limiter);
        }

        RateLimiter::clear('chapter-unlock:'.self::SLUG);
        RateLimiter::clear(
            'chapter-unlock-client:'.hash_hmac('sha256', '127.0.0.1', config('app.key'))
        );
    }

    protected function tearDown(): void
    {
        app(ChapterRepository::class)->delete(Slug::fromString(self::SLUG));

        parent::tearDown();
    }

    public function test_the_edit_page_asks_for_the_key_when_no_proof_is_offered(): void
    {
        $this->get('/'.self::SLUG.'/edit')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Chapters/Unlock'));
    }

    public function test_the_right_key_opens_an_editing_session(): void
    {
        $this->post('/'.self::SLUG.'/unlock', ['key' => self::KEY])
            ->assertRedirect()
            ->assertSessionHasNoErrors();
    }

    public function test_the_key_is_accepted_however_it_is_typed(): void
    {
        $this->post('/'.self::SLUG.'/unlock', ['key' => strtolower(str_replace('-', '', self::KEY))])
            ->assertSessionHasNoErrors();
    }

    public function test_a_wrong_key_is_refused(): void
    {
        $this->post('/'.self::SLUG.'/unlock', ['key' => 'ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ'])
            ->assertSessionHasErrors('key');
    }

    public function test_unlocking_locks_out_after_a_handful_of_wrong_keys(): void
    {
        // Verifying a key costs real bcrypt work, so an open endpoint here is a
        // way to burn the server's CPU rather than a way to guess 100 bits.
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post('/'.self::SLUG.'/unlock', ['key' => 'ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ']);
        }

        $response = $this->post('/'.self::SLUG.'/unlock', ['key' => 'ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ']);

        $response->assertSessionHasErrors('key');
        $this->assertStringContainsString(
            'Too many attempts',
            session('errors')->first('key'),
        );
    }

    public function test_a_locked_out_client_cannot_get_in_with_the_right_key(): void
    {
        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->post('/'.self::SLUG.'/unlock', ['key' => 'ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ']);
        }

        // The correct key must not be a way around the limit, or the limit only
        // slows down somebody who was going to fail anyway.
        $this->post('/'.self::SLUG.'/unlock', ['key' => self::KEY])
            ->assertSessionHasErrors('key');
    }

    public function test_saving_without_any_proof_is_refused(): void
    {
        $this->patch('/'.self::SLUG, ['instagram' => 'someone.else'])
            ->assertSessionHasErrors('key');

        $chapter = app(ChapterRepository::class)->find(Slug::fromString(self::SLUG));
        $this->assertSame('deflock.keyflow', $chapter->instagram, 'the chapter was not written to');
    }

    public function test_the_owner_is_sent_a_replacement_key(): void
    {
        $before = app(ChapterRepository::class)->find(Slug::fromString(self::SLUG))->editKeyHash;

        $this->post('/'.self::SLUG.'/recover-key', ['email' => self::OWNER])
            ->assertSessionHas('status');

        Mail::assertSent(EditKeyIssued::class, fn ($mail) => $mail->hasTo(self::OWNER));

        $after = app(ChapterRepository::class)->find(Slug::fromString(self::SLUG))->editKeyHash;
        $this->assertNotSame($before, $after, 'the old key must stop working');
        $this->assertFalse(EditKey::matches($after, self::KEY));
    }

    public function test_a_stranger_gets_no_key_and_changes_nothing(): void
    {
        $before = app(ChapterRepository::class)->find(Slug::fromString(self::SLUG))->editKeyHash;

        $this->post('/'.self::SLUG.'/recover-key', ['email' => 'stranger@keyflow.edu']);

        Mail::assertNothingSent();

        $after = app(ChapterRepository::class)->find(Slug::fromString(self::SLUG))->editKeyHash;
        $this->assertSame($before, $after, 'a stranger must not be able to rotate somebody\'s key');
    }

    public function test_the_answer_is_the_same_whoever_asks(): void
    {
        // Which student started a chapter is not public the way the chapter is,
        // so this endpoint must not be a way to find out.
        $owner = $this->post('/'.self::SLUG.'/recover-key', ['email' => self::OWNER]);

        RateLimiter::clear('key-recovery-client:'.hash_hmac('sha256', '127.0.0.1', config('app.key')));

        $stranger = $this->post('/'.self::SLUG.'/recover-key', ['email' => 'stranger@keyflow.edu']);

        $this->assertSame(
            $owner->getSession()->get('status'),
            $stranger->getSession()->get('status'),
        );
    }

    public function test_only_one_key_an_hour_reaches_an_address(): void
    {
        for ($i = 0; $i < 3; $i++) {
            RateLimiter::clear('key-recovery-client:'.hash_hmac('sha256', '127.0.0.1', config('app.key')));
            $this->post('/'.self::SLUG.'/recover-key', ['email' => self::OWNER]);
        }

        Mail::assertSentCount(1);
    }

    public function test_one_client_cannot_spray_different_addresses(): void
    {
        $this->post('/'.self::SLUG.'/recover-key', ['email' => self::OWNER]);
        $this->post('/'.self::SLUG.'/recover-key', ['email' => 'stranger@keyflow.edu']);

        // The second is stopped by the per-client limit even though the address
        // is new, so this cannot become a way to send mail at will.
        Mail::assertSentCount(1);
    }

    private function seedChapter(): void
    {
        app(ChapterRepository::class)->save(new Chapter(
            slug: self::SLUG,
            schoolName: 'Key Flow University',
            shortName: 'KeyFlow',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'keyflow.edu',
            ownerRecord: Ownership::record(self::OWNER),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 5, 2, 9846, '2026-09-09'),
            instagram: 'deflock.keyflow',
            editKeyHash: EditKey::hash(self::KEY),
            createdAt: '2026-09-09T00:00:00+00:00',
            updatedAt: '2026-09-09T00:00:00+00:00',
        ));
    }
}
