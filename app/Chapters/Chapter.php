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
 *   generated  everything under `map`. Rebuilt from OpenStreetMap on demand and
 *              safe to discard.
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
        public string $ownerDomain,
        /** HMAC of the creator's address. Never the address itself. */
        public string $ownerRecord,
        public ChapterMap $map,
        public ?string $instagram = null,
        public ?string $tiktok = null,
        public string $createdAt = '',
        public string $updatedAt = '',
    ) {}

    /**
     * A chapter is only publishable once it has readers to talk about. With none
     * mapped, the page says so and invites mapping rather than asserting a ring
     * that is not there.
     */
    public function status(): string
    {
        return $this->map->readersWithinMile > 0 ? 'live' : 'empty';
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

    public function toArray(): array
    {
        return [
            'slug' => $this->slug,
            'schoolName' => $this->schoolName,
            'shortName' => $this->shortName,
            'state' => $this->state,
            'ownerDomain' => $this->ownerDomain,
            'ownerRecord' => $this->ownerRecord,
            'instagram' => $this->instagram,
            'tiktok' => $this->tiktok,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
            'map' => $this->map->toArray(),
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            slug: (string) ($data['slug'] ?? ''),
            schoolName: (string) ($data['schoolName'] ?? ''),
            shortName: (string) ($data['shortName'] ?? ''),
            state: (string) ($data['state'] ?? ''),
            ownerDomain: (string) ($data['ownerDomain'] ?? ''),
            ownerRecord: (string) ($data['ownerRecord'] ?? ''),
            map: ChapterMap::fromArray($data['map'] ?? []),
            instagram: $data['instagram'] ?? null,
            tiktok: $data['tiktok'] ?? null,
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
            'schoolName' => $this->schoolName,
            'shortName' => $this->shortName,
            'state' => $this->state,
            'instagram' => $this->instagram,
            'tiktok' => $this->tiktok,
            'status' => $this->status(),
            'map' => $this->map->toArray(),
        ];
    }
}
