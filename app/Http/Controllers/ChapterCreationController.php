<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\EditKey;
use App\Chapters\Ownership;
use App\Chapters\SchoolColours;
use App\Chapters\Slug;
use App\Chapters\States;
use App\Chapters\SocialHandle;
use App\Chapters\VerificationTicket;
use App\Maps\Geocoder;
use App\Maps\SurveyBuilder;
use App\Chapters\InstagramProbe;
use App\Officials\LegislatorDirectory;
use App\Officials\OfficialInput;
use App\Officials\OfficialRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use RuntimeException;

/**
 * The create flow: verify, name, locate, generate.
 *
 * The ticket is re-validated on every request that writes. There is no session,
 * so proof travels with the user and is never assumed from a previous step.
 */
final class ChapterCreationController extends Controller
{
    /** Building a chapter runs two Overpass queries, so it is not a free action. */
    private const MAX_BUILDS_PER_TICKET_PER_HOUR = 4;

    /** Nominatim asks for light use, and a typeahead is the opposite of that. */
    private const MAX_LOOKUPS_PER_HOUR = 40;

    /** Instagram rate limits quickly, and the answer is advisory anyway. */
    private const MAX_HANDLE_CHECKS_PER_HOUR = 20;

    /**
     * The district lookup calls the Census geocoder, so it is somebody else's
     * service being spent. The route throttle is keyed on the client address,
     * which anybody sending this volume can rotate; a ticket cannot be rotated
     * without another verified school address, so the real bound is here.
     */
    private const MAX_DISTRICT_LOOKUPS_PER_HOUR = 30;

    public function __construct(
        private readonly ChapterRepository $chapters,
        private readonly SurveyBuilder $surveys,
        private readonly Geocoder $geocoder,
        private readonly LegislatorDirectory $legislators,
        private readonly InstagramProbe $instagram,
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
            // Reached only by a signed link; never indexed or previewed.
            'meta' => \App\Site\PageMeta::private('Start a chapter')->toArray(),
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
            'states' => States::options(),
            // The create form must classify an office the same way the edit
            // form does, or every hand-typed official lands as "City council".
            'roles' => OfficialRole::options(),
            'apex' => config('app.domain') ?: 'deflock.school',
        ]);
    }

    /** Place lookup for the creation form. Replaces drawing a box on a map. */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ticket' => ['required', 'string'],
            'term' => ['required', 'string', 'min:3', 'max:120'],
        ]);

        try {
            $ticket = VerificationTicket::fromToken($validated['ticket']);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $key = 'campus-lookup:'.Ownership::record($ticket->email);

        if (RateLimiter::tooManyAttempts($key, self::MAX_LOOKUPS_PER_HOUR)) {
            return response()->json([
                'message' => 'Too many lookups in the last hour. OpenStreetMap runs the '
                    .'place search for free and we query it politely.',
            ], 429);
        }

        RateLimiter::hit($key, 3600);

        try {
            return response()->json(['results' => $this->geocoder->search($validated['term'])]);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    /**
     * The legislators who represent the campus the creator just picked.
     *
     * Offered as a starting point rather than imposed: they arrive in the form
     * as ordinary rows the creator can edit or delete, because the person who
     * walks the campus knows who actually signed for the cameras.
     */
    public function districts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ticket' => ['required', 'string'],
            'point' => ['required', 'string', 'max:64'],
            'state' => ['nullable', 'string', 'size:2'],
        ]);

        try {
            $ticket = VerificationTicket::fromToken($validated['ticket']);
            $point = CampusPoint::parse($validated['point']);
        } catch (RuntimeException|InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $key = 'district-lookup:'.Ownership::record($ticket->email);

        if (RateLimiter::tooManyAttempts($key, self::MAX_DISTRICT_LOOKUPS_PER_HOUR)) {
            return response()->json([
                'message' => 'Too many district lookups in the last hour. Add the offices '
                    .'by hand, or try again shortly.',
            ], 429);
        }

        RateLimiter::hit($key, 3600);

        return response()->json([
            'officials' => $this->legislators->suggestFor($point, $validated['state'] ?? ''),
        ]);
    }

    /**
     * Advisory check on an Instagram handle.
     *
     * Never blocks creation. Instagram serves a login wall to servers, so a
     * definite answer is the exception rather than the rule: this exists to
     * catch an obvious typo before a page points at nothing, not to gate anyone.
     */
    public function checkHandle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ticket' => ['required', 'string'],
            'handle' => ['required', 'string', 'max:60'],
        ]);

        try {
            $ticket = VerificationTicket::fromToken($validated['ticket']);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $key = 'handle-check:'.Ownership::record($ticket->email);

        if (RateLimiter::tooManyAttempts($key, self::MAX_HANDLE_CHECKS_PER_HOUR)) {
            return response()->json(['result' => InstagramProbe::UNKNOWN]);
        }

        RateLimiter::hit($key, 3600);

        return response()->json(['result' => $this->instagram->check($validated['handle'])]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ticket' => ['required', 'string'],
            'schoolName' => ['required', 'string', 'min:2', 'max:120'],
            'shortName' => ['required', 'string', 'min:2', 'max:60'],
            'state' => ['required', 'string', 'size:2', Rule::in(array_column(States::options(), 'code'))],
            'city' => ['required', 'string', 'min:2', 'max:80'],
            'slug' => ['required', 'string', 'max:32'],
            'point' => ['required', 'string', 'max:64'],
            'instagram' => ['required', 'string', 'max:120'],
            'tiktok' => ['nullable', 'string', 'max:120'],
            'petitionUrl' => ['nullable', 'url:https', 'max:300'],
            'primaryColour' => ['nullable', 'string', 'max:9'],
            'secondaryColour' => ['nullable', 'string', 'max:9'],
            'officials' => ['nullable', 'array', 'max:6'],
            'officials.*.name' => ['nullable', 'string', 'max:120'],
            'officials.*.title' => ['nullable', 'string', 'max:140'],
            'officials.*.email' => ['nullable', 'string', 'max:180'],
            'officials.*.url' => ['nullable', 'string', 'max:300'],
            'officials.*.role' => ['nullable', 'string', 'max:40'],
        ]);

        try {
            $ticket = VerificationTicket::fromToken($validated['ticket']);
        } catch (RuntimeException $e) {
            return redirect()->route('home')->withErrors(['email' => $e->getMessage()]);
        }

        try {
            $slug = Slug::fromString($validated['slug']);
            $point = CampusPoint::parse($validated['point']);
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['slug' => $e->getMessage()])->withInput();
        }

        try {
            $officials = OfficialInput::sanitiseAll($validated['officials'] ?? []);
            $instagram = SocialHandle::normalise($validated['instagram'] ?? null, 'instagram');
            $tiktok = SocialHandle::normalise($validated['tiktok'] ?? null, 'tiktok');
            $colours = SchoolColours::fromInput(
                $validated['primaryColour'] ?? null,
                $validated['secondaryColour'] ?? null,
            );
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['officials' => $e->getMessage()])->withInput();
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
                'point' => 'Too many builds from this address in the last hour. '
                    .'OpenStreetMap is a free service and we query it politely.',
            ])->withInput();
        }

        RateLimiter::hit($key, 3600);

        try {
            $survey = $this->surveys->build($point, $validated['state']);
        } catch (RuntimeException|InvalidArgumentException $e) {
            return back()->withErrors(['point' => $e->getMessage()])->withInput();
        }

        $now = now()->toIso8601String();

        // Shown once on the next screen and never again. Only the hash is kept,
        // so nobody here can read it back out — not from the file, not from a
        // backup, and not for a creator who asks.
        $editKey = EditKey::generate();

        $this->chapters->save(new Chapter(
            slug: $slug->value,
            schoolName: $validated['schoolName'],
            shortName: $validated['shortName'],
            state: strtoupper($validated['state']),
            city: $validated['city'],
            ownerDomain: $ticket->domain->registrable,
            ownerRecord: Ownership::record($ticket->email),
            survey: $survey,
            instagram: $instagram,
            tiktok: $tiktok,
            petitionUrl: $validated['petitionUrl'] ?? null,
            officials: $officials,
            editKeyHash: EditKey::hash($editKey),
            colours: $colours,
            createdAt: $now,
            updatedAt: $now,
        ));

        // Flashed, so the key survives exactly one redirect and never lands in
        // a URL, a log line, or the browser's history.
        return redirect()->route('chapters.welcome', $slug->value)
            ->with('editKey', $editKey);
    }
}
