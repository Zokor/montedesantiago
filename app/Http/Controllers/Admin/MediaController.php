<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /**
     * Display a listing of stored media.
     */
    public function index(Request $request)
    {
        $search = $request->string('search')->trim();
        $folder = $request->get('folder');
        $mime = $request->get('mime');
        $perPage = (int) $request->integer('per_page', 24);
        $perPage = $perPage > 0 ? min($perPage, 100) : 24;

        $media = Media::query()
            ->with('uploader:id,name,email')
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

    /**
     * Store a newly uploaded file.
     */
    public function store(StoreMediaRequest $request)
    {
        $file = $request->file('file');
        \assert($file instanceof UploadedFile);

        $disk = $request->string('disk')->toString() ?: config('filesystems.default', 'public');
        $folder = $request->string('folder')->trim('/') ?: 'media';

        $path = $file->store($folder, ['disk' => $disk]);
        $metadata = $this->buildMetadata($file);

        $media = Media::create([
            'filename' => basename($path),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?? $file->guessExtension() ?? 'application/octet-stream',
            'disk' => $disk,
            'path' => $path,
            'thumbnail_path' => null,
            'size' => (int) $file->getSize(),
            'metadata' => $metadata,
            'folder' => '/'.trim($folder, '/'),
            'uploaded_by' => Auth::id(),
        ]);

        return (new MediaResource($media->fresh('uploader')))->response()->setStatusCode(201);
    }

    /**
     * Display a specific media item.
     */
    public function show(Media $media)
    {
        $media->load('uploader');

        return new MediaResource($media);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Media $media): JsonResponse
    {
        if ($media->path) {
            Storage::disk($media->disk)->delete($media->path);
        }

        if ($media->thumbnail_path) {
            Storage::disk($media->disk)->delete($media->thumbnail_path);
        }

        $media->delete();

        return response()->json([
            'message' => 'Media deleted successfully.',
        ]);
    }

    /**
     * Build metadata for uploaded file.
     *
     * @return array<string, mixed>
     */
    private function buildMetadata(UploadedFile $file): array
    {
        if (! str_starts_with((string) $file->getMimeType(), 'image/')) {
            return [];
        }

        try {
            [$width, $height] = getimagesize($file->getPathname()) ?: [null, null];
        } catch (\Throwable $e) {
            $width = $height = null;
        }

        return array_filter([
            'width' => $width,
            'height' => $height,
        ], static fn ($value) => $value !== null);
    }
}
