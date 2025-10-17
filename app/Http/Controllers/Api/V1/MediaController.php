<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 24);
        $perPage = $perPage > 0 ? min($perPage, 100) : 24;

        $search = $request->string('search')->trim();
        $folder = $request->get('folder');
        $type = $request->get('type');
        $tag = $request->get('tag');

        $media = Media::query()
            ->when($search->isNotEmpty(), function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('original_name', 'like', "%{$search}%")
                        ->orWhere('filename', 'like', "%{$search}%");
                });
            })
            ->when($folder, fn ($query) => $query->where('folder', $folder))
            ->when($type, fn ($query) => $query->where('type', 'like', "{$type}%"))
            ->when($tag, fn ($query) => $query->whereJsonContains('tags', $tag))
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return MediaResource::collection($media);
    }

    public function show(Media $media)
    {
        return new MediaResource($media);
    }
}
