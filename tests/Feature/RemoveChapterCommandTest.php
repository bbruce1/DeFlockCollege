<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\Blocklist;
use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\SchoolColours;
use App\Chapters\Slug;
use App\Chapters\VerificationTicket;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Taking a chapter down, the same day, and keeping it down.
 *
 * The control vision.md says makes an open creation model defensible. A
 * removal that anybody can undo by filling in the form again is not one.
 */
final class RemoveChapterCommandTest extends TestCase
{
    private const SLUG = 'removetest';

    private const DOMAIN = 'removetest.edu';

    private const OWNER = 'owner@removetest.edu';

    private const CONFIRMATION = 'Take down Remove Test University at /removetest? The file cannot be restored.';

    protected function setUp(): void
    {
        parent::setUp();

        // Creation is attempted below; no survey is what this file is about.
        Http::fake(['*' => Http::response('busy', 504)]);

        app(ChapterRepository::class)->save(new Chapter(
            slug: self::SLUG,
            schoolName: 'Remove Test University',
            shortName: 'Remove Test',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: self::DOMAIN,
            ownerRecord: Ownership::record(self::OWNER),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 3, 1, 9846, '2026-10-01'),
            instagram: 'deflock.removetest',
            colours: new SchoolColours('#003057', '#b3a369'),
            createdAt: '2026-10-01T00:00:00+00:00',
            updatedAt: '2026-10-01T00:00:00+00:00',
        ));
    }

    public function test_removing_a_chapter_deletes_it_and_blocks_its_slug(): void
    {
        $this->artisan('chapter:remove', ['slug' => self::SLUG, '--reason' => 'Request from the university'])
            ->expectsConfirmation(self::CONFIRMATION, 'yes')
            ->expectsOutputToContain('Blocked "'.self::SLUG.'"')
            ->expectsOutputToContain('Deleted Remove Test University')
            ->assertExitCode(0);

        $this->assertNull(app(ChapterRepository::class)->findBySlugString(self::SLUG));
        $this->assertTrue(app(Blocklist::class)->blocksSlug(Slug::fromString(self::SLUG)));
        $this->assertFalse(app(Blocklist::class)->blocksDomain(self::DOMAIN), 'Only --block-domain blocks the school.');

        $entry = $this->blocklistFile()['slugs'][self::SLUG];

        $this->assertSame('Request from the university', $entry['reason']);
        $this->assertSame(now()->toDateString(), $entry['date']);
    }

    public function test_a_removed_slug_cannot_be_created_again(): void
    {
        $this->remove();

        // Somebody else, at another school, trying to put the same page back.
        $this->post('/chapters', $this->payload('someone@elsewhere.edu', self::SLUG))
            ->assertSessionHasErrors(['slug' => '"'.self::SLUG.'" is taken. Pick another address for your chapter.']);

        $this->assertNull(app(ChapterRepository::class)->findBySlugString(self::SLUG));
    }

    public function test_blocking_the_domain_refuses_new_chapters_from_that_school(): void
    {
        $this->remove(['--block-domain' => true]);

        $this->post('/chapters', $this->payload('another@'.self::DOMAIN, 'freshslug'))
            ->assertSessionHasErrors('email');

        $this->assertNull(app(ChapterRepository::class)->findBySlugString('freshslug'));
    }

    public function test_the_blocklist_holds_no_email_address(): void
    {
        $this->remove(['--block-domain' => true]);

        $raw = File::get($this->blocklistPath());

        $this->assertStringNotContainsString('@', $raw);
        $this->assertStringNotContainsString(Ownership::record(self::OWNER), $raw);
        $this->assertArrayHasKey(self::DOMAIN, $this->blocklistFile()['domains']);
    }

    public function test_an_unknown_slug_fails_loudly_and_blocks_nothing(): void
    {
        $this->artisan('chapter:remove', ['slug' => 'no-such-chapter'])
            ->expectsOutputToContain('No chapter exists at "no-such-chapter"')
            ->assertExitCode(1);

        $this->assertFalse(app(Blocklist::class)->blocksSlug(Slug::fromString('no-such-chapter')));
        $this->assertFileDoesNotExist($this->blocklistPath());
    }

    public function test_an_invalid_slug_fails_loudly(): void
    {
        $this->artisan('chapter:remove', ['slug' => '../etc'])->assertExitCode(1);
    }

    public function test_declining_the_confirmation_changes_nothing(): void
    {
        $this->artisan('chapter:remove', ['slug' => self::SLUG])
            ->expectsConfirmation(self::CONFIRMATION, 'no')
            ->expectsOutputToContain('Nothing changed.')
            ->assertExitCode(0);

        $this->assertNotNull(app(ChapterRepository::class)->findBySlugString(self::SLUG));
        $this->assertFalse(app(Blocklist::class)->blocksSlug(Slug::fromString(self::SLUG)));
    }

    /** @param  array<string, mixed>  $options */
    private function remove(array $options = []): void
    {
        $this->artisan('chapter:remove', ['slug' => self::SLUG, ...$options])
            ->expectsConfirmation(self::CONFIRMATION, 'yes')
            ->assertExitCode(0);
    }

    private function blocklistPath(): string
    {
        $path = (new \ReflectionProperty(Blocklist::class, 'path'))->getValue(app(Blocklist::class));

        return (string) $path;
    }

    /** @return array<string, mixed> */
    private function blocklistFile(): array
    {
        return json_decode(File::get($this->blocklistPath()), true, flags: JSON_THROW_ON_ERROR);
    }

    /** @return array<string, mixed> */
    private function payload(string $email, string $slug): array
    {
        return [
            'ticket' => VerificationTicket::issue($email)->toToken(),
            'schoolName' => 'Somebody Else University',
            'shortName' => 'Somebody Else',
            'state' => 'GA',
            'city' => 'Atlanta',
            'slug' => $slug,
            // Well away from the removed chapter, so the nearby check is not
            // what refuses it.
            'point' => '34.0000,-84.0000',
            'instagram' => 'deflock.somebodyelse',
            'primaryColour' => '#003057',
            'secondaryColour' => '#b3a369',
        ];
    }
}
