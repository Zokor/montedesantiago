<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Http\Resources\PageResource;
use App\Models\Component;
use App\Models\Page;
use App\Models\PageComponent;
use App\Services\ComponentBuilderService;
use App\Services\SlugService;
use App\Services\VersioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PageController extends Controller
{
    public function __construct(
        private readonly SlugService $slugService,
        private readonly ComponentBuilderService $componentBuilder,
        private readonly VersioningService $versioningService,
    ) {}

    /**
     * Display a listing of pages with optional filters.
     */
    public function index(Request $request)
    {
        $search = $request->string('search')->trim();
        $status = $request->get('status');
        $perPage = (int) $request->integer('per_page', 15);
        $perPage = $perPage > 0 ? min($perPage, 100) : 15;

        $pages = Page::query()
            ->with(['creator:id,name', 'updater:id,name'])
            ->withCount('pageComponents')
            ->when($search->isNotEmpty(), function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['draft', 'published'], true), function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->orderByDesc('published_at')
            ->orderByDesc('updated_at')
            ->paginate($perPage)
            ->withQueryString();

        $payload = PageResource::collection($pages)
            ->response($request)
            ->getData(true);

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('pages/index', [
            'pages' => $payload,
            'filters' => [
                'search' => $search->toString(),
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store a newly created page.
     */
    public function store(StorePageRequest $request)
    {
        $data = $request->validated();
        $components = $data['components'] ?? [];
        unset($data['components']);

        $page = DB::transaction(function () use ($data, $components) {
            $attributes = $this->preparePageAttributes($data);

            if (! empty($attributes['is_homepage'])) {
                Page::query()->where('is_homepage', true)->update(['is_homepage' => false]);
            }

            $page = new Page($attributes);
            $page->created_by = Auth::id();
            $page->updated_by = Auth::id();
            $page->save();

            $this->syncComponents($page, $components);

            $fresh = $page->fresh([
                'pageComponents.component.fields',
                'versions',
                'creator',
                'updater',
            ]);

            $this->versioningService->createVersion($fresh, 'Initial version', Auth::id());

            return $fresh->load('pageComponents.component.fields');
        });

        return (new PageResource($page))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display a specific page including components and versions.
     */
    public function show(Page $page)
    {
        $page->load([
            'pageComponents.component.fields',
            'versions.author',
            'creator',
            'updater',
        ]);

        return new PageResource($page);
    }

    /**
     * Update a page.
     */
    public function update(UpdatePageRequest $request, Page $page)
    {
        $data = $request->validated();
        $components = array_key_exists('components', $data) ? ($data['components'] ?? []) : null;
        unset($data['components']);

        $page = DB::transaction(function () use ($page, $data, $components) {
            $attributes = $this->preparePageAttributes($data, $page);

            if (! empty($attributes['is_homepage'])) {
                Page::query()
                    ->where('id', '!=', $page->getKey())
                    ->where('is_homepage', true)
                    ->update(['is_homepage' => false]);
            }

            $page->fill($attributes);
            $page->updated_by = Auth::id();
            $page->save();

            if (is_array($components)) {
                $this->syncComponents($page, $components);
            }

            $fresh = $page->fresh([
                'pageComponents.component.fields',
                'versions',
                'creator',
                'updater',
            ]);

            $this->versioningService->createVersion($fresh, 'Updated content', Auth::id());

            return $fresh;
        });

        return new PageResource($page);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page): JsonResponse
    {
        $page->delete();

        return response()->json([
            'message' => 'Page deleted successfully.',
        ]);
    }

    /**
     * Prepare slug/published attributes.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function preparePageAttributes(array $data, ?Page $page = null): array
    {
        if (empty($data['slug'] ?? null) && ! empty($data['title'])) {
            $data['slug'] = $this->slugService->generate(
                $data['title'],
                Page::class,
                $page?->getKey()
            );
        }

        if (($data['status'] ?? 'draft') === 'published') {
            $data['published_at'] = $data['published_at'] ?? now();
        } else {
            $data['published_at'] = null;
        }

        return $data;
    }

    /**
     * Persist component assignments.
     *
     * @param  array<int, array<string, mixed>>  $components
     */
    private function syncComponents(Page $page, array $components): void
    {
        PageComponent::where('page_id', $page->getKey())->delete();

        foreach ($components as $index => $payload) {
            $component = Component::with('fields')->findOrFail($payload['component_id']);
            $data = $payload['data'] ?? [];
            $validated = $this->componentBuilder->validateComponentData($component, $data);

            PageComponent::create([
                'page_id' => $page->getKey(),
                'component_id' => $component->getKey(),
                'data' => $validated,
                'order' => $payload['order'] ?? $index,
            ]);
        }
    }
}
