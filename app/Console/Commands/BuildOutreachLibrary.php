<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Merges the per-angle letter files into the single library pages read from.
 *
 * The merge is also the gate. A letter that repeats another, invents a figure,
 * or carries a phrase that marks it as boilerplate is worse than no letter at
 * all, because it is read by the one person the chapter needed to persuade.
 * Anything that fails a check is reported and left out rather than shipped.
 */
final class BuildOutreachLibrary extends Command
{
    protected $signature = 'outreach:build {--strict : Exit non-zero if anything was rejected}';

    protected $description = 'Merge and validate the outreach letter templates';

    /** Openings and filler that mark a letter as unread boilerplate. */
    private const BANNED = [
        'i hope this email finds you well', 'i am writing to express', 'as a concerned citizen',
        "in today's digital age", 'i am reaching out', 'let me be clear', 'now more than ever',
        'it is worth noting that', 'in conclusion', 'i hope this finds you',
    ];

    /**
     * Ways of saying who is writing, rotated so a thousand letters do not all
     * open with the same sentence.
     *
     * Every one of these is true of anybody the page hands the letter to, and
     * none of them claims more than that: not a year, not a course, not a
     * residence. A letter that guesses at those is a letter that can be wrong.
     */
    private const STUDENT_OPENERS = [
        'I am a student at {{school}}.',
        'I am a student at {{shortName}}.',
        'I am writing as a student at {{school}}.',
        'I am a student at {{shortName}}, in {{city}}.',
        'I am one of your constituents and a student at {{shortName}}.',
        'I am a student at {{school}}, writing for myself.',
    ];

    /**
     * Registers that lose the argument before it is read.
     *
     * A staffer who feels accused stops reading, and a letter that sneers is
     * one an office can dismiss without engaging. Direct asks are fine, and
     * plain imperatives are fine; what is refused here is sarcasm, accusation,
     * and anything that reads as a threat.
     */
    private const HOSTILE = [
        // Dismissive rhetoric aimed at the recipient.
        '/\bthan it apparently does\b/i',
        '/\b(surely|apparently|presumably) you\b/i',
        '/\bone wonders\b/i',
        '/\bit is hard to believe\b/i',
        '/\bno one seriously\b/i',
        // Accusations of what this particular office did.
        '/\byou(r office)? (failed|refused|ignored|allowed|permitted)\b/i',
        // Anything resembling a threat, electoral or otherwise.
        '/\b(if you (do not|don\'t|fail)[^.]{0,40}(vote|remember|election|ballot))/i',
        '/\b(will be remembered|at the ballot box|vote you out|held personally accountable)\b/i',
        // Absolutes that leave the recipient no room to agree.
        '/\b(indefensible|inexcusable|no excuse for|there is no (defence|defense))\b/i',
    ];


    private const PLACEHOLDERS = [
        'officialName', 'officialTitle', 'role', 'school', 'shortName',
        'city', 'state', 'readersWithinMile', 'readersInState',
    ];

    public function handle(): int
    {
        $directory = resource_path('data/emails');
        $files = collect(File::glob($directory.'/*.json'))
            ->reject(fn (string $path): bool => str_ends_with($path, 'library.json'));

        if ($files->isEmpty()) {
            $this->error("No angle files found in {$directory}.");

            return self::FAILURE;
        }

        $kept = [];
        $seenSubjects = [];
        $seenBodies = [];
        $rejected = [];

        foreach ($files as $path) {
            $entries = json_decode(File::get($path), true);

            if (! is_array($entries)) {
                $this->error('  '.basename($path).' is not valid JSON.');
                $rejected[] = basename($path).': unreadable';

                continue;
            }

            foreach ($entries as $entry) {
                $reason = $this->rejectionReason($entry, $seenSubjects, $seenBodies);

                if ($reason !== null) {
                    $rejected[] = ($entry['id'] ?? '?').": {$reason}";

                    continue;
                }

                $subject = $this->normalise($entry['subject']);
                $body = $this->withStudentOpener(
                    $this->normalise($entry['body']),
                    (string) $entry['id'],
                );

                $seenSubjects[mb_strtolower($subject)] = true;
                $seenBodies[mb_strtolower($body)] = true;

                $kept[] = ['id' => $entry['id'], 'subject' => $subject, 'body' => $body];
            }

            $this->line('  '.str_pad(basename($path), 22).count($entries).' read');
        }

        File::put(
            $directory.'/library.json',
            json_encode($kept, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        );

        $this->newLine();
        $this->info('  '.count($kept).' letters in the library');

        if ($rejected !== []) {
            $this->warn('  '.count($rejected).' rejected:');

            foreach (array_slice($rejected, 0, 25) as $line) {
                $this->line('    '.$line);
            }

            if (count($rejected) > 25) {
                $this->line('    … and '.(count($rejected) - 25).' more');
            }

            if ($this->option('strict')) {
                return self::FAILURE;
            }
        }

        return self::SUCCESS;
    }

    /**
     * @param  mixed  $entry
     * @param  array<string, true>  $seenSubjects
     * @param  array<string, true>  $seenBodies
     */
    private function rejectionReason(mixed $entry, array $seenSubjects, array $seenBodies): ?string
    {
        if (! is_array($entry) || ! isset($entry['id'], $entry['subject'], $entry['body'])) {
            return 'missing id, subject, or body';
        }

        $subject = $this->normalise((string) $entry['subject']);
        $body = $this->normalise((string) $entry['body']);

        if (isset($seenSubjects[mb_strtolower($subject)])) {
            return 'duplicate subject';
        }

        if (isset($seenBodies[mb_strtolower($body)])) {
            return 'duplicate body';
        }

        $haystack = mb_strtolower($subject.' '.$body);

        foreach (self::BANNED as $phrase) {
            if (str_contains($haystack, $phrase)) {
                return "banned phrase: {$phrase}";
            }
        }

        // The two count placeholders are the only figures a letter may carry.
        // Anything else numeric would be a fact nobody can stand behind.
        $stripped = preg_replace('/\{\{[a-zA-Z]+\}\}/', '', $subject.' '.$body) ?? '';

        if (preg_match('/\d/', $stripped) === 1) {
            return 'contains a number that is not a placeholder';
        }

        foreach ($this->placeholdersIn($subject.' '.$body) as $name) {
            if (! in_array($name, self::PLACEHOLDERS, true)) {
                return "unknown placeholder: {{{$name}}}";
            }
        }

        if (! str_starts_with($body, 'Dear ')) {
            return 'does not open with a salutation';
        }

        if (str_contains(mb_strtolower($body), 'demand')) {
            return 'reads as a demand rather than a request';
        }

        foreach (self::HOSTILE as $pattern) {
            if (preg_match($pattern, $subject.' '.$body) === 1) {
                return 'hostile register: '.trim($pattern, '/i\\b');
            }
        }

        $words = str_word_count(preg_replace('/\{\{[a-zA-Z]+\}\}/', 'x', $body) ?? '');

        if ($words < 60 || $words > 220) {
            return "body is {$words} words";
        }

        return null;
    }

    /** @return list<string> */
    private function placeholdersIn(string $text): array
    {
        preg_match_all('/\{\{([a-zA-Z]+)\}\}/', $text, $matches);

        return array_unique($matches[1]);
    }

    /**
     * Makes sure the letter says who is writing.
     *
     * A staffer reading an unsigned message from an unexplained stranger has no
     * reason to weigh it. "I am a student at X" is the whole of the sender's
     * standing, and it is the one thing every one of these letters can honestly
     * claim, so it goes in where the author did not put it.
     */
    private function withStudentOpener(string $body, string $id): string
    {
        if (preg_match('/\bstudent\b/i', $body) === 1) {
            return $body;
        }

        $paragraphs = explode("\n\n", $body);

        if (count($paragraphs) < 2) {
            return $body;
        }

        $opener = self::STUDENT_OPENERS[crc32($id) % count(self::STUDENT_OPENERS)];
        $paragraphs[1] = $opener.' '.$paragraphs[1];

        return implode("\n\n", $paragraphs);
    }

    /** US spelling throughout, and no smart punctuation that mangles in plain text. */
    private function normalise(string $text): string
    {
        return trim(strtr($text, [
            'licence' => 'license',
            'Licence' => 'License',
            'organise' => 'organize',
            'Organise' => 'Organize',
            'authorise' => 'authorize',
            'recognise' => 'recognize',
            '—' => ', ',
            '–' => '-',
            '’' => "'",
            '‘' => "'",
            '“' => '"',
            '”' => '"',
        ]));
    }
}
