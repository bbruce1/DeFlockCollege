<?php

declare(strict_types=1);

namespace App\Chapters;

use InvalidArgumentException;

/**
 * The school identity, derived from a verified email address.
 *
 * The gate is .edu or .org on the REGISTRABLE domain, not a suffix match:
 * "evil-gatech.edu.attacker.com" ends in neither, but a careless check on the
 * wrong segment would accept it. The host is parsed into labels and the last two
 * are compared exactly. See security.md.
 */
final readonly class SchoolDomain
{
    /** Only these are treated as institutional. */
    private const ALLOWED_TLDS = ['edu', 'org'];

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

        // The registrable domain is the last two labels. Comparing the TLD here,
        // rather than checking whether the host merely ends with ".edu", is what
        // rejects hosts like "gatech.edu.attacker.com".
        $tld = array_pop($labels);
        $name = array_pop($labels);

        if (! in_array($tld, self::ALLOWED_TLDS, true)) {
            throw new InvalidArgumentException(
                'Chapters can only be started from a .edu or .org address, which is how '
                .'we know you are actually at the school.'
            );
        }

        if ($name === '') {
            throw new InvalidArgumentException('That email address has no usable domain.');
        }

        return new self("{$name}.{$tld}");
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
