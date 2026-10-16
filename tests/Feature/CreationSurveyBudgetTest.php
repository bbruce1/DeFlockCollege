<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\ChapterRepository;
use App\Chapters\VerificationTicket;
use App\Maps\OverpassClient;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

/**
 * Creating a chapter while OpenStreetMap is slow or down.
 *
 * Creation surveys inside the student's own request. With the patient retry
 * policy the nightly refresh uses, a busy Overpass held that request for up to
 * nine minutes, every proxy in front of the app gave up long before, and the
 * chapter was never saved. The student had done everything right and had
 * nothing to show for it.
 */
final class CreationSurveyBudgetTest extends TestCase
{
    private const SLUG = 'budgettest';

    private const OVERPASS = 'overpass-api.de/*';

    public function test_a_chapter_is_saved_when_overpass_times_out(): void
    {
        $attempts = $this->fakeOverpass(Http::failedConnection('cURL error 28: Operation timed out'));

        $this->post('/chapters', $this->payload())
            ->assertRedirect(route('chapters.welcome', self::SLUG))
            ->assertSessionHasNoErrors();

        $chapter = app(ChapterRepository::class)->findBySlugString(self::SLUG);

        $this->assertNotNull($chapter, 'A timed-out survey lost the chapter.');

        // Not surveyed yet, which is not the same as none found.
        $this->assertNull($chapter->survey->readersWithinMile);
        $this->assertNull($chapter->survey->flockCount);
        $this->assertNull($chapter->survey->readersInState);
        $this->assertSame('unsurveyed', $chapter->status());

        // One attempt for the campus and one for the state: no retries and no
        // backoff while a student waits.
        $this->assertSame(2, $attempts->count);
    }

    public function test_a_chapter_is_saved_when_overpass_refuses(): void
    {
        $attempts = $this->fakeOverpass(fn () => Http::response('busy', 504));

        $this->post('/chapters', $this->payload())->assertRedirect(route('chapters.welcome', self::SLUG));

        $chapter = app(ChapterRepository::class)->findBySlugString(self::SLUG);

        $this->assertNotNull($chapter);
        $this->assertNull($chapter->survey->readersWithinMile);
        $this->assertSame(2, $attempts->count);
    }

    public function test_the_quick_budget_tries_once_and_the_patient_one_keeps_trying(): void
    {
        $attempts = $this->fakeOverpass(fn () => Http::response('busy', 504));

        $this->assertFailsToRun(OverpassClient::quick());
        $this->assertSame(1, $attempts->count, 'Creation must not retry.');

        // What the nightly refresh gets. The backoff is zeroed only so the test
        // does not sit through it; the number of attempts is the real policy.
        $this->assertFailsToRun(new OverpassClient(null, 0));
        $this->assertSame(5, $attempts->count, 'The nightly refresh should still retry four times.');
    }

    private function assertFailsToRun(OverpassClient $client): void
    {
        try {
            $client->run('[out:json];node(1);out;');
            $this->fail('Overpass was unreachable, so the query should have failed.');
        } catch (RuntimeException) {
            $this->addToAssertionCount(1);
        }
    }

    /**
     * Stubs Overpass with the given answer and counts each request to it. The
     * Census is stubbed as unreachable, which creation already survives.
     */
    private function fakeOverpass(callable $answer): object
    {
        $attempts = new class
        {
            public int $count = 0;
        };

        Http::fake([
            self::OVERPASS => function ($request) use ($answer, $attempts) {
                $attempts->count++;

                return $answer($request);
            },
            '*' => Http::response('unavailable', 503),
        ]);

        return $attempts;
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'ticket' => VerificationTicket::issue('someone@budgettest.edu')->toToken(),
            'schoolName' => 'Budget Test University',
            'shortName' => 'Budget Test',
            'state' => 'GA',
            'city' => 'Atlanta',
            'slug' => self::SLUG,
            'point' => '33.7756,-84.3963',
            'instagram' => 'deflock.budgettest',
            'primaryColour' => '#003057',
            'secondaryColour' => '#b3a369',
        ];
    }
}
