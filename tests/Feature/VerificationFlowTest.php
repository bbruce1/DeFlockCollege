<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\VerificationTicket;
use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\Slug;
use App\Mail\VerificationLink;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * The gate that decides who can start a chapter.
 *
 * Verification exists to stop an outside interest claiming a campus. It gates
 * creation only: sending outreach from a finished page requires nothing.
 */
final class VerificationFlowTest extends TestCase
{
    /** Slug of the fixture chapter, removed again in tearDown. */
    private const TAKEN_SLUG = 'test-taken-chapter';

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        RateLimiter::clear('verify-ip:'.hash_hmac('sha256', '127.0.0.1', (string) config('app.key')));
        $this->makeTakenChapter();
    }

    protected function tearDown(): void
    {
        app(ChapterRepository::class)->delete(Slug::fromString(self::TAKEN_SLUG));

        parent::tearDown();
    }

    /**
     * A chapter that definitely exists, so tests about a taken domain do not
     * depend on whatever happens to be in the developer's storage directory.
     */
    private function makeTakenChapter(): void
    {
        $now = now()->toIso8601String();

        app(ChapterRepository::class)->save(new Chapter(
            slug: self::TAKEN_SLUG,
            schoolName: 'Georgia Institute of Technology',
            shortName: 'Georgia Tech',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'gatech.edu',
            ownerRecord: Ownership::record('someone@gatech.edu'),
            survey: new ReaderSurvey(
                point: new CampusPoint(33.7760948, -84.3988077),
                readersWithinMile: 52,
                flockCount: 27,
                readersInState: 9846,
                generatedAt: '2026-01-01',
            ),
            createdAt: $now,
            updatedAt: $now,
        ));
    }

    public function test_a_school_address_is_sent_a_link(): void
    {
        $response = $this->post(route('verify.send'), ['email' => 'baker@stanford.edu']);

        $response->assertSessionHas('status');
        $response->assertSessionHasNoErrors();
        Mail::assertSent(VerificationLink::class, fn ($mail) => $mail->hasTo('baker@stanford.edu'));
    }

    public function test_a_domain_with_a_chapter_is_told_rather_than_mailed(): void
    {
        // Sending a link here would only end at this same message, and chapters
        // are public anyway, so their existence was never the secret.
        $response = $this->post(route('verify.send'), ['email' => 'someone@gatech.edu']);

        $response->assertSessionHas('existing');
        $response->assertSessionHasNoErrors();
        Mail::assertNothingSent();
    }

    public function test_a_personal_address_is_refused_and_no_mail_is_sent(): void
    {
        $response = $this->post(route('verify.send'), ['email' => 'someone@gmail.com']);

        $response->assertSessionHasErrors('email');
        Mail::assertNothingSent();
    }

    public function test_a_lookalike_domain_is_refused(): void
    {
        $this->post(route('verify.send'), ['email' => 'a@stanford.edu.attacker.com'])
            ->assertSessionHasErrors('email');

        Mail::assertNothingSent();
    }

    public function test_the_send_endpoint_is_rate_limited_per_address(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post(route('verify.send'), ['email' => 'baker@stanford.edu'])
                ->assertSessionHasNoErrors();
        }

        // The sixth is refused rather than becoming a relay for a mail flood.
        $this->post(route('verify.send'), ['email' => 'baker@stanford.edu'])
            ->assertSessionHasErrors('email');

        Mail::assertSentCount(5);
    }

    public function test_a_taken_domain_is_answered_differently_from_a_free_one(): void
    {
        // This is deliberate. Chapters are public, listed and indexed, so their
        // existence was never a secret worth protecting, and mailing a link that
        // ends at "this already exists" wastes the person's time.
        // Asserted before the next request, because both share one session and
        // the second flash would otherwise replace the first.
        $this->post(route('verify.send'), ['email' => 'a@gatech.edu'])
            ->assertSessionHas('existing');

        RateLimiter::clear('verify-ip:'.hash_hmac('sha256', '127.0.0.1', (string) config('app.key')));

        $this->post(route('verify.send'), ['email' => 'b@stanford.edu'])
            ->assertSessionMissing('existing')
            ->assertSessionHas('status');
    }

    public function test_the_answer_never_reveals_whether_an_address_exists(): void
    {
        // What stays hidden is which mailboxes are real: two addresses at the
        // same free domain must be answered identically.
        $first = $this->post(route('verify.send'), ['email' => 'realperson@stanford.edu'])
            ->getSession()
            ->get('status');

        RateLimiter::clear('verify-ip:'.hash_hmac('sha256', '127.0.0.1', (string) config('app.key')));

        $second = $this->post(route('verify.send'), ['email' => 'nobody-here-at-all@stanford.edu'])
            ->getSession()
            ->get('status');

        // The message echoes the address back, so compare the shape rather than
        // the text: what matters is that neither answer says whether it exists.
        $this->assertNotNull($first);
        $this->assertSame(
            str_replace('realperson@stanford.edu', 'ADDRESS', $first),
            str_replace('nobody-here-at-all@stanford.edu', 'ADDRESS', $second),
        );
    }

    // ---- Tickets -----------------------------------------------------------

    public function test_a_ticket_round_trips_and_carries_the_domain(): void
    {
        $ticket = VerificationTicket::issue('baker@stanford.edu');
        $restored = VerificationTicket::fromToken($ticket->toToken());

        $this->assertSame('baker@stanford.edu', $restored->email);
        $this->assertSame('stanford.edu', $restored->domain->registrable);
    }

    public function test_a_forged_ticket_is_refused(): void
    {
        $this->get(route('chapters.start', ['ticket' => 'not-a-real-token']))
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('email');
    }

    public function test_a_ticket_minted_for_editing_cannot_create(): void
    {
        $editTicket = VerificationTicket::issue('baker@stanford.edu', 'edit')->toToken();

        // Purpose is bound into the payload, so an edit link cannot be replayed
        // to create a different chapter.
        $this->get(route('chapters.start', ['ticket' => $editTicket]))
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('email');
    }

    public function test_the_start_page_opens_with_a_valid_ticket(): void
    {
        $ticket = VerificationTicket::issue('baker@stanford.edu')->toToken();

        $this->get(route('chapters.start', ['ticket' => $ticket]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Chapters/Create')
                ->where('domain', 'stanford.edu')
                ->where('known.shortName', 'Stanford')
            );
    }

    public function test_an_unknown_domain_is_asked_to_name_itself(): void
    {
        $ticket = VerificationTicket::issue('head@stalbansschool.org')->toToken();

        $this->get(route('chapters.start', ['ticket' => $ticket]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Chapters/Create')
                ->where('domain', 'stalbansschool.org')
                ->where('known', null)
            );
    }

    public function test_an_unknown_slug_is_a_404(): void
    {
        $this->get('/not-a-chapter')->assertNotFound();
    }
}
