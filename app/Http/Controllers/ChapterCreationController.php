<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\BoundingBox;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\Ownership;
use App\Chapters\Slug;
use App\Chapters\VerificationTicket;
use App\Maps\CampusMapBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use RuntimeException;

/**
 * The create flow: verify, name, frame, generate.
 *
 * The ticket is re-validated on every request that writes. There is no session,
 * so proof travels with the user and is never assumed from a previous step.
 */
final class ChapterCreationController extends Controller
{
    /** Building a chapter runs three Overpass queries, so it is not a free action. */
    private const MAX_BUILDS_PER_TICKET_PER_HOUR = 4;

    public function __construct(
        private readonly ChapterRepository $chapters,
        private readonly CampusMapBuilder $maps,
    ) {}

    /** Landing point of the emailed link. */
    public function start(Request $request): Response|RedirectResponse
    {
        try {
            $ticket = VerificationTicket::fromToken((string) $request->query('ticket', ''));
        } catch (RuntimeException $e) {
            return redirect()->route('home')->withErrors(['email' => $e->getMessage()]);
        }

        // Now that control of the address is proved, saying what exists is safe.
        $existing = $this->chapters->findByDomain($ticket->domain);
        $known = $ticket->domain->known();

        return Inertia::render('Chapters/Create', [
            'ticket' => (string) $request->query('ticket'),
            'domain' => $ticket->domain->registrable,
            'minutesRemaining' => $ticket->minutesRemaining(),
            'known' => $known ? [
                'schoolName' => $known[0],
                'shortName' => $known[1],
                'state' => $known[2],
            ] : null,
            'suggestedSlug' => $ticket->domain->suggestedSlug(),
            'existing' => $existing?->toPublicArray(),
            'limits' => [
                'maxAreaSqMiles' => BoundingBox::MAX_AREA_SQ_MILES,
                'minAreaSqMiles' => BoundingBox::MIN_AREA_SQ_MILES,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ticket' => ['required', 'string'],
            'schoolName' => ['required', 'string', 'min:2', 'max:120'],
            'shortName' => ['required', 'string', 'min:2', 'max:60'],
            'state' => ['required', 'string', 'size:2', 'alpha'],
            'slug' => ['required', 'string', 'max:32'],
            'bbox' => ['required', 'string', 'max:120'],
        ]);

        try {
            $ticket = VerificationTicket::fromToken($validated['ticket']);
        } catch (RuntimeException $e) {
            return redirect()->route('home')->withErrors(['email' => $e->getMessage()]);
        }

        try {
            $slug = Slug::fromString($validated['slug']);
            $box = BoundingBox::parse($validated['bbox']);
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['slug' => $e->getMessage()])->withInput();
        }

        if ($this->chapters->exists($slug)) {
            return back()->withErrors([
                'slug' => "\"{$slug}\" is taken. Pick another address for your chapter.",
            ])->withInput();
        }

        // One school, one chapter. The domain is the school's identity.
        if ($existing = $this->chapters->findByDomain($ticket->domain)) {
            return redirect()->route('chapters.show', $existing->slug);
        }

        $key = 'chapter-build:'.Ownership::record($ticket->email);

        if (RateLimiter::tooManyAttempts($key, self::MAX_BUILDS_PER_TICKET_PER_HOUR)) {
            return back()->withErrors([
                'bbox' => 'Too many builds from this address in the last hour. '
                    .'OpenStreetMap is a free service and we query it politely.',
            ])->withInput();
        }

        RateLimiter::hit($key, 3600);

        try {
            $map = $this->maps->build(
                $box,
                strtoupper($validated['state']),
                $validated['shortName'],
            );
        } catch (RuntimeException $e) {
            return back()->withErrors(['bbox' => $e->getMessage()])->withInput();
        }

        $now = now()->toIso8601String();

        $this->chapters->save(new Chapter(
            slug: $slug->value,
            schoolName: $validated['schoolName'],
            shortName: $validated['shortName'],
            state: strtoupper($validated['state']),
            ownerDomain: $ticket->domain->registrable,
            ownerRecord: Ownership::record($ticket->email),
            map: $map,
            createdAt: $now,
            updatedAt: $now,
        ));

        return redirect()->route('chapters.show', $slug->value)
            ->with('status', 'Your chapter is live.');
    }
}
