<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ReaderSurvey;
use App\Maps\OverpassClient;
use App\Maps\StateBorders;
use App\Chapters\StateCoverageRepository;
use App\Maps\StateCoverageBuilder;
use App\Maps\SurveyBuilder;
use App\Officials\Official;
use App\Officials\OutreachLibrary;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * What a chapter does when OpenStreetMap cannot be reached.
 *
 * The statewide query walks an entire state and is far heavier than the one
 * around campus, so it is the first to time out. It backs a supporting sentence
 * and a backdrop, and blocking chapter creation on it left students unable to
 * start a chapter at all for as long as the service was unreachable.
 *
 * The figure being absent must never become the figure being nought — least of
 * all in a letter to a legislator.
 */
final class UnreachableOverpassTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Real retry behaviour, without the fifty-six seconds of waiting it
        // normally does before giving up.
        $client = new OverpassClient(null, 0);
        $repository = new StateCoverageRepository(sys_get_temp_dir().'/deflock-unreachable-'.bin2hex(random_bytes(4)));

        $this->app->instance(OverpassClient::class, $client);
        $this->app->instance(
            StateCoverageBuilder::class,
            new StateCoverageBuilder($client, $repository, $this->app->make(StateBorders::class)),
        );
        $this->app->instance(
            SurveyBuilder::class,
            new SurveyBuilder($client, $this->app->make(StateCoverageBuilder::class)),
        );
    }

    public function test_a_chapter_is_still_surveyed_without_the_statewide_figure(): void
    {
        // The campus query answers; the statewide one never does.
        Http::fake([
            '*' => function ($request) {
                return str_contains((string) $request->body(), 'around')
                    ? Http::response(['elements' => [
                        ['type' => 'node', 'tags' => ['man_made' => 'surveillance']],
                        ['type' => 'node', 'tags' => ['man_made' => 'surveillance', 'operator' => 'Flock Safety']],
                    ]])
                    : Http::response('busy', 504);
            },
        ]);

        $survey = app(SurveyBuilder::class)->build(new CampusPoint(33.7756, -84.3963), 'GA');

        $this->assertSame(2, $survey->readersWithinMile, 'The campus count is the one that matters.');
        $this->assertNull($survey->readersInState);
        $this->assertFalse($survey->hasStateCount());
    }

    /**
     * A chapter with no figures on it is not an empty chapter. It still carries
     * the Instagram, the petition and the letters to send, which is what a
     * student came to set up; the numbers are supporting evidence and arrive on
     * the next refresh.
     */
    public function test_a_chapter_is_made_even_with_nothing_reachable(): void
    {
        Http::fake(['*' => Http::response('busy', 504)]);

        $survey = app(SurveyBuilder::class)->build(new CampusPoint(33.7756, -84.3963), 'GA');

        $this->assertNull($survey->readersWithinMile);
        $this->assertNull($survey->flockCount);
        $this->assertNull($survey->readersInState);
        $this->assertFalse($survey->hasNearbyCount());
    }

    /** Counted-as-none and never-counted must not read the same. */
    public function test_an_unsurveyed_chapter_is_not_reported_as_having_none(): void
    {
        $this->assertSame('unsurveyed', $this->chapterWith(null, null)->status());
        $this->assertSame('empty', $this->chapterWith(0, 0)->status());
        $this->assertSame('live', $this->chapterWith(52, 9846)->status());

        $this->assertFalse(
            $this->chapterWith(null, null)->survey->isEmpty(),
            'A campus nobody could count has not been found to have none.'
        );
    }

    public function test_a_letter_still_argues_without_any_figures(): void
    {
        $letter = app(OutreachLibrary::class)->letterFor(
            $this->chapterWith(null, null),
            new Official('Jane Roe', 'State Senator', 'jane@example.gov', null, 'state-senator', 'state'),
            0,
            'Georgia',
        );

        $this->assertNotSame('', trim($letter['body']));
        $this->assertStringNotContainsString('{{', $letter['body']);
        $this->assertStringNotContainsString(' 0 ', $letter['body']);
        $this->assertStringContainsString('student', $letter['body']);
    }

    /** The one thing that must never happen. */
    public function test_no_letter_cites_a_statewide_figure_that_is_not_known(): void
    {
        $chapter = $this->chapterWith(52, null);
        $library = app(OutreachLibrary::class);
        $official = new Official('Jane Roe', 'State Senator', 'jane@example.gov', null, 'state-senator', 'state');

        // Every letter in the rotation, not just the first.
        for ($rotation = 0; $rotation < 240; $rotation++) {
            $letter = $library->letterFor($chapter, $official, 0, 'Georgia', $rotation);
            $text = $letter['subject'].' '.$letter['body'];

            $this->assertStringNotContainsString('{{', $text, 'A placeholder survived into a letter.');
            $this->assertStringNotContainsString(
                'across Georgia',
                $text,
                "Rotation {$rotation} cites a statewide figure the chapter does not have."
            );
            $this->assertStringNotContainsString(' 0 automated', $text);
        }
    }

    public function test_letters_still_cite_the_figure_when_it_is_known(): void
    {
        $known = $this->chapterWith(52, 9846);
        $library = app(OutreachLibrary::class);
        $official = new Official('Jane Roe', 'State Senator', 'jane@example.gov', null, 'state-senator', 'state');

        $cited = 0;

        for ($rotation = 0; $rotation < 240; $rotation++) {
            $letter = $library->letterFor($known, $official, 0, 'Georgia', $rotation);

            if (str_contains($letter['body'], '9,846')) {
                $cited++;
            }
        }

        $this->assertGreaterThan(0, $cited, 'A known figure should still reach some letters.');
    }

    private function chapterWith(?int $readersWithinMile, ?int $readersInState): Chapter
    {
        return new Chapter(
            slug: 'nostate',
            schoolName: 'Example College',
            shortName: 'Example',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'example.edu',
            ownerRecord: 'x',
            survey: new ReaderSurvey(
                point: new CampusPoint(33.7756, -84.3963),
                readersWithinMile: $readersWithinMile,
                flockCount: $readersWithinMile === null ? null : 0,
                readersInState: $readersInState,
                generatedAt: '2026-09-09',
            ),
            instagram: null,
            tiktok: null,
            petitionUrl: null,
            officials: [],
            editKeyHash: '',
            acknowledgedAt: null,
            colours: null,
            createdAt: '2026-09-09T00:00:00+00:00',
            updatedAt: '2026-09-09T00:00:00+00:00',
        );
    }
}
