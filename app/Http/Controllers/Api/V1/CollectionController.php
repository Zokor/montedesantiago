<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 50) : 10;

        $collections = Collection::active()
            ->with(['fields', 'items' => fn ($query) => $query->published()->orderBy('order')])
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return CollectionResource::collection($collections);
    }

    public function show(Collection $collection)
    {
        abort_unless($collection->is_active, 404);

        $collection->load(['fields', 'items' => fn ($query) => $query->published()->orderBy('order')]);

        return new CollectionResource($collection);
    }
}
