<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCollectionRequest;
use App\Http\Requests\Admin\UpdateCollectionRequest;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use App\Services\CollectionBuilderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollectionController extends Controller
{
    public function __construct(
        private readonly CollectionBuilderService $collectionBuilder,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->string('search')->trim();
        $status = $request->get('status');
        $sort = in_array($request->get('sort'), ['name', 'created_at'], true)
            ? $request->get('sort')
            : 'name';
        $direction = $request->get('direction') === 'desc' ? 'desc' : 'asc';

        $perPage = (int) $request->integer('per_page', 15);
        $perPage = $perPage > 0 ? min($perPage, 100) : 15;

        $collections = Collection::query()
            ->withCount(['fields', 'items'])
            ->when($search->isNotEmpty(), function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['active', 'inactive'], true), function ($query) use ($status) {
                $query->where('is_active', $status === 'active');
            })
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        $payload = CollectionResource::collection($collections)
            ->response($request)
            ->getData(true);

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('collections/index', [
            'collections' => $payload,
            'filters' => [
                'search' => $search->toString(),
                'status' => $status,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCollectionRequest $request)
    {
        $collection = $this->collectionBuilder->buildCollection($request->validated());

        return (new CollectionResource($collection))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Collection $collection)
    {
        $collection->load([
            'fields' => fn ($query) => $query->orderBy('order'),
        ])->loadCount('items');

        return new CollectionResource($collection);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCollectionRequest $request, Collection $collection)
    {
        $collection = $this->collectionBuilder->updateCollection($collection, $request->validated());

        return new CollectionResource($collection);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Collection $collection): JsonResponse
    {
        if ($collection->items()->exists()) {
            return response()->json([
                'message' => 'Cannot delete collection with existing items.',
            ], 422);
        }

        $collection->delete();

        return response()->json([
            'message' => 'Collection deleted successfully.',
        ]);
    }
}
