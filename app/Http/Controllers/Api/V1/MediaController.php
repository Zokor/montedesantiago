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
        $mime = $request->get('mime');

        $media = Media::query()
            ->when($search->isNotEmpty(), function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('original_filename', 'like', "%{$search}%")
                        ->orWhere('filename', 'like', "%{$search}%");
                });
            })
            ->when($folder, fn ($query) => $query->where('folder', $folder))
            ->when($mime, fn ($query) => $query->where('mime_type', 'like', "{$mime}%"))
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
