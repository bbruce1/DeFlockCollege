<?php

declare(strict_types=1);

namespace App\Site;

use Illuminate\Support\Facades\File;
use RuntimeException;

/**
 * Which post ids exist, read from the posts themselves.
 *
 * Posts are written in TypeScript and built in the browser, so the server has
 * no list of them. Without one, /social/anything answered 200 and the page
 * said "no such post", which tells a search engine the address is real.
 *
 * Read from the source rather than kept as a second list here: posts are added
 * by dropping a file into resources/js/Posts/sets, often by people who never
 * open a PHP file, and a copy here would be stale by the next post. The parse
 * is deliberately narrow — a post's own id is the one written directly above
 * its `kind` — and a test counts every `kind` in the sets against what this
 * finds, so a post written in a shape this cannot see fails the build rather
 * than quietly answering 404.
 *
 * An id is listed when any chapter could see it. Some posts are only offered
 * to a chapter with a survey; the page still explains those for the rest.
 */
final class PostCatalogue
{
    /** A post's id, then its kind. A slide's id is never followed by one. */
    private const POST_ID = '/\bid:\s*[\'"]([a-z0-9-]+)[\'"],\s*kind:\s*[\'"]/';

    /** @var list<string>|null */
    private ?array $ids = null;

    public function __construct(private readonly string $directory) {}

    public function has(string $id): bool
    {
        return in_array($id, $this->ids(), true);
    }

    /** @return list<string> */
    public function ids(): array
    {
        return $this->ids ??= $this->scan();
    }

    /** @return list<string> */
    private function scan(): array
    {
        $files = File::glob($this->directory.DIRECTORY_SEPARATOR.'*.ts');

        // Loud, because the alternative is every post page answering 404 on a
        // deploy that left the sources behind, which nobody would notice.
        if ($files === []) {
            throw new RuntimeException("No post sets found in {$this->directory}.");
        }

        $ids = [];

        foreach ($files as $file) {
            preg_match_all(self::POST_ID, File::get($file), $matches);
            array_push($ids, ...$matches[1]);
        }

        return $ids;
    }
}
