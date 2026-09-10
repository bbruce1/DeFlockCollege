<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * The only privileged door in the application.
 *
 * Two things are being checked. That it is shut, and that it says nothing:
 * neither what is behind it, nor whether a passphrase was merely wrong as
 * against never configured at all. The second answer would tell a stranger
 * whether this deployment is worth attacking.
 */
final class AdminGateTest extends TestCase
{
    private const PASSPHRASE = 'a correct horse battery staple';

    protected function setUp(): void
    {
        parent::setUp();

        $this->clearGate();
        $this->seedChapter();
    }

    public function test_the_locked_page_describes_nothing_it_protects(): void
    {
        $this->get('/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Locked')
                ->has('retryIn')
                ->missing('chapters')
                ->missing('totals')
                ->missing('byState')
            );
    }

    public function test_the_dashboard_is_not_reachable_without_the_passphrase(): void
    {
        config(['admin.password_hash' => Hash::make(self::PASSPHRASE)]);

        $this->post('/admin', ['passphrase' => 'not the passphrase'])
            ->assertSessionHasErrors('passphrase');

        $this->clearGate();

        $this->get('/admin')
            ->assertInertia(fn ($page) => $page->component('Admin/Locked'));
    }

    public function test_a_wrong_passphrase_reads_the_same_as_a_door_that_was_never_configured(): void
    {
        config(['admin.password_hash' => Hash::make(self::PASSPHRASE)]);
        $wrong = $this->attempt('not the passphrase');

        config(['admin.password_hash' => null]);
        $unconfigured = $this->attempt(self::PASSPHRASE);

        $this->assertSame($wrong, $unconfigured);
        $this->assertNotNull($wrong);
    }

    public function test_the_right_passphrase_opens_the_dashboard(): void
    {
        config(['admin.password_hash' => Hash::make(self::PASSPHRASE)]);

        $this->post('/admin', ['passphrase' => self::PASSPHRASE])
            ->assertRedirect('/admin')
            ->assertSessionHasNoErrors();

        $this->get('/admin')
            ->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
    }

    private function attempt(string $passphrase): ?string
    {
        $this->clearGate();

        $this->post('/admin', ['passphrase' => $passphrase])
            ->assertSessionHasErrors('passphrase');

        return session('errors')->first('passphrase');
    }

    /** The gate allows one attempt per window, so each case starts clean. */
    private function clearGate(): void
    {
        RateLimiter::clear(
            'admin-gate:'.hash_hmac('sha256', '127.0.0.1', (string) config('app.key'))
        );
    }

    private function seedChapter(): void
    {
        app(ChapterRepository::class)->save(new Chapter(
            slug: 'admingatetest',
            schoolName: 'Admin Gate University',
            shortName: 'AdminGate',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'admingate.edu',
            ownerRecord: Ownership::record('owner@admingate.edu'),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 5, 2, 9846, '2026-09-09'),
            instagram: 'deflock.admingate',
            createdAt: '2026-09-09T00:00:00+00:00',
            updatedAt: '2026-09-09T00:00:00+00:00',
        ));
    }
}
