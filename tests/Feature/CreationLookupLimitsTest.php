<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\Ownership;
use App\Chapters\VerificationTicket;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * The lookups the create form makes, and what bounds them.
 *
 * Each one spends somebody else's free service, so each is limited twice: a
 * route throttle keyed on the client, and a limiter keyed on the ticket. The
 * second is the one that matters — an address can be rotated in a loop, and a
 * ticket cannot be had without a verified school mailbox behind it.
 */
final class CreationLookupLimitsTest extends TestCase
{
    private const EMAIL = 'lookups@stanford.edu';

    /** Matches ChapterCreationController::MAX_DISTRICT_LOOKUPS_PER_HOUR. */
    private const DISTRICT_ALLOWANCE = 30;

    private string $ticket;

    protected function setUp(): void
    {
        parent::setUp();

        // Nothing reaches the Census geocoder from a test run.
        Http::fake(['*' => Http::response(['result' => ['geographies' => []]])]);

        RateLimiter::clear('district-lookup:'.Ownership::record(self::EMAIL));

        $this->ticket = VerificationTicket::issue(self::EMAIL)->toToken();
    }

    public function test_district_lookups_are_bounded_by_the_ticket_not_only_the_address(): void
    {
        for ($attempt = 0; $attempt < self::DISTRICT_ALLOWANCE; $attempt++) {
            $this->fromClient("10.0.{$attempt}.1")
                ->postJson('/districts', [
                    'ticket' => $this->ticket,
                    'point' => '33.77,-84.39',
                    'state' => 'GA',
                ])
                ->assertOk();
        }

        // A fresh address every time, so the route throttle has never seen this
        // client before. The ticket has, and that is what has to stop it.
        $this->fromClient('10.9.9.9')
            ->postJson('/districts', [
                'ticket' => $this->ticket,
                'point' => '33.77,-84.39',
                'state' => 'GA',
            ])
            ->assertStatus(429);
    }

    public function test_a_district_lookup_without_a_ticket_is_refused(): void
    {
        $this->postJson('/districts', ['point' => '33.77,-84.39', 'state' => 'GA'])
            ->assertStatus(422);

        $this->postJson('/districts', [
            'ticket' => 'not-a-real-token',
            'point' => '33.77,-84.39',
        ])->assertStatus(422);
    }

    /** @return $this */
    private function fromClient(string $address): self
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $address]);
    }
}
