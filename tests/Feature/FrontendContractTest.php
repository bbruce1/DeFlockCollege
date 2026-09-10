<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Chapters\CampusPoint;
use App\Chapters\Chapter;
use App\Chapters\ChapterRepository;
use App\Chapters\EditKey;
use App\Chapters\EditPass;
use App\Chapters\Ownership;
use App\Chapters\ReaderSurvey;
use App\Chapters\Slug;
use App\Chapters\VerificationTicket;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * The seam between the React pages and the routes behind them.
 *
 * Nothing here checks behaviour. It checks that the two halves still describe
 * the same application: that every URL a page asks for is registered under the
 * verb it uses, that every page a controller names exists, and that every page
 * is handed the props it destructures. Each of those has failed silently before
 * — a missing route answered by the chapter catch-all looks like an empty step,
 * and a missing prop is an undefined that renders as nothing.
 */
final class FrontendContractTest extends TestCase
{
    private const SLUG = 'contracttest';

    private const OWNER = 'owner@contract.edu';

    /**
     * Every URL the frontend requests, with the verb it requests it under.
     *
     * Taken from resources/js by hand. A new fetch or form.post belongs here.
     */
    private const FRONTEND_CALLS = [
        ['POST', '/verify'],                          // Pages/Home.tsx
        ['POST', '/places'],                          // Pages/Chapters/Create.tsx
        ['POST', '/districts'],                       // Pages/Chapters/Create.tsx
        ['POST', '/chapters'],                        // Pages/Chapters/Create.tsx
        ['POST', '/admin'],                           // Pages/Admin/Locked.tsx
        ['POST', '/admin/lock'],                      // Pages/Admin/Dashboard.tsx
        ['POST', '/'.self::SLUG.'/email'],            // Chapter/useLetter.ts
        ['POST', '/'.self::SLUG.'/unlock'],           // Pages/Chapters/Unlock.tsx
        ['POST', '/'.self::SLUG.'/recover-key'],      // Pages/Chapters/Unlock.tsx
        ['POST', '/'.self::SLUG.'/acknowledge'],      // Pages/Chapters/Welcome.tsx
        ['PATCH', '/'.self::SLUG],                    // Pages/Chapters/Edit.tsx
        ['GET', '/coverage/GA'],                      // Chapter/CoverageField.tsx
        ['GET', '/coverage/us'],                      // Pages/Home.tsx
    ];

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedChapter();
    }

    /**
     * Every path the application answers is a name a chapter must not claim.
     *
     * Remembering to add each new route to the reserved list by hand has failed
     * twice: /up once shadowed a chapter, and /contact was added without it.
     * Deriving the check from the router means the next one cannot be forgotten.
     */
    public function test_every_top_level_route_is_a_reserved_slug(): void
    {
        $unreserved = [];

        foreach (Route::getRoutes() as $route) {
            $first = explode('/', trim($route->uri(), '/'))[0];

            // The chapter catch-all itself, and anything below a parameter.
            if ($first === '' || str_starts_with($first, '{')) {
                continue;
            }

            if (Slug::isValid($first)) {
                $unreserved[$first] = true;
            }
        }

        $this->assertSame(
            [],
            array_keys($unreserved),
            'These paths can be claimed as chapter slugs and would shadow a real route.'
        );
    }

    /**
     * The 405 this catches is the nastiest failure in the application: an
     * unregistered POST falls through to the chapter catch-all, which answers
     * GET only, so the browser sees a method error and the page shows nothing.
     */
    public function test_every_url_the_frontend_calls_is_registered_under_that_verb(): void
    {
        foreach (self::FRONTEND_CALLS as [$verb, $uri]) {
            $matched = $this->routeFor($verb, $uri);

            $this->assertNotNull(
                $matched,
                "The frontend calls {$verb} {$uri} but no route answers that verb at that path."
            );
        }
    }

    public function test_every_route_target_resolves_to_a_real_controller_method(): void
    {
        foreach (Route::getRoutes() as $route) {
            $action = $route->getActionName();

            if ($action === 'Closure') {
                continue;
            }

            [$class, $method] = array_pad(explode('@', $action, 2), 2, '__invoke');

            $this->assertTrue(class_exists($class), "Route {$route->uri()} targets missing class {$class}.");
            $this->assertTrue(
                method_exists($class, $method),
                "Route {$route->uri()} targets {$class}::{$method}(), which does not exist."
            );
        }
    }

    public function test_every_controller_can_be_built_by_the_container(): void
    {
        foreach (Route::getRoutes() as $route) {
            $action = $route->getActionName();

            if ($action === 'Closure' || ! str_starts_with($action, 'App\\')) {
                continue;
            }

            $class = explode('@', $action)[0];

            // A dependency that was never bound, or never injected, throws here
            // rather than on the first request that happens to reach the route.
            $this->assertNotNull(app($class), "{$class} could not be resolved.");
        }
    }

    /**
     * @param  list<string>  $expected  the props the page destructures
     */
    #[\PHPUnit\Framework\Attributes\DataProvider('pageContracts')]
    public function test_a_page_is_handed_every_prop_it_destructures(
        string $uri,
        string $component,
        array $expected,
    ): void {
        $response = $this->get($uri);

        $response->assertOk();

        $page = $response->viewData('page');

        $this->assertSame($component, $page['component']);
        $this->assertFileExists(
            resource_path('js/Pages/'.$component.'.tsx'),
            "Controller renders \"{$component}\" but no such page component exists."
        );

        foreach ($expected as $prop) {
            $this->assertArrayHasKey(
                $prop,
                $page['props'],
                "{$component}.tsx destructures \"{$prop}\" but {$uri} does not send it."
            );
        }
    }

    /** @return array<string, array{string, string, list<string>}> */
    public static function pageContracts(): array
    {
        return [
            'home' => ['/', 'Home', ['chapters', 'liveCount', 'coverage']],
            'chapter index' => ['/chapters', 'Chapters/Index', ['chapters']],
            'chapter page' => ['/'.self::SLUG, 'Chapters/Show', [
                'chapter', 'stateName', 'officials', 'canonical', 'coverage',
            ]],
            'unlock' => ['/'.self::SLUG.'/edit', 'Chapters/Unlock', ['chapter']],
            'admin locked' => ['/admin', 'Admin/Locked', ['retryIn']],
            'about' => ['/about', 'Legal/About', []],
            'contact' => ['/contact', 'Legal/Contact', ['email']],
            'terms' => ['/terms', 'Legal/Terms', ['updated', 'contact', 'operator', 'jurisdiction']],
            'privacy' => ['/privacy', 'Legal/Privacy', ['updated', 'contact', 'operator']],
        ];
    }

    public function test_the_create_page_is_handed_every_prop_it_destructures(): void
    {
        $ticket = VerificationTicket::issue('student@contract-new.edu')->toToken();

        $response = $this->get('/start?ticket='.urlencode($ticket));
        $response->assertOk();

        $page = $response->viewData('page');
        $this->assertSame('Chapters/Create', $page['component']);

        foreach ([
            'ticket', 'domain', 'minutesRemaining', 'known',
            'suggestedSlug', 'existing', 'states', 'apex',
        ] as $prop) {
            $this->assertArrayHasKey($prop, $page['props'], "Create.tsx destructures \"{$prop}\".");
        }
    }

    public function test_the_welcome_page_is_handed_every_prop_it_destructures(): void
    {
        $response = $this->withSession(['editKey' => 'ABCDE-FGHJK-LMNPQ-RSTUV'])
            ->get('/'.self::SLUG.'/welcome');

        $response->assertOk();

        $page = $response->viewData('page');
        $this->assertSame('Chapters/Welcome', $page['component']);
        $this->assertArrayHasKey('chapter', $page['props']);
        $this->assertArrayHasKey('editKey', $page['props']);
    }

    /**
     * The editor offers a role selector for each office, and it is populated
     * from the server. Without this prop the selector renders empty and every
     * official saves under whatever the row happened to default to.
     */
    public function test_the_editor_is_handed_the_role_options_its_selector_renders(): void
    {
        $response = $this->get('/'.self::SLUG.'/edit?pass='.EditPass::issue(self::SLUG)->toToken());

        $response->assertOk();

        $page = $response->viewData('page');

        $this->assertSame('Chapters/Edit', $page['component']);
        $this->assertNotEmpty($page['props']['roles'] ?? []);
    }

    private function routeFor(string $verb, string $uri): ?string
    {
        foreach (Route::getRoutes() as $route) {
            if (! in_array($verb, $route->methods(), true)) {
                continue;
            }

            $pattern = '#^'.preg_replace('#\\\{[a-zA-Z_]+\\\}#', '[^/]+', preg_quote($route->uri(), '#')).'$#';

            if (preg_match($pattern, ltrim($uri, '/')) === 1) {
                return $route->getActionName();
            }
        }

        return null;
    }

    private function seedChapter(): void
    {
        app(ChapterRepository::class)->save(new Chapter(
            slug: self::SLUG,
            schoolName: 'Contract State University',
            shortName: 'Contract',
            state: 'GA',
            city: 'Atlanta',
            ownerDomain: 'contract.edu',
            ownerRecord: Ownership::record(self::OWNER),
            survey: new ReaderSurvey(new CampusPoint(33.77, -84.39), 5, 2, 9846, '2026-09-09'),
            instagram: 'deflock.contract',
            editKeyHash: EditKey::hash('ABCDE-FGHJK-LMNPQ-RSTUV'),
            createdAt: '2026-09-09T00:00:00+00:00',
            updatedAt: '2026-09-09T00:00:00+00:00',
        ));
    }
}
