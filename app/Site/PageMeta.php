<?php

declare(strict_types=1);

namespace App\Site;

/**
 * The tags a link preview is built from.
 *
 * These have to be rendered by the server. A message app, Slack, or a search
 * crawler fetches the URL and reads the HTML without running any JavaScript,
 * so anything Inertia sets from React arrives far too late to be seen. That is
 * why this is a plain array handed to the Blade root rather than a <Head> in a
 * component.
 *
 * Absolute URLs throughout, because a preview is assembled somewhere else and
 * a relative path has nothing to resolve against.
 */
final readonly class PageMeta
{
    public const SITE_NAME = 'DeFlock Campus';

    /** Landscape, so a message bubble shows the artwork rather than cropping it. */
    private const CARD_IMAGE = '/og-image.png';

    private const CARD_WIDTH = 1200;

    private const CARD_HEIGHT = 630;

    public function __construct(
        public string $title,
        public string $description,
        public string $url,
        public string $image,
        /** "website" for the site itself, "article" for a chapter. */
        public string $type = 'website',
        /** Set on pages reached only by a signed link, or by a passphrase. */
        public bool $noindex = false,
    ) {}

    /**
     * @param  string|null  $path  Absolute path on the canonical host.
     * @param  string|null  $url   A complete URL, for a page that lives on its
     *                             own host, such as a chapter's subdomain.
     */
    public static function make(
        string $title,
        string $description,
        ?string $path = null,
        ?string $url = null,
        ?string $image = null,
        string $type = 'website',
        bool $noindex = false,
    ): self {
        return new self(
            title: $title,
            description: $description,
            url: $url ?? self::baseUrl().($path ?? '/'),
            image: $image ?? self::baseUrl().self::CARD_IMAGE,
            type: $type,
            noindex: $noindex,
        );
    }

    /**
     * The site's own address.
     *
     * www is the front door, so every preview and canonical link points there
     * rather than at the bare apex, which only redirects.
     */
    public static function baseUrl(): string
    {
        $apex = (string) config('app.domain');

        return $apex === '' ? rtrim(url('/'), '/') : 'https://www.'.$apex;
    }

    /** A page reached only by a signed link, kept out of search and previews. */
    public static function private(string $title): self
    {
        return self::make(
            title: $title.' · '.self::SITE_NAME,
            description: '',
            image: '',
            noindex: true,
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'url' => $this->url,
            'image' => $this->image,
            'type' => $this->type,
            'siteName' => self::SITE_NAME,
            'imageWidth' => self::CARD_WIDTH,
            'imageHeight' => self::CARD_HEIGHT,
            'noindex' => $this->noindex,
        ];
    }
}
