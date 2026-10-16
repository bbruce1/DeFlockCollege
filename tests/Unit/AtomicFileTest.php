<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Storage\AtomicFile;
use PHPUnit\Framework\TestCase;

/**
 * The guarantees chapter files rely on when they are rewritten in place.
 */
final class AtomicFileTest extends TestCase
{
    private string $directory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->directory = sys_get_temp_dir().'/atomic-file-'.bin2hex(random_bytes(4));
        mkdir($this->directory);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->directory.'/{,.}*', GLOB_BRACE) ?: [] as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }

        rmdir($this->directory);

        parent::tearDown();
    }

    public function test_a_rewrite_keeps_the_permissions_the_file_already_had(): void
    {
        // The deployment's choice, e.g. group-writable for a shared deploy user.
        $path = $this->directory.'/chapter.json';
        file_put_contents($path, '{"old":true}');
        chmod($path, 0664);

        AtomicFile::write($path, '{"new":true}');

        clearstatcache();
        $this->assertSame(0664, fileperms($path) & 0777);
        $this->assertSame('{"new":true}', file_get_contents($path));
    }

    public function test_a_rewrite_leaves_no_staged_file_behind(): void
    {
        $path = $this->directory.'/chapter.json';
        file_put_contents($path, 'old');

        AtomicFile::write($path, 'new');

        $this->assertSame([$path], glob($this->directory.'/*'));
    }

    public function test_create_does_not_touch_an_existing_file(): void
    {
        $path = $this->directory.'/chapter.json';
        file_put_contents($path, 'first');

        $this->assertFalse(AtomicFile::create($path, 'second'));
        $this->assertSame('first', file_get_contents($path));
    }
}
