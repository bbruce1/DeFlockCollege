<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\SchoolDomain;
use App\Chapters\Slug;
use App\Chapters\StateCoverageRepository;
use App\Chapters\VerificationTicket;
use App\Maps\OverpassClient;
use App\Maps\StateBorders;
use App\Maps\StateCoverageBuilder;
use App\Maps\SurveyBuilder;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * One address, many schools.
 *
 * A university domain names one institution. A school district domain names a
 * county: Fairfax runs about twenty-five high schools on fcps.k12.va.us. Every
 * rule in this application that reads "one school, one chapter" from a domain
 * is wrong for those, and getting it wrong means the first student to arrive
 * locks out every other school in the district.
 */
final class DistrictDomainTest extends TestCase
{
    private const DISTRICT = 'fcps.k12.va.us';

    protected function setUp(): void
    {
        parent::setUp();

        // Neither outside service is what this file is about, and both are slow
        // to fail for real: without this the class spent three minutes waiting
        // on Overpass backoff it did not need.
        Http::fake(['*' => Http::response('busy', 504)]);

        $client = new OverpassClient(null, 0);
        $coverage = new StateCoverageBuilder(
            $client,
            new StateCoverageRepository(sys_get_temp_dir().'/deflock-district-'.bin2hex(random_bytes(4))),
            $this->app->make(StateBorders::class),
        );

        $this->app->instance(OverpassClient::class, $client);
        $this->app->instance(StateCoverageBuilder::class, $coverage);
        $this->app->instance(SurveyBuilder::class, new SurveyBuilder($client, $coverage));
    }

    protected function tearDown(): void
    {
        foreach (['dtone', 'dttwo'] as $slug) {
            app(ChapterRepository::class)->delete(Slug::fromString($slug));
        }

        parent::tearDown();
    }

    public function test_a_district_domain_is_the_district_not_the_state(): void
    {
        $domain = SchoolDomain::fromEmail('student@'.self::DISTRICT);

        $this->assertSame(self::DISTRICT, $domain->registrable);
        $this->assertTrue($domain->isDistrict());

        // The trap: two labels would make every Virginia district "va.us".
        $other = SchoolDomain::fromEmail('student@lcps.k12.va.us');

        $this->assertNotSame($domain->registrable, $other->registrable);
    }

    public function test_a_deeper_host_still_belongs_to_its_district(): void
    {
        $this->assertSame(
            self::DISTRICT,
            SchoolDomain::fromEmail('kid@mail.'.self::DISTRICT)->registrable,
        );
    }

    /** ".us" is open registration; only the administered part is trusted. */
    public function test_a_plain_us_address_is_still_refused(): void
    {
        foreach (['a@evil.us', 'b@anything.us', 'c@k12.va.us', 'd@foo.k12.zz.us'] as $email) {
            $this->assertFalse(SchoolDomain::isInstitutional($email), "{$email} must be refused.");
        }
    }

    public function test_a_university_domain_is_not_a_district(): void
    {
        $this->assertFalse(SchoolDomain::fromEmail('a@gatech.edu')->isDistrict());
        $this->assertFalse(SchoolDomain::fromEmail('a@austinisd.org')->isDistrict());
    }

    /** The whole point: a second school in the district can still start one. */
    public function test_a_second_school_in_a_district_can_still_be_created(): void
    {
        $this->seedChapter('dtone', 'Oakton High School');

        // A different school means a different campus. Sharing the seeded point
        // would make this the same school, which is a different rule.
        $payload = $this->payload('dttwo', 'Madison High School');
        $payload['point'] = '38.8967,-77.2661';

        $response = $this->post('/chapters', $payload);

        $response->assertRedirect();

        $this->assertNotNull(
            app(ChapterRepository::class)->findBySlugString('dttwo'),
            'The second school in a district was blocked by the first.'
        );
    }

    public function test_a_second_chapter_on_a_university_domain_is_still_refused(): void
    {
        $this->seedChapter('dtone', 'Only School', domain: 'gatech.edu');

        $this->post('/chapters', $this->payload('dttwo', 'Another School', domain: 'gatech.edu'))
            ->assertRedirect('/dtone');

        $this->assertNull(
            app(ChapterRepository::class)->findBySlugString('dttwo'),
            'One school, one chapter must still hold for a university.'
        );
    }

    /** Asking for a link must not claim a sibling school's page as yours. */
    public function test_verifying_a_district_address_does_not_report_an_existing_chapter(): void
    {
        $this->seedChapter('dtone', 'Oakton High School');

        $this->post('/verify', ['email' => 'someone@'.self::DISTRICT])
            ->assertSessionMissing('existing');
    }

    public function test_the_chooser_lists_the_districts_chapters(): void
    {
        $this->seedChapter('dtone', 'Oakton High School');
        $this->seedChapter('dttwo', 'Madison High School');

        $ticket = VerificationTicket::issue('someone@'.self::DISTRICT)->toToken();

        $this->get('/choose?ticket='.urlencode($ticket))
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page->component('Chapters/District')
                    ->where('domain', self::DISTRICT)
                    ->has('chapters', 2)
            );
    }

    /** An edit request is only ever offered chapters that address can edit. */
    public function test_the_edit_chooser_only_offers_your_own_chapters(): void
    {
        $this->seedChapter('dtone', 'Oakton High School', owner: 'me@'.self::DISTRICT);
        $this->seedChapter('dttwo', 'Madison High School', owner: 'someone.else@'.self::DISTRICT);

        $ticket = VerificationTicket::issue('me@'.self::DISTRICT, 'edit')->toToken();

        // Only one is theirs, so there is nothing to choose between: straight in.
        $this->get('/choose?purpose=edit&ticket='.urlencode($ticket))
            ->assertRedirect(route('chapters.edit', ['slug' => 'dtone', 'ticket' => $ticket]));
    }

    public function test_an_edit_request_with_nothing_of_your_own_is_told_so(): void
    {
        $this->seedChapter('dtone', 'Oakton High School', owner: 'someone.else@'.self::DISTRICT);

        $ticket = VerificationTicket::issue('me@'.self::DISTRICT, 'edit')->toToken();

        $this->get('/choose?purpose=edit&ticket='.urlencode($ticket))
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors('email');
    }

    public function test_the_chooser_passes_straight_through_when_nothing_exists(): void
    {
        $ticket = VerificationTicket::issue('someone@'.self::DISTRICT)->toToken();

        $this->get('/choose?ticket='.urlencode($ticket))
            ->assertRedirect(route('chapters.start', ['ticket' => $ticket]));
    }

    public function test_the_chooser_passes_a_university_straight_through(): void
    {
        $ticket = VerificationTicket::issue('someone@gatech.edu')->toToken();

        $this->get('/choose?ticket='.urlencode($ticket))
            ->assertRedirect(route('chapters.start', ['ticket' => $ticket]));
    }

    /**
     * Sharing a district address does not share the chapters on it.
     *
     * Authorisation is the owner record — an HMAC of the exact address — not
     * the domain. The domain only decides which chapters are listed and where
     * the email link points.
     */
    public function test_another_student_in_the_district_cannot_edit_a_chapter(): void
    {
        $this->seedChapter('dtone', 'Oakton High School');

        $chapter = app(ChapterRepository::class)->findBySlugString('dtone');

        $this->assertTrue($chapter->isOwnedBy('owner@'.self::DISTRICT));
        $this->assertFalse(
            $chapter->isOwnedBy('someone.else@'.self::DISTRICT),
            'A different address on the same district domain must not own the chapter.'
        );

        $intruder = VerificationTicket::issue('someone.else@'.self::DISTRICT, 'edit')->toToken();

        $this->get('/dtone/edit?ticket='.urlencode($intruder))
            ->assertRedirect('/dtone')
            ->assertSessionHasErrors('email');
    }

    /** And cannot have a key posted to themselves either. */
    public function test_another_student_in_the_district_cannot_recover_the_key(): void
    {
        $this->seedChapter('dtone', 'Oakton High School');

        \Illuminate\Support\Facades\Mail::fake();

        $this->post('/dtone/recover-key', ['email' => 'someone.else@'.self::DISTRICT]);

        \Illuminate\Support\Facades\Mail::assertNothingSent();
    }

    /**
     * The same school, twice.
     *
     * The domain cannot catch this for a district, so the campus does. Fifty
     * metres is inside one building, so it takes a second student picking the
     * same school off the map and leaves two real schools alone.
     */
    public function test_a_second_chapter_on_the_same_campus_is_refused(): void
    {
        $this->seedChapter('dtone', 'Oakton High School');

        // About forty metres north of the seeded campus.
        $payload = $this->payload('dttwo', 'Oakton HS');
        $payload['point'] = '38.90036,-77.3';

        $this->post('/chapters', $payload)->assertSessionHasErrors('point');

        $this->assertNull(
            app(ChapterRepository::class)->findBySlugString('dttwo'),
            'A duplicate chapter was created on the same campus.'
        );
    }

    public function test_a_different_school_in_the_district_is_unaffected(): void
    {
        $this->seedChapter('dtone', 'Oakton High School');

        // McLean High School is about fifteen kilometres away.
        $payload = $this->payload('dttwo', 'McLean High School');
        $payload['point'] = '38.9339,-77.1739';

        $this->post('/chapters', $payload)->assertSessionHasNoErrors();

        $this->assertNotNull(
            app(ChapterRepository::class)->findBySlugString('dttwo'),
            'A genuinely different school was blocked as a duplicate.'
        );
    }

    /** Just outside the bound is still a different campus. */
    public function test_the_bound_is_fifty_metres(): void
    {
        $this->seedChapter('dtone', 'Oakton High School');

        $near = new CampusPoint(38.9, -77.3);

        // 40 m in, 60 m out, either side of the fifty-metre line.
        $this->assertLessThan(50, $near->metresTo(new CampusPoint(38.90036, -77.3)));
        $this->assertGreaterThan(50, $near->metresTo(new CampusPoint(38.90054, -77.3)));

        $payload = $this->payload('dttwo', 'Something Else');
        $payload['point'] = '38.90054,-77.3';

        $this->post('/chapters', $payload)->assertSessionHasNoErrors();
        $this->assertNotNull(app(ChapterRepository::class)->findBySlugString('dttwo'));
    }

    /** The same answer as submit, given while it can still be acted on. */
    public function test_the_nearby_check_reports_a_taken_campus(): void
    {
        $this->seedChapter('dtone', 'Oakton High School');

        $ticket = VerificationTicket::issue('student@'.self::DISTRICT)->toToken();

        $this->postJson('/nearby', ['ticket' => $ticket, 'point' => '38.90036,-77.3'])
            ->assertOk()
            ->assertJsonPath('existing.slug', 'dtone')
            ->assertJsonPath('existing.schoolName', 'Oakton High School');

        $this->postJson('/nearby', ['ticket' => $ticket, 'point' => '38.9339,-77.1739'])
            ->assertOk()
            ->assertJsonPath('existing', null);
    }

    public function test_the_nearby_check_needs_a_valid_ticket(): void
    {
        $this->postJson('/nearby', ['ticket' => 'nonsense', 'point' => '38.9,-77.3'])
            ->assertStatus(422);

        $this->postJson('/nearby', ['point' => '38.9,-77.3'])->assertStatus(422);
    }

    public function test_the_nearby_check_rejects_a_malformed_point(): void
    {
        $ticket = VerificationTicket::issue('student@'.self::DISTRICT)->toToken();

        $this->postJson('/nearby', ['ticket' => $ticket, 'point' => 'not-a-point'])
            ->assertStatus(422);
    }

    public function test_nearby_cannot_be_claimed_as_a_chapter_address(): void
    {
        $this->assertFalse(Slug::isValid('nearby'));
    }

    public function test_choose_cannot_be_claimed_as_a_chapter_address(): void
    {
        $this->assertFalse(Slug::isValid('choose'));
    }

    private function seedChapter(
        string $slug,
        string $name,
        string $domain = self::DISTRICT,
        ?string $owner = null,
    ): void {
        app(ChapterRepository::class)->save(new Chapter(
            slug: $slug,
            schoolName: $name,
            shortName: $name,
            state: 'VA',
            city: 'Vienna',
            ownerDomain: $domain,
            ownerRecord: Ownership::record($owner ?? 'owner@'.$domain),
            survey: new ReaderSurvey(
                point: new CampusPoint(38.9, -77.3),
                readersWithinMile: 3,
                flockCount: 1,
                readersInState: 100,
                generatedAt: '2026-09-10',
            ),
            instagram: null,
            tiktok: null,
            petitionUrl: null,
            officials: [],
            editKeyHash: '',
            acknowledgedAt: null,
            colours: null,
            createdAt: '2026-09-10T00:00:00+00:00',
            updatedAt: '2026-09-10T00:00:00+00:00',
        ));
    }

    /** @return array<string, mixed> */
    private function payload(string $slug, string $name, string $domain = self::DISTRICT): array
    {
        return [
            'ticket' => VerificationTicket::issue('someone@'.$domain)->toToken(),
            'schoolName' => $name,
            'shortName' => $name,
            'state' => 'VA',
            'city' => 'Vienna',
            'slug' => $slug,
            'point' => '38.9,-77.3',
            'instagram' => 'deflock.'.$slug,
            'petitionUrl' => null,
            'primaryColour' => '#003057',
            'secondaryColour' => '#b3a369',
        ];
    }
}
