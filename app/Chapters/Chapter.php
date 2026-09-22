<?php

declare(strict_types=1);

namespace App\Chapters;

/**
 * A chapter, as stored.
 *
 * Two halves with different lifecycles:
 *
 *   authored   slug, names, ownership, socials. Written by a person, never
 *              overwritten by a refresh.
 *   generated  everything under `survey`. Rebuilt from OpenStreetMap on demand
 *              and safe to discard.
 *
 * There is no database. This is the whole record, and it lives in one JSON file.
 */
final readonly class Chapter
{
    public function __construct(
        public string $slug,
        public string $schoolName,
        public string $shortName,
        public string $state,
        /** Stored for the city offices that get loaded later. */
        public string $city,
        public string $ownerDomain,
        /** HMAC of the creator's address. Never the address itself. */
        public string $ownerRecord,
        public ReaderSurvey $survey,
        public ?string $instagram = null,
        public ?string $tiktok = null,
        /** Optional. When set, the page carries a petition block. */
        public ?string $petitionUrl = null,
        /**
         * Offices the creator added themselves, as [name, title, email, url].
         * Shown alongside anything the shipped directory holds for the state,
         * because the person who walks the campus knows who signed for the
         * cameras better than a national dataset does.
         */
        public array $officials = [],
        /**
         * Upcoming meetings, as [date, time, place, note], soonest first.
         * Past ones are filtered when the page renders rather than deleted, so
         * a creator does not lose a recurring slot by letting one lapse.
         */
        public array $meetings = [],
        /** The campus's two colours, as hex. Seeded at creation, editable after. */
        public string $colorPrimary = '#22d3ee',
        public string $colorSecondary = '#f43f5e',
        /** bcrypt hash of the key shown once at creation. Never the key itself. */
        public string $editKeyHash = '',
        /** When the creator confirmed they had saved that key. */
        public ?string $acknowledgedAt = null,
        /** The school's own two colours, if the creator gave them. */
        public ?SchoolColours $colours = null,
        public string $createdAt = '',
        public string $updatedAt = '',
    ) {}

    /**
     * A chapter is only publishable once it has readers to talk about. With none
     * mapped, the page says so and invites mapping rather than asserting a ring
     * that is not there.
     */
    /**
     * 'live' with readers mapped nearby, 'empty' when counted and none found,
     * 'unsurveyed' when OpenStreetMap could not be reached to count at all.
     *
     * The third exists so no listing tells a reader a campus has no cameras on
     * the strength of a query that never answered.
     */
    public function status(): string
    {
        if (! $this->survey->hasNearbyCount()) {
            return 'unsurveyed';
        }

        return $this->survey->readersWithinMile > 0 ? 'live' : 'empty';
    }

    public function isLive(): bool
    {
        return $this->status() === 'live';
    }

    public function isOwnedBy(string $email): bool
    {
        return Ownership::matches($this->ownerRecord, $email);
    }

    /** The domain that owns this, for re-verification. */
    public function ownerDomainMatches(SchoolDomain $domain): bool
    {
        return hash_equals($this->ownerDomain, $domain->registrable);
    }

    /** A copy with a new edit key hash, leaving everything else untouched. */
    public function withEditKeyHash(string $hash): self
    {
        return new self(
            slug: $this->slug,
            schoolName: $this->schoolName,
            shortName: $this->shortName,
            state: $this->state,
            city: $this->city,
            ownerDomain: $this->ownerDomain,
            ownerRecord: $this->ownerRecord,
            survey: $this->survey,
            instagram: $this->instagram,
            tiktok: $this->tiktok,
            petitionUrl: $this->petitionUrl,
            officials: $this->officials,
            meetings: $this->meetings,
            colorPrimary: $this->colorPrimary,
            colorSecondary: $this->colorSecondary,
            editKeyHash: $hash,
            acknowledgedAt: $this->acknowledgedAt,
            colours: $this->colours,
            createdAt: $this->createdAt,
            updatedAt: now()->toIso8601String(),
        );
    }

    public function toArray(): array
    {
        return [
            'slug' => $this->slug,
            // The subdomain when one is configured. A listing that linked to
            // "/{slug}" sent every reader to the form the site redirects away
            // from, and lost the address students actually share.
            'url' => \App\Site\PageMeta::chapterUrl($this->slug),
            'schoolName' => $this->schoolName,
            'shortName' => $this->shortName,
            'state' => $this->state,
            'city' => $this->city,
            'ownerDomain' => $this->ownerDomain,
            'ownerRecord' => $this->ownerRecord,
            'instagram' => $this->instagram,
            'tiktok' => $this->tiktok,
            'petitionUrl' => $this->petitionUrl,
            'officials' => $this->officials,
            'meetings' => $this->meetings,
            'colorPrimary' => $this->colorPrimary,
            'colorSecondary' => $this->colorSecondary,
            'editKeyHash' => $this->editKeyHash,
            'acknowledgedAt' => $this->acknowledgedAt,
            'colours' => $this->colours?->toArray(),
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
            'survey' => $this->survey->toArray(),
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            slug: (string) ($data['slug'] ?? ''),
            schoolName: (string) ($data['schoolName'] ?? ''),
            shortName: (string) ($data['shortName'] ?? ''),
            state: (string) ($data['state'] ?? ''),
            city: (string) ($data['city'] ?? ''),
            ownerDomain: (string) ($data['ownerDomain'] ?? ''),
            ownerRecord: (string) ($data['ownerRecord'] ?? ''),
            survey: ReaderSurvey::fromArray($data['survey'] ?? []),
            instagram: $data['instagram'] ?? null,
            tiktok: $data['tiktok'] ?? null,
            petitionUrl: $data['petitionUrl'] ?? null,
            officials: $data['officials'] ?? [],
            meetings: $data['meetings'] ?? [],
            colorPrimary: (string) ($data['colorPrimary'] ?? '#22d3ee'),
            colorSecondary: (string) ($data['colorSecondary'] ?? '#f43f5e'),
            editKeyHash: (string) ($data['editKeyHash'] ?? ''),
            acknowledgedAt: $data['acknowledgedAt'] ?? null,
            colours: SchoolColours::fromArray($data['colours'] ?? null),
            createdAt: (string) ($data['createdAt'] ?? ''),
            updatedAt: (string) ($data['updatedAt'] ?? ''),
        );
    }

    /**
     * The shape handed to the browser.
     *
     * Deliberately omits ownerRecord: it is a secret-keyed value and the page has
     * no use for it, so it never leaves the server.
     */
    public function toPublicArray(): array
    {
        return [
            'slug' => $this->slug,
            // The subdomain when one is configured. A listing that linked to
            // "/{slug}" sent every reader to the form the site redirects away
            // from, and lost the address students actually share.
            'url' => \App\Site\PageMeta::chapterUrl($this->slug),
            'schoolName' => $this->schoolName,
            'shortName' => $this->shortName,
            'state' => $this->state,
            'city' => $this->city,
            'instagram' => $this->instagram,
            'tiktok' => $this->tiktok,
            'petitionUrl' => $this->petitionUrl,
            'officials' => $this->officials,
            'colours' => $this->colours?->toArray(),
            'status' => $this->status(),
            'survey' => $this->survey->toArray(),
        ];
    }
}
