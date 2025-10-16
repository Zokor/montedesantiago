<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreComponentRequest;
use App\Http\Requests\Admin\UpdateComponentRequest;
use App\Http\Resources\ComponentResource;
use App\Models\Component;
use App\Services\ComponentBuilderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComponentController extends Controller
{
    public function __construct(
        private readonly ComponentBuilderService $componentBuilder,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->string('search')->trim();
        $sort = $request->get('sort', 'name');
        $direction = $request->get('direction') === 'desc' ? 'desc' : 'asc';

        if (! in_array($sort, ['name', 'created_at'], true)) {
            $sort = 'name';
        }

        $perPage = (int) $request->integer('per_page', 15);
        $perPage = $perPage > 0 ? min($perPage, 100) : 15;

        $components = Component::query()
            ->withCount(['fields', 'pageComponents'])
            ->when($search->isNotEmpty(), function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        if ($request->header('X-Inertia')) {
            $payload = ComponentResource::collection($components)
                ->response($request)
                ->getData(true);

            return Inertia::render('components/index', [
                'components' => $payload,
                'filters' => [
                    'search' => $search->toString(),
                    'sort' => $sort,
                    'direction' => $direction,
                ],
            ]);
        }

        return ComponentResource::collection($components);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreComponentRequest $request)
    {
        $component = $this->componentBuilder->buildComponent($request->validated());

        return (new ComponentResource($component))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Component $component)
    {
        $component->load([
            'fields' => fn ($query) => $query->orderBy('order'),
        ])->loadCount('pageComponents');

        return new ComponentResource($component);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateComponentRequest $request, Component $component)
    {
        $component = $this->componentBuilder->updateComponent($component, $request->validated());

        return new ComponentResource($component);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Component $component)
    {
        if ($component->pageComponents()->exists()) {
            return response()->json([
                'message' => 'Cannot delete component that is currently used on a page.',
            ], 422);
        }

        $component->delete();

        return response()->json([
            'message' => 'Component deleted successfully.',
        ]);
    }

    /**
     * Duplicate an existing component along with its fields.
     */
    public function duplicate(Component $component): JsonResponse
    {
        $component->load('fields');

        $fields = $component->fields
            ->sortBy('order')
            ->map(fn ($field) => [
                'name' => $field->name,
                'slug' => null,
                'data_type' => $field->data_type,
                'config' => $field->config ?? [],
                'is_required' => $field->is_required,
                'default_value' => $field->default_value,
                'help_text' => $field->help_text,
                'order' => $field->order,
            ])
            ->values()
            ->all();

        $duplicate = $this->componentBuilder->buildComponent([
            'name' => $component->name.' (Copy)',
            'slug' => null,
            'description' => $component->description,
            'is_active' => $component->is_active,
            'fields' => $fields,
        ]);

        return (new ComponentResource($duplicate))
            ->response()
            ->setStatusCode(201);
    }
}
