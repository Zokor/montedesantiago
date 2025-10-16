<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 50) : 10;

        $pages = Page::published()
            ->with([
                'pageComponents.component.fields',
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('published_at')
            ->paginate($perPage)
            ->withQueryString();

        return PageResource::collection($pages);
    }

    public function show(Page $page)
    {
        abort_unless($page->status === 'published', 404);

        $page->load([
            'pageComponents.component.fields',
            'creator:id,name',
            'updater:id,name',
        ]);

        return new PageResource($page);
    }
}
