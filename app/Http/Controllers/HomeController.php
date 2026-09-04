<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\ChapterRepository;
use Inertia\Inertia;
use Inertia\Response;

final class HomeController extends Controller
{
    public function __construct(private readonly ChapterRepository $chapters) {}

    public function index(): Response
    {
        $chapters = array_map(
            static fn ($chapter) => [
                'slug' => $chapter->slug,
                'schoolName' => $chapter->schoolName,
                'shortName' => $chapter->shortName,
                'state' => $chapter->state,
                'status' => $chapter->status(),
                'readersWithinMile' => $chapter->map->readersWithinMile,
            ],
            $this->chapters->all(),
        );

        return Inertia::render('Home', [
            'chapters' => $chapters,
            'liveCount' => count(array_filter($chapters, fn ($c) => $c['status'] === 'live')),
        ]);
    }
}
