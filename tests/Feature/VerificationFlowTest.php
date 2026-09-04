<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\VerificationTicket;
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
    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        RateLimiter::clear('verify-ip:'.sha1('127.0.0.1'));
    }

    public function test_a_school_address_is_sent_a_link(): void
    {
        $response = $this->post(route('verify.send'), ['email' => 'baker@gatech.edu']);

        $response->assertSessionHas('status');
        $response->assertSessionHasNoErrors();
        Mail::assertSent(VerificationLink::class, fn ($mail) => $mail->hasTo('baker@gatech.edu'));
    }

    public function test_a_personal_address_is_refused_and_no_mail_is_sent(): void
    {
        $response = $this->post(route('verify.send'), ['email' => 'someone@gmail.com']);

        $response->assertSessionHasErrors('email');
        Mail::assertNothingSent();
    }

    public function test_a_lookalike_domain_is_refused(): void
    {
        $this->post(route('verify.send'), ['email' => 'a@gatech.edu.attacker.com'])
            ->assertSessionHasErrors('email');

        Mail::assertNothingSent();
    }

    public function test_the_send_endpoint_is_rate_limited_per_address(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post(route('verify.send'), ['email' => 'baker@gatech.edu'])
                ->assertSessionHasNoErrors();
        }

        // The sixth is refused rather than becoming a relay for a mail flood.
        $this->post(route('verify.send'), ['email' => 'baker@gatech.edu'])
            ->assertSessionHasErrors('email');

        Mail::assertSentCount(5);
    }

    public function test_the_response_does_not_reveal_whether_a_chapter_exists(): void
    {
        // An unverified stranger must not be able to enumerate which schools are
        // taken, so both answers are identical at this stage.
        $taken = $this->post(route('verify.send'), ['email' => 'a@gatech.edu']);
        RateLimiter::clear('verify-ip:'.sha1('127.0.0.1'));
        $free = $this->post(route('verify.send'), ['email' => 'b@stanford.edu']);

        $this->assertSame(
            $taken->getSession()->get('status') !== null,
            $free->getSession()->get('status') !== null,
        );
    }

    // ---- Tickets -----------------------------------------------------------

    public function test_a_ticket_round_trips_and_carries_the_domain(): void
    {
        $ticket = VerificationTicket::issue('baker@gatech.edu');
        $restored = VerificationTicket::fromToken($ticket->toToken());

        $this->assertSame('baker@gatech.edu', $restored->email);
        $this->assertSame('gatech.edu', $restored->domain->registrable);
    }

    public function test_a_forged_ticket_is_refused(): void
    {
        $this->get(route('chapters.start', ['ticket' => 'not-a-real-token']))
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('email');
    }

    public function test_a_ticket_minted_for_editing_cannot_create(): void
    {
        $editTicket = VerificationTicket::issue('baker@gatech.edu', 'edit')->toToken();

        // Purpose is bound into the payload, so an edit link cannot be replayed
        // to create a different chapter.
        $this->get(route('chapters.start', ['ticket' => $editTicket]))
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('email');
    }

    public function test_the_start_page_opens_with_a_valid_ticket(): void
    {
        $ticket = VerificationTicket::issue('baker@gatech.edu')->toToken();

        $this->get(route('chapters.start', ['ticket' => $ticket]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Chapters/Create')
                ->where('domain', 'gatech.edu')
                ->where('known.shortName', 'Georgia Tech')
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
