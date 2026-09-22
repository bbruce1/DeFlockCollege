<?php

declare(strict_types=1);

namespace App\Chapters;

use InvalidArgumentException;

/**
 * The school identity, derived from a verified email address.
 *
 * The gate is .edu, .org, or a US school district domain, applied to the
 * REGISTRABLE domain rather than as a suffix match:
 * "evil-gatech.edu.attacker.com" ends in neither, but a careless check on the
 * wrong segment would accept it. The host is parsed into labels and compared
 * exactly. See security.md.
 *
 * District domains are the reason the registrable domain is not simply the last
 * two labels. Public high schools sit on "<district>.k12.<state>.us", where
 * "k12.<state>.us" is a public suffix: taking two labels there would make every
 * district in Virginia share the identity "va.us", so the first one to start a
 * chapter would lock out all the others and could edit theirs. Four labels are
 * kept for that shape.
 */
final readonly class SchoolDomain
{
    /** Only these are treated as institutional. */
    private const ALLOWED_TLDS = ['edu', 'org'];

    /**
     * The public suffix US school districts register under.
     *
     * Registration below it is administered rather than open, which is what
     * makes it a usable proof of belonging in the way a .com never could. Bare
     * ".us" stays refused: anybody can have one of those.
     */
    private const DISTRICT_LABEL = 'k12';

    private const DISTRICT_TLD = 'us';

    /**
     * Domains we can name without asking. Everything else, including every high
     * school, is named by the creator; a curated list was never going to cover
     * K-12 and the domain does that work instead.
     */
    private const KNOWN = [
        'gatech.edu' => ['Georgia Institute of Technology', 'Georgia Tech', 'GA'],
        'asu.edu' => ['Arizona State University', 'Arizona State', 'AZ'],
        'berkeley.edu' => ['University of California, Berkeley', 'Berkeley', 'CA'],
        'bu.edu' => ['Boston University', 'BU', 'MA'],
        'clemson.edu' => ['Clemson University', 'Clemson', 'SC'],
        'cornell.edu' => ['Cornell University', 'Cornell', 'NY'],
        'duke.edu' => ['Duke University', 'Duke', 'NC'],
        'emory.edu' => ['Emory University', 'Emory', 'GA'],
        'fsu.edu' => ['Florida State University', 'Florida State', 'FL'],
        'gsu.edu' => ['Georgia State University', 'Georgia State', 'GA'],
        'illinois.edu' => ['University of Illinois Urbana-Champaign', 'Illinois', 'IL'],
        'indiana.edu' => ['Indiana University Bloomington', 'Indiana', 'IN'],
        'mit.edu' => ['Massachusetts Institute of Technology', 'MIT', 'MA'],
        'msu.edu' => ['Michigan State University', 'Michigan State', 'MI'],
        'ncsu.edu' => ['North Carolina State University', 'NC State', 'NC'],
        'northwestern.edu' => ['Northwestern University', 'Northwestern', 'IL'],
        'nyu.edu' => ['New York University', 'NYU', 'NY'],
        'osu.edu' => ['The Ohio State University', 'Ohio State', 'OH'],
        'psu.edu' => ['Pennsylvania State University', 'Penn State', 'PA'],
        'purdue.edu' => ['Purdue University', 'Purdue', 'IN'],
        'rutgers.edu' => ['Rutgers University', 'Rutgers', 'NJ'],
        'stanford.edu' => ['Stanford University', 'Stanford', 'CA'],
        'tamu.edu' => ['Texas A&M University', 'Texas A&M', 'TX'],
        'ucla.edu' => ['University of California, Los Angeles', 'UCLA', 'CA'],
        'ufl.edu' => ['University of Florida', 'Florida', 'FL'],
        'uga.edu' => ['University of Georgia', 'Georgia', 'GA'],
        'umich.edu' => ['University of Michigan', 'Michigan', 'MI'],
        'umn.edu' => ['University of Minnesota', 'Minnesota', 'MN'],
        'unc.edu' => ['University of North Carolina at Chapel Hill', 'UNC', 'NC'],
        'usc.edu' => ['University of Southern California', 'USC', 'CA'],
        'utexas.edu' => ['University of Texas at Austin', 'UT Austin', 'TX'],
        'virginia.edu' => ['University of Virginia', 'UVA', 'VA'],
        'washington.edu' => ['University of Washington', 'Washington', 'WA'],
        'wisc.edu' => ['University of Wisconsin-Madison', 'Wisconsin', 'WI'],
    ];

    private function __construct(public string $registrable) {}

    /**
     * Extracts and validates the registrable domain from an email address.
     *
     * @throws InvalidArgumentException when the address is malformed or the domain
     *                                  is not institutional
     */
    public static function fromEmail(string $email): self
    {
        $address = trim($email);

        // Validate before anything touches the mailer, which closes header injection.
        if (! filter_var($address, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('That does not look like an email address.');
        }

        $at = strrpos($address, '@');
        $host = strtolower(substr($address, $at + 1));

        if ($host === '' || str_contains($host, '..')) {
            throw new InvalidArgumentException('That email address has no usable domain.');
        }

        $labels = explode('.', $host);

        if (count($labels) < 2) {
            throw new InvalidArgumentException('That email address has no usable domain.');
        }

        if ($district = self::districtDomain($labels)) {
            return new self($district);
        }

        // The registrable domain is the last two labels. Comparing the TLD here,
        // rather than checking whether the host merely ends with ".edu", is what
        // rejects hosts like "gatech.edu.attacker.com".
        $tld = array_pop($labels);
        $name = array_pop($labels);

        if (! in_array($tld, self::ALLOWED_TLDS, true)) {
            throw new InvalidArgumentException(
                'Chapters can only be started from a school address: .edu, .org, or a '
                .'district address ending in .k12.'.self::DISTRICT_TLD.'. That is how we '
                .'know you are actually at the school.'
            );
        }

        if ($name === '') {
            throw new InvalidArgumentException('That email address has no usable domain.');
        }

        return new self("{$name}.{$tld}");
    }

    /**
     * The district's own domain, for a host under "k12.<state>.us".
     *
     * Null when the host is not that shape, so the ordinary two-label rule
     * applies. A deeper host like "mail.fcps.k12.va.us" still belongs to
     * "fcps.k12.va.us": the district is the label directly above the suffix.
     *
     * @param  list<string>  $labels
     */
    private static function districtDomain(array $labels): ?string
    {
        if (count($labels) < 4) {
            return null;
        }

        [$state, $tld] = [$labels[count($labels) - 2], $labels[count($labels) - 1]];

        if ($tld !== self::DISTRICT_TLD || $labels[count($labels) - 3] !== self::DISTRICT_LABEL) {
            return null;
        }

        // Checked against the real states, so "k12.zz.us" is not a free pass
        // into a namespace nobody administers.
        if (! States::exists($state)) {
            return null;
        }

        $district = $labels[count($labels) - 4];

        if ($district === '') {
            return null;
        }

        return implode('.', [$district, self::DISTRICT_LABEL, $state, $tld]);
    }

    public static function isInstitutional(string $email): bool
    {
        try {
            self::fromEmail($email);

            return true;
        } catch (InvalidArgumentException) {
            return false;
        }
    }

    /**
     * Whether this domain covers a whole district rather than one school.
     *
     * A university domain is one institution, so one domain means one chapter.
     * A district domain is not: Fairfax County runs about twenty-five high
     * schools on fcps.k12.va.us, and treating that as one school would let the
     * first student to arrive lock out every other school in the county.
     */
    public function isDistrict(): bool
    {
        return str_ends_with($this->registrable, '.'.self::DISTRICT_TLD)
            && str_contains($this->registrable, '.'.self::DISTRICT_LABEL.'.');
    }

    public function isKnown(): bool
    {
        return isset(self::KNOWN[$this->registrable]);
    }

    /** [full name, short name, state] when we know the school, otherwise null. */
    public function known(): ?array
    {
        return self::KNOWN[$this->registrable] ?? null;
    }

    public function suggestedSlug(): string
    {
        return Slug::suggestFrom($this->registrable);
    }

    public function __toString(): string
    {
        return $this->registrable;
    }
}
