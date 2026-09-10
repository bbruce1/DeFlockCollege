<?php

declare(strict_types=1);

namespace App\Officials;

/**
 * One office a student can write to.
 *
 * An office is only worth listing if it can actually act on the ask, so the
 * directory holds offices with authority over installations rather than every
 * contactable official.
 */
final readonly class Official
{
    public function __construct(
        public string $name,
        public string $title,
        /** Null when we hold no public address; the page then offers the lookup. */
        public ?string $email,
        /** Where a student confirms their own representative, or the office page. */
        public ?string $url,
        /** One of OfficialRole's values, so a page can group and label them. */
        public string $role,
        /** 'state' for the shipped directory, 'chapter' for creator-added. */
        public string $scope,
    ) {}

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'title' => $this->title,
            'email' => $this->email,
            'url' => $this->url,
            'role' => $this->role,
            'roleLabel' => OfficialRole::label($this->role),
            'scope' => $this->scope,
        ];
    }

    /** @param  array<string, mixed>  $data */
    public static function fromArray(array $data): self
    {
        return new self(
            name: (string) ($data['name'] ?? ''),
            title: (string) ($data['title'] ?? ''),
            email: ($data['email'] ?? null) ?: null,
            url: ($data['url'] ?? null) ?: null,
            role: OfficialRole::normalise((string) ($data['role'] ?? '')),
            scope: (string) ($data['scope'] ?? 'state'),
        );
    }
}
