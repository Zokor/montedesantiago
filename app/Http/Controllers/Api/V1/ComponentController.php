<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComponentResource;
use App\Models\Component;
use Illuminate\Http\Request;

class ComponentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 50) : 10;

        $components = Component::active()
            ->with('fields')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return ComponentResource::collection($components);
    }

    public function show(Component $component)
    {
        abort_unless($component->is_active, 404);

        $component->load('fields');

        return new ComponentResource($component);
    }
}
