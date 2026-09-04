<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Chapters\BoundingBox;
use App\Chapters\Ownership;
use App\Chapters\SchoolDomain;
use App\Chapters\Slug;
use InvalidArgumentException;
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

    // ---- Bounding boxes reach an outbound request --------------------------

    public function test_bounding_box_rejects_values_that_are_not_numbers(): void
    {
        foreach ([
            '1,2,3',
            'a,b,c,d',
            '1,2,3,4,5',
            'NaN,0,1,1',
            '',
        ] as $bad) {
            $this->assertBoxRejected($bad);
        }
    }

    public function test_bounding_box_rejects_inverted_and_out_of_range_frames(): void
    {
        $this->assertBoxRejected('40,-80,30,-70', 'south past north');
        $this->assertBoxRejected('30,-70,40,-80', 'west past east');
        $this->assertBoxRejected('-95,-80,-90,-70', 'below the mercator limit');
        $this->assertBoxRejected('30,-200,40,-190', 'longitude out of range');
    }

    public function test_bounding_box_caps_area_so_a_chapter_cannot_fetch_a_continent(): void
    {
        $this->assertBoxRejected('25,-124,49,-66', 'the whole country');
        $this->assertBoxRejected('33.7700,-84.3900,33.7701,-84.3899', 'far too small');
    }

    public function test_bounding_box_accepts_a_real_campus_frame(): void
    {
        $box = BoundingBox::parse('33.7690,-84.4090,33.7830,-84.3880');

        $this->assertEqualsWithDelta(1.2, $box->areaInSquareMiles(), 0.2);
        $this->assertEqualsWithDelta(1.247, $box->aspect(), 0.01);
    }

    private function assertBoxRejected(string $value, string $why = ''): void
    {
        try {
            BoundingBox::parse($value);
            $this->fail("\"{$value}\" should have been rejected".($why ? " ({$why})" : ''));
        } catch (InvalidArgumentException) {
            $this->addToAssertionCount(1);
        }
    }
}
