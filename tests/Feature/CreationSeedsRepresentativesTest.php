<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\ChapterRepository;
use App\Chapters\Slug;
use App\Chapters\VerificationTicket;
use App\Maps\OverpassClient;
use App\Maps\StateBorders;
use App\Chapters\StateCoverageRepository;
use App\Maps\StateCoverageBuilder;
use App\Maps\SurveyBuilder;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * A chapter arrives with people to write to.
 *
 * Nobody is asked for officials when starting a chapter, so the offices have to
 * be found here. They used to be fetched by the create form and posted back,
 * and removing that step from the form silently produced chapters with nobody
 * to write to — a page whose one action does nothing.
 */
final class CreationSeedsRepresentativesTest extends TestCase
{
    private const SLUG = 'seedtest';

    protected function setUp(): void
    {
        parent::setUp();

        // Real retry behaviour, without the four minutes of backoff it spends
        // before giving up on a service this test wants to see fail.
        $client = new OverpassClient(null, 0);
        $repository = new StateCoverageRepository(sys_get_temp_dir().'/deflock-seed-'.bin2hex(random_bytes(4)));

        $this->app->instance(OverpassClient::class, $client);
        $this->app->instance(
            StateCoverageBuilder::class,
            $builder = new StateCoverageBuilder($client, $repository, $this->app->make(StateBorders::class)),
        );
        $this->app->instance(SurveyBuilder::class, new SurveyBuilder($client, $builder));
    }

    protected function tearDown(): void
    {
        app(ChapterRepository::class)->delete(Slug::fromString(self::SLUG));

        parent::tearDown();
    }

    public function test_a_chapter_created_without_officials_still_has_representatives(): void
    {
        $this->fakeServices(censusReachable: true);

        $this->post('/chapters', $this->payload())->assertRedirect();

        $chapter = app(ChapterRepository::class)->findBySlugString(self::SLUG);

        $this->assertNotNull($chapter, 'The chapter was not created.');
        $this->assertNotEmpty($chapter->officials, 'A chapter arrived with nobody to write to.');

        $names = array_column($chapter->officials, 'name');

        $this->assertContains('Sonya Halpern', $names, 'The senator for district 39 is missing.');
        $this->assertContains('Bryce Berry', $names, 'The representative for district 56 is missing.');
    }

    /** Losing the Census must not lose the chapter. */
    public function test_a_failed_lookup_still_produces_a_chapter(): void
    {
        $this->fakeServices(censusReachable: false);

        $this->post('/chapters', $this->payload())->assertRedirect();

        $chapter = app(ChapterRepository::class)->findBySlugString(self::SLUG);

        $this->assertNotNull($chapter, 'A chapter should survive a failed office lookup.');

        // Without districts there are no state legislators to name. Statewide
        // offices need no district, so those are still correct to attach.
        foreach ($chapter->officials as $official) {
            $this->assertNotSame(
                'state-senator',
                $official['role'],
                'A district office was attached without a district lookup.'
            );
        }
    }

    /**
     * Both outside services, stubbed by URL.
     *
     * Registered in one call because Http::fake merges stubs and the first
     * match wins: a later call cannot override an earlier pattern, which is
     * what made this test silently keep the reachable Census.
     */
    private function fakeServices(bool $censusReachable): void
    {
        Http::fake([
            'geocoding.geo.census.gov/*' => $censusReachable
                ? Http::response([
                    'result' => ['geographies' => [
                        'States' => [['STUSAB' => 'GA']],
                        'State Legislative Districts - Upper (2024)' => [['BASENAME' => '39']],
                        'State Legislative Districts - Lower (2024)' => [['BASENAME' => '56']],
                        '119th Congressional Districts' => [['BASENAME' => '5']],
                    ]],
                ])
                : Http::response('unavailable', 503),
            // The survey is allowed to fail; it must not take the offices with it.
            '*' => Http::response('busy', 504),
        ]);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'ticket' => VerificationTicket::issue('someone@seedtest.edu')->toToken(),
            'schoolName' => 'Seed Test University',
            'shortName' => 'Seed Test',
            'state' => 'GA',
            'city' => 'Atlanta',
            'slug' => self::SLUG,
            'point' => '33.7756,-84.3963',
            'instagram' => 'deflock.seedtest',
            'petitionUrl' => null,
            'primaryColour' => '#003057',
            'secondaryColour' => '#b3a369',
        ];
    }
}
