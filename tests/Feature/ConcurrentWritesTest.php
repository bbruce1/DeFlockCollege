<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\SchoolColours;
use App\Chapters\VerificationTicket;
use App\Metrics\OutreachLog;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use JsonException;
use Tests\TestCase;

/**
 * Two writers at once.
 *
 * Chapters and counts are plain files with no database underneath, so nothing
 * provides atomicity or locking unless the code does. Each of these was a way
 * to lose a chapter, an edit key, or a letter from the count.
 */
final class ConcurrentWritesTest extends TestCase
{
    private const SLUG = 'racetest';

    private const PRESSES_PER_WORKER = 100;

    private const WORKERS = 4;

    public function test_a_reader_mid_read_keeps_the_version_it_opened(): void
    {
        $repository = app(ChapterRepository::class);
        $repository->save($this->chapter('First Name'));

        $reader = fopen($this->chapterPath(), 'r');
        $repository->save($this->chapter('Second Name'));
        $seen = json_decode((string) stream_get_contents($reader), true);
        fclose($reader);

        // Replaced whole rather than truncated and refilled under the reader.
        $this->assertSame('First Name', $seen['schoolName'] ?? null);
        $this->assertSame('Second Name', $repository->findBySlugString(self::SLUG)?->schoolName);
    }

    public function test_a_save_that_cannot_be_encoded_leaves_the_chapter_intact(): void
    {
        $repository = app(ChapterRepository::class);
        $repository->save($this->chapter('Intact University'));

        try {
            // Not valid UTF-8, so it cannot be written as JSON.
            $repository->save($this->chapter("Broken \xB1\x31 University"));
            $this->fail('An unencodable chapter should not save.');
        } catch (JsonException) {
            $this->addToAssertionCount(1);
        }

        $this->assertSame('Intact University', $repository->findBySlugString(self::SLUG)?->schoolName);
        $this->assertNoStagingFilesLeft();
    }

    public function test_create_writes_a_chapter_whose_slug_is_free(): void
    {
        $this->assertTrue(app(ChapterRepository::class)->create($this->chapter('New University')));
        $this->assertSame('New University', app(ChapterRepository::class)->findBySlugString(self::SLUG)?->schoolName);
        $this->assertNoStagingFilesLeft();
    }

    public function test_create_never_replaces_a_chapter_that_already_exists(): void
    {
        $repository = app(ChapterRepository::class);
        $repository->save($this->chapter('First Claim'));

        $this->assertFalse($repository->create($this->chapter('Second Claim')));
        $this->assertSame('First Claim', $repository->findBySlugString(self::SLUG)?->schoolName);
        $this->assertNoStagingFilesLeft();
    }

    /**
     * Another student claims the slug while this one's survey is running: after
     * the form's check that it was free, and before the write.
     */
    public function test_a_slug_claimed_during_creation_is_not_overwritten(): void
    {
        $claimed = false;

        Http::fake([
            'overpass-api.de/*' => function () use (&$claimed) {
                if (! $claimed) {
                    app(ChapterRepository::class)->save($this->chapter('Got There First'));
                    $claimed = true;
                }

                return Http::response('busy', 504);
            },
            '*' => Http::response('unavailable', 503),
        ]);

        $this->post('/chapters', [
            'ticket' => VerificationTicket::issue('second@racetest.edu')->toToken(),
            'schoolName' => 'Got There Second',
            'shortName' => 'Second',
            'state' => 'GA',
            'city' => 'Atlanta',
            'slug' => self::SLUG,
            'point' => '34.0000,-84.0000',
            'instagram' => 'deflock.second',
        ])->assertSessionHasErrors('slug');

        $this->assertTrue($claimed, 'The survey never ran, so the race was not exercised.');

        $chapter = app(ChapterRepository::class)->findBySlugString(self::SLUG);

        $this->assertSame('Got There First', $chapter?->schoolName);
        $this->assertTrue($chapter->isOwnedBy('first@racetest.edu'), 'The first chapter changed hands.');
    }

    /**
     * Real processes pressing at once. Without the lock, a worker reads the
     * file while another has it truncated, and counts vanish by the dozen.
     */
    public function test_simultaneous_presses_are_all_counted(): void
    {
        if (! function_exists('pcntl_fork')) {
            $this->markTestSkipped('Needs pcntl to run real concurrent writers.');
        }

        $log = app(OutreachLog::class);
        $workers = [];

        // Made up front: the directory is created once per install, and that
        // first mkdir racing itself is not what this test is about.
        File::ensureDirectoryExists($this->metricsDirectory());

        for ($i = 0; $i < self::WORKERS; $i++) {
            $pid = pcntl_fork();

            if ($pid === 0) {
                try {
                    for ($press = 0; $press < self::PRESSES_PER_WORKER; $press++) {
                        $log->record(self::SLUG);
                    }
                } catch (\Throwable $e) {
                    // Said here, because the count below cannot say why.
                    fwrite(STDERR, 'Worker failed: '.$e->getMessage().PHP_EOL);
                } finally {
                    // Killed rather than exited, and never allowed to throw
                    // past here, so a worker cannot carry on running the test
                    // suite as if it were the parent.
                    posix_kill(posix_getpid(), SIGKILL);
                }
            }

            $this->assertGreaterThan(0, $pid, 'Could not start a worker.');
            $workers[] = $pid;
        }

        foreach ($workers as $pid) {
            pcntl_waitpid($pid, $status);
        }

        $this->assertSame(self::WORKERS * self::PRESSES_PER_WORKER, $log->total(self::SLUG));
    }

    private function assertNoStagingFilesLeft(): void
    {
        $this->assertSame([], File::glob(dirname($this->chapterPath()).'/*.tmp'));
    }

    private function metricsDirectory(): string
    {
        return (string) (new \ReflectionProperty(OutreachLog::class, 'directory'))
            ->getValue(app(OutreachLog::class));
    }

    private function chapterPath(): string
    {
        $directory = (new \ReflectionProperty(ChapterRepository::class, 'directory'))
            ->getValue(app(ChapterRepository::class));

        return $directory.DIRECTORY_SEPARATOR.self::SLUG.'.json';
    }

    private function chapter(string $schoolName): Chapter
    {
        return new Chapter(
            slug: self::SLUG,
            schoolName: $schoolName,
            shortName: 'Race',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'racetest.edu',
            ownerRecord: Ownership::record('first@racetest.edu'),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 3, 1, 9846, '2026-10-01'),
            instagram: 'deflock.race',
            colours: new SchoolColours('#003057', '#b3a369'),
            createdAt: '2026-10-01T00:00:00+00:00',
            updatedAt: '2026-10-01T00:00:00+00:00',
        );
    }
}
