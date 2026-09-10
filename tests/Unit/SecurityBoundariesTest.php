<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Chapters\CampusPoint;
use App\Chapters\EditKey;
use App\Chapters\EditPass;
use App\Maps\OverpassClient;
use App\Maps\SurveyBuilder;
use App\Officials\OfficialInput;
use App\Officials\RotationCounter;
use App\Chapters\Ownership;
use App\Chapters\SchoolDomain;
use App\Chapters\Slug;
use App\Chapters\SocialHandle;
use InvalidArgumentException;
use RuntimeException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * The decisions in security.md, asserted.
 *
 * These are the boundaries where untrusted input meets the filesystem, an
 * outbound request, or a stored secret. A regression here is a vulnerability
 * rather than a bug, so each one is pinned.
 */
final class SecurityBoundariesTest extends TestCase
{
    // ---- Slugs become filenames -------------------------------------------

    public static function traversalAttempts(): array
    {
        return [
            'parent directory' => ['../etc/passwd'],
            'encoded traversal' => ['..%2Fetc'],
            'absolute path' => ['/etc/passwd'],
            'nested path' => ['a/b'],
            'backslash' => ['a\\b'],
            'null byte' => ["gt\0.json"],
            'dot segment' => ['..'],
            'single dot' => ['.'],
            'leading hyphen' => ['-gt'],
            'trailing hyphen' => ['gt-'],
            'uppercase escape' => ['../GT'],
            'space' => ['georgia tech'],
            'too short' => ['g'],
            'too long' => [str_repeat('a', 33)],
        ];
    }

    #[DataProvider('traversalAttempts')]
    public function test_slug_rejects_anything_that_could_escape_a_directory(string $attempt): void
    {
        $this->expectException(InvalidArgumentException::class);
        Slug::fromString($attempt);
    }

    public function test_slug_rejects_reserved_names(): void
    {
        foreach (['api', 'admin', 'www', 'storage', 'verify'] as $reserved) {
            $this->assertFalse(Slug::isValid($reserved), "\"{$reserved}\" must stay reserved");
        }
    }

    public function test_slug_accepts_ordinary_identifiers(): void
    {
        foreach (['gt', 'georgia-tech', 'purdue', 'uc-berkeley', 'st-albans'] as $ok) {
            $this->assertTrue(Slug::isValid($ok), "\"{$ok}\" should be usable");
        }
    }

    // ---- The domain gate ---------------------------------------------------

    public function test_domain_gate_rejects_lookalike_hosts(): void
    {
        $attacks = [
            'someone@gatech.edu.attacker.com',
            'someone@edu.attacker.com',
            'someone@notedu.com',
            'someone@gatech.edu.co',
            'someone@gmail.com',
            'someone@school.edu.evil.net',
        ];

        foreach ($attacks as $address) {
            $this->assertFalse(
                SchoolDomain::isInstitutional($address),
                "{$address} must not pass the .edu/.org gate",
            );
        }
    }

    public function test_domain_gate_accepts_real_institutional_addresses(): void
    {
        $this->assertTrue(SchoolDomain::isInstitutional('baker@gatech.edu'));
        $this->assertTrue(SchoolDomain::isInstitutional('someone@stalbansschool.org'));
        // Subdomains still resolve to the registrable domain.
        $this->assertSame('gatech.edu', SchoolDomain::fromEmail('a@mail.gatech.edu')->registrable);
    }

    public function test_domain_gate_rejects_malformed_addresses(): void
    {
        foreach (['not-an-email', 'a@', '@gatech.edu', "a@gatech.edu\nBcc: x@y.com"] as $bad) {
            $this->assertFalse(SchoolDomain::isInstitutional($bad), "{$bad} must be rejected");
        }
    }

    public function test_known_domains_carry_a_name_and_unknown_ones_do_not(): void
    {
        $known = SchoolDomain::fromEmail('baker@gatech.edu');
        $this->assertTrue($known->isKnown());
        $this->assertSame('Georgia Institute of Technology', $known->known()[0]);

        $unknown = SchoolDomain::fromEmail('head@stalbansschool.org');
        $this->assertFalse($unknown->isKnown());
        $this->assertNull($unknown->known());
    }

    // ---- Ownership ---------------------------------------------------------

    public function test_ownership_record_is_not_a_bare_hash_of_the_address(): void
    {
        $email = 'baker@gatech.edu';
        $record = Ownership::record($email);

        // The whole point: a plain digest would be guessable from the address.
        $this->assertNotSame(hash('sha256', $email), $record);
        $this->assertSame(64, strlen($record));
    }

    public function test_ownership_matches_only_the_owning_address(): void
    {
        $record = Ownership::record('baker@gatech.edu');

        $this->assertTrue(Ownership::matches($record, 'baker@gatech.edu'));
        $this->assertTrue(Ownership::matches($record, 'Baker@GaTech.edu'), 'case is normalised');
        $this->assertFalse(Ownership::matches($record, 'someone-else@gatech.edu'));
        $this->assertFalse(Ownership::matches($record, 'baker@gatech.edu.evil.com'));
    }

    // ---- The campus point reaches an outbound request ---------------------

    public function test_campus_point_rejects_values_that_are_not_numbers(): void
    {
        foreach ([
            '1',
            'a,b',
            '1,2,3',
            'NaN,0',
            '',
        ] as $bad) {
            $this->assertPointRejected($bad);
        }
    }

    public function test_campus_point_rejects_coordinates_outside_the_world(): void
    {
        $this->assertPointRejected('91,-84', 'latitude past the pole');
        $this->assertPointRejected('-95,-84', 'latitude past the south pole');
        $this->assertPointRejected('33,-200', 'longitude out of range');
        $this->assertPointRejected('33,181', 'longitude out of range');
    }

    public function test_campus_point_accepts_a_real_campus(): void
    {
        $point = CampusPoint::parse('33.77609,-84.39881');

        $this->assertEqualsWithDelta(33.77609, $point->latitude, 0.00001);
        $this->assertEqualsWithDelta(-84.39881, $point->longitude, 0.00001);
        $this->assertSame('33.77609,-84.39881', $point->toString());
    }

    public function test_a_listed_official_must_be_reachable(): void
    {
        // A row with neither an address nor a form is a button that opens an
        // empty draft, which is worse than not listing the office at all.
        try {
            OfficialInput::sanitiseAll([['name' => 'Jane Doe', 'title' => 'Councilmember']]);
            $this->fail('An official with no way to contact them should be refused.');
        } catch (InvalidArgumentException $e) {
            $this->assertStringContainsString('needs an email address', $e->getMessage());
        }
    }

    public function test_an_office_that_takes_a_web_form_needs_no_address(): void
    {
        // Members of Congress publish no mailbox at all, so a form URL is the
        // only contact they have and must count as one.
        $officials = OfficialInput::sanitiseAll([[
            'name' => 'Jon Ossoff',
            'title' => 'United States Senator',
            'url' => 'https://www.ossoff.senate.gov/contact-us',
            'role' => 'us-senate',
        ]]);

        $this->assertCount(1, $officials);
        $this->assertNull($officials[0]['email']);
        $this->assertNotNull($officials[0]['url']);
    }

    // ---- The edit key is a credential -------------------------------------

    public function test_the_edit_key_is_never_stored_in_a_recoverable_form(): void
    {
        $key = EditKey::generate();
        $hash = EditKey::hash($key);

        $this->assertStringStartsWith('$2y$', $hash, 'bcrypt, not a bare digest');
        $this->assertStringNotContainsString($key, $hash);
        $this->assertNotSame(hash('sha256', $key), $hash);
        $this->assertTrue(EditKey::matches($hash, $key));
    }

    public function test_the_edit_key_survives_how_people_actually_type_it(): void
    {
        $key = EditKey::generate();
        $hash = EditKey::hash($key);

        $this->assertTrue(EditKey::matches($hash, strtolower($key)));
        $this->assertTrue(EditKey::matches($hash, str_replace('-', '', $key)));
        $this->assertTrue(EditKey::matches($hash, '  '.$key.'  '));
    }

    public function test_a_wrong_or_empty_edit_key_is_refused(): void
    {
        $hash = EditKey::hash(EditKey::generate());

        $this->assertFalse(EditKey::matches($hash, 'AAAAA-BBBBB-CCCCC-DDDDD'));
        $this->assertFalse(EditKey::matches($hash, ''));
        $this->assertFalse(EditKey::matches('', 'anything'));
    }

    public function test_generated_keys_do_not_repeat(): void
    {
        $keys = [];

        for ($i = 0; $i < 50; $i++) {
            $keys[] = EditKey::generate();
        }

        $this->assertCount(50, array_unique($keys));
    }

    public function test_an_edit_pass_cannot_be_replayed_against_another_chapter(): void
    {
        $token = EditPass::issue('gatech')->toToken();

        $this->assertSame('gatech', EditPass::fromToken($token, 'gatech')->slug);

        try {
            EditPass::fromToken($token, 'rutgers');
            $this->fail('A pass for one chapter must not edit another.');
        } catch (RuntimeException) {
            $this->addToAssertionCount(1);
        }
    }

    public function test_a_forged_edit_pass_is_refused(): void
    {
        foreach (['', 'garbage', base64_encode('{"s":"gatech","x":9999999999,"p":"edit-key"}')] as $bad) {
            try {
                EditPass::fromToken($bad, 'gatech');
                $this->fail("Forged pass \"{$bad}\" should have been refused.");
            } catch (RuntimeException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    // ---- Officials are typed in by a creator and land in a mailto ----------

    public function test_official_email_cannot_smuggle_a_mail_header(): void
    {
        foreach ([
            "rep@house.gov\r\nBcc: everyone@example.com",
            "rep@house.gov\nCc: someone@example.com",
            'not-an-address',
            'rep@',
        ] as $bad) {
            try {
                OfficialInput::sanitiseAll([['name' => 'Jane Doe', 'email' => $bad]]);
                $this->fail("Email \"{$bad}\" should have been refused.");
            } catch (InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    /**
     * The address is interpolated into "mailto:{address}?subject=...&body=..."
     * without being URL-encoded, so a "?" or "&" inside it starts the query
     * string early and every following segment becomes a mailto parameter. That
     * is how a creator would silently add a Bcc to a letter a reader believes
     * they are sending to one office.
     */
    public function test_official_email_cannot_smuggle_mailto_parameters(): void
    {
        foreach ([
            'rep?bcc=harvest@example.com',
            'rep?subject=Resign&bcc=harvest@example.com',
            'rep&cc=harvest@example.com',
            'rep#fragment@house.gov',
            'rep%3Fbcc=harvest@example.com',
            'rep/x@house.gov',
            '"a>b"@house.gov',
        ] as $bad) {
            try {
                OfficialInput::sanitiseAll([['name' => 'Jane Doe', 'email' => $bad]]);
                $this->fail("Email \"{$bad}\" should have been refused.");
            } catch (InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_ordinary_official_addresses_still_pass(): void
    {
        $officials = OfficialInput::sanitiseAll([
            ['name' => 'Jane Doe', 'email' => 'first.last@house.gov'],
            ['name' => 'John Roe', 'email' => 'Rep+District4@city-hall.example.org'],
            ["name" => 'Ann Poe', 'email' => "o'brien@house.gov"],
        ]);

        $this->assertSame('first.last@house.gov', $officials[0]['email']);
        $this->assertSame('rep+district4@city-hall.example.org', $officials[1]['email']);
        $this->assertSame("o'brien@house.gov", $officials[2]['email']);
    }

    // ---- Social handles are a per-platform allowlist -----------------------

    /**
     * The handle is trimmed before the transformations, not after, so stripping
     * a trailing slash or a query string can re-expose a newline that "$" then
     * accepts as the end of the subject.
     */
    public function test_a_social_handle_cannot_carry_a_newline_past_the_allowlist(): void
    {
        foreach (["deflock\n/", "deflock\n?utm=1", "deflock\n\n/"] as $bad) {
            try {
                $handle = SocialHandle::normalise($bad, 'instagram');
                $this->fail(
                    "Handle \"{$bad}\" should have been refused, got ".json_encode($handle)
                );
            } catch (InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_handles_people_actually_paste_still_normalise(): void
    {
        $this->assertSame('deflock.gt', SocialHandle::normalise('@deflock.gt', 'instagram'));
        $this->assertSame(
            'deflock.gt',
            SocialHandle::normalise('https://www.instagram.com/deflock.gt/', 'instagram'),
        );
        $this->assertSame('deflock_gt', SocialHandle::normalise('  deflock_gt  ', 'tiktok'));
    }

    public function test_official_link_must_be_https(): void
    {
        foreach ([
            'javascript:alert(1)',
            'http://insecure.example',
            'data:text/html,<script>alert(1)</script>',
        ] as $bad) {
            try {
                OfficialInput::sanitiseAll([['name' => 'Jane Doe', 'url' => $bad]]);
                $this->fail("Link \"{$bad}\" should have been refused.");
            } catch (InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_official_names_are_flattened_and_capped(): void
    {
        $officials = OfficialInput::sanitiseAll([
            ['name' => "Jane\nDoe", 'title' => 'State Representative', 'email' => 'jane@house.gov'],
            ['name' => '', 'title' => 'an empty slot in the form'],
            ['name' => str_repeat('a', 400), 'title' => '', 'email' => 'long@house.gov'],
        ]);

        $this->assertCount(2, $officials, 'a nameless row is skipped, not stored');
        $this->assertSame('Jane Doe', $officials[0]['name']);
        $this->assertSame(120, mb_strlen($officials[1]['name']));
    }

    public function test_a_chapter_cannot_list_unlimited_officials(): void
    {
        $rows = array_fill(0, 50, ['name' => 'Jane Doe', 'title' => 'Rep', 'email' => 'jane@house.gov']);

        $this->assertLessThanOrEqual(6, count(OfficialInput::sanitiseAll($rows)));
    }

    /** A state code is interpolated into an Overpass query, so it is allowlisted. */
    public function test_state_code_must_be_two_letters_before_reaching_a_query(): void
    {
        $builder = app(SurveyBuilder::class);

        foreach (['G', 'GAA', 'G A', '";out;', 'G1'] as $bad) {
            try {
                $builder->build(CampusPoint::parse('33.7,-84.3'), $bad);
                $this->fail("State code \"{$bad}\" should have been refused.");
            } catch (InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    // ---- The rotation counter turns a slug into a filename too --------------

    /**
     * The same anchor bug as SocialHandle's, in the other class that builds a
     * path from a slug. "$" matches before a trailing newline as well as at the
     * end of the subject, and this gate does not trim, so "gatech\n" walked
     * through an allowlist that claims to permit only [a-z0-9-] and produced a
     * counter file with a newline in its name.
     */
    public function test_the_rotation_counter_refuses_a_slug_with_a_trailing_newline(): void
    {
        $directory = $this->temporaryDirectory();
        $counter = new RotationCounter($directory);

        try {
            $counter->next("gatech\n");
            $this->fail('A slug with a trailing newline should never reach a filename.');
        } catch (InvalidArgumentException) {
            $this->addToAssertionCount(1);
        }

        try {
            $counter->current("gatech\n");
            $this->fail('Reading the counter must apply the same allowlist as writing it.');
        } catch (InvalidArgumentException) {
            $this->addToAssertionCount(1);
        }

        $counter->next('gatech');

        $this->assertSame(
            ['gatech.txt'],
            array_values(array_diff(scandir($directory), ['.', '..'])),
            'only the allowlisted slug may become a file',
        );
    }

    public function test_the_rotation_counter_still_counts_an_ordinary_slug(): void
    {
        $counter = new RotationCounter($this->temporaryDirectory());

        $this->assertSame(1, $counter->next('georgia-tech'));
        $this->assertSame(2, $counter->next('georgia-tech'));
        $this->assertSame(2, $counter->current('georgia-tech'));
        $this->assertSame(0, $counter->current('rutgers'), 'counters do not bleed between chapters');
    }

    private function temporaryDirectory(): string
    {
        $directory = sys_get_temp_dir().'/deflock-test-'.bin2hex(random_bytes(6));

        mkdir($directory, 0775, true);

        return $directory;
    }

    private function assertPointRejected(string $value, string $why = ''): void
    {
        try {
            CampusPoint::parse($value);
            $this->fail("Campus point \"{$value}\" should have been refused: {$why}");
        } catch (InvalidArgumentException) {
            $this->addToAssertionCount(1);
        }
    }
}
