<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\ChapterRepository;
use App\Chapters\States;
use App\Chapters\Sections\SectionLibrary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/** A chapter's public page. */
final class ChapterController extends Controller
{
    public function __construct(
        private readonly ChapterRepository $chapters,
        private readonly SectionLibrary $sections,
    ) {}

    public function show(Request $request, string $slug): Response
    {
        $chapter = $this->chapters->findBySlugString($slug);

        if ($chapter === null) {
            // Unknown slugs 404 rather than falling through to the home page.
            throw new NotFoundHttpException("No chapter exists at \"{$slug}\".");
        }

        return Inertia::render('Chapters/Show', [
            'chapter' => $chapter->toPublicArray(),
            'sections' => $this->sections->for($chapter),
            // Derived here rather than in the browser, so the value is correct in
            // the payload before any script runs.
            'coverage' => round($chapter->map->horizonCoverage(), 4),
            'stateName' => States::name($chapter->state),
        ]);
    }

    public function index(): Response
    {
        $chapters = array_map(
            static fn ($chapter) => $chapter->toPublicArray(),
            $this->chapters->all(),
        );

        return Inertia::render('Chapters/Index', ['chapters' => $chapters]);
    }
}
