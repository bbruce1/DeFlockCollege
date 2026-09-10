<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\EditKey;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Mail\VerificationLink;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * Getting back into a chapter by proving the school address again.
 *
 * The edit key is the everyday route and re-verifying the address is the one
 * that survives losing it. Both have to work, because between them they are the
 * whole of the recovery story: there is no account to reset and no operator to
 * ask.
 */
final class EditLinkByEmailTest extends TestCase
{
    private const SLUG = 'editlinktest';

    private const OWNER = 'owner@editlink.edu';

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        RateLimiter::clear('verify-email:'.Ownership::record(self::OWNER));
        RateLimiter::clear(
            'verify-ip:'.hash_hmac('sha256', '127.0.0.1', (string) config('app.key'))
        );

        $this->seedChapter();
    }

    public function test_the_owner_can_ask_for_a_link_back_into_an_existing_chapter(): void
    {
        // A domain that already has a chapter is told so rather than mailed —
        // but only when the person is trying to create one. Asking to edit is
        // asking about the chapter that exists, so it has to send the link.
        $this->post(route('verify.send'), [
            'email' => self::OWNER,
            'purpose' => 'edit',
        ])->assertSessionHas('status');

        Mail::assertSent(
            VerificationLink::class,
            fn (VerificationLink $mail): bool => $mail->hasTo(self::OWNER)
                && str_contains($mail->url, '/'.self::SLUG.'/edit'),
        );
    }

    public function test_the_emailed_link_opens_the_editor(): void
    {
        $this->post(route('verify.send'), ['email' => self::OWNER, 'purpose' => 'edit']);

        $url = $this->sentUrl();

        $this->get($url)
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Chapters/Edit'));
    }

    public function test_somebody_else_at_the_same_school_is_refused(): void
    {
        // The domain is the school's identity, but the chapter belongs to the
        // address that started it. One student cannot take over another's.
        $this->post(route('verify.send'), [
            'email' => 'stranger@editlink.edu',
            'purpose' => 'edit',
        ]);

        $this->get($this->sentUrl())
            ->assertRedirect('/'.self::SLUG)
            ->assertSessionHasErrors('email');
    }

    public function test_creating_is_still_refused_for_a_domain_that_has_a_chapter(): void
    {
        $this->post(route('verify.send'), ['email' => self::OWNER])
            ->assertSessionHas('existing');

        Mail::assertNothingSent();
    }

    /** The link as it was actually mailed. */
    private function sentUrl(): string
    {
        $url = null;

        Mail::assertSent(VerificationLink::class, function (VerificationLink $mail) use (&$url): bool {
            $url = $mail->url;

            return true;
        });

        return (string) $url;
    }

    private function seedChapter(): void
    {
        app(ChapterRepository::class)->save(new Chapter(
            slug: self::SLUG,
            schoolName: 'Edit Link College',
            shortName: 'EditLink',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'editlink.edu',
            ownerRecord: Ownership::record(self::OWNER),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 5, 2, 9846, '2026-09-09'),
            instagram: 'deflock.editlink',
            editKeyHash: EditKey::hash('ABCDE-FGHJK-LMNPQ-RSTUV'),
            createdAt: '2026-09-09T00:00:00+00:00',
            updatedAt: '2026-09-09T00:00:00+00:00',
        ));
    }
}
