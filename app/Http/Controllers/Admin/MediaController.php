<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReplaceMediaRequest;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Http\Requests\Admin\UpdateMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Services\MediaStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaStorageService $storage,
    ) {}

    /**
     * Display a listing of stored media.
     */
    public function index(Request $request)
    {
        $search = $request->string('search')->trim();
        $folder = $request->string('folder')->trim()->toString() ?: null;
        $type = $request->string('type')->trim()->toString() ?: null;
        $tag = $request->string('tag')->trim()->toString() ?: null;
        $from = $request->date('from');
        $to = $request->date('to');
        $sizeMin = $request->integer('size_min');
        $sizeMax = $request->integer('size_max');
        $context = $request->string('context_tag')->trim()->toString() ?: null;
        $perPage = (int) $request->integer('per_page', 24);
        $perPage = $perPage > 0 ? min($perPage, 100) : 24;
        $sort = $request->string('sort')->trim()->toString() ?: 'created_at';
        $direction = $request->string('direction')->trim()->lower() === 'asc' ? 'asc' : 'desc';

        $media = Media::query()
            ->with('uploader:id,name,email')
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
            ->when($context, fn ($query) => $query->whereJsonContains('tags', $context))
            ->when($from, fn ($query) => $query->whereDate('created_at', '>=', $from))
            ->when($to, fn ($query) => $query->whereDate('created_at', '<=', $to))
            ->when($sizeMin, fn ($query) => $query->where('size', '>=', (int) $sizeMin))
            ->when($sizeMax, fn ($query) => $query->where('size', '<=', (int) $sizeMax))
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        $payload = MediaResource::collection($media)
            ->response($request)
            ->getData(true);

        $folders = Media::query()
            ->select('folder')
            ->distinct()
            ->pluck('folder')
            ->filter()
            ->sort()
            ->values()
            ->all();

        $tags = Media::query()
            ->select('tags')
            ->whereNotNull('tags')
            ->pluck('tags')
            ->flatMap(function ($value) {
                if (is_string($value)) {
                    $decoded = json_decode($value, true);

                    return is_array($decoded) ? $decoded : [];
                }

                if (is_array($value)) {
                    return $value;
                }

                return [];
            })
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->all();

        if ($request->wantsJson()) {
            return response()->json([
                'media' => $payload,
                'folders' => $folders,
                'tags' => $tags,
            ]);
        }

        return Inertia::render('media/index', [
            'media' => $payload,
            'filters' => [
                'search' => $search->toString(),
                'folder' => $folder,
                'type' => $type,
                'tag' => $tag,
                'from' => $from?->toDateString(),
                'to' => $to?->toDateString(),
                'size_min' => $sizeMin,
                'size_max' => $sizeMax,
                'sort' => $sort,
                'direction' => $direction,
                'context_tag' => $context,
            ],
            'folders' => $folders,
            'tags' => $tags,
            'showPagination' => $media->total() > $media->perPage(),
        ]);
    }

    /**
     * Store a newly uploaded file.
     */
    public function store(StoreMediaRequest $request)
    {
        $files = $request->validated()['files'];
        $folderInput = $request->string('folder')->trim('/')->toString();
        $folder = $folderInput === '' ? '/' : $folderInput;
        $tags = collect($request->validated()['tags'] ?? [])->map(fn ($tag) => Str::lower($tag))->unique()->values()->all();
        $disk = $request->validated()['disk'] ?? null;

        $stored = collect();

        foreach ($files as $file) {
            $result = $this->storage->upload($file, $folder, [
                'disk' => $disk,
                'tags' => $tags,
            ]);

            $media = Media::create([
                'filename' => $result->filename,
                'original_name' => $result->originalName,
                'type' => $result->mimeType,
                'disk' => $result->disk,
                'path' => $result->path,
                'url' => $result->url,
                'thumbnail_path' => $result->thumbnailPath,
                'size' => $result->size,
                'metadata' => $result->metadata,
                'folder' => $result->folder,
                'tags' => $tags,
                'width' => $result->width,
                'height' => $result->height,
                'uploaded_by' => Auth::id(),
            ]);

            $stored->push($media->fresh('uploader'));
        }

        $resource = MediaResource::collection($stored);

        if ($request->wantsJson()) {
            return $resource->response()->setStatusCode(201);
        }

        return redirect()->back()->with('uploaded', $stored->count());
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
     * Update a media item (rename, retag, move folders).
     */
    public function update(UpdateMediaRequest $request, Media $media): MediaResource
    {
        $payload = $request->validated();
        $newFolderValue = $payload['folder'] ?? $media->folder;
        $newFolder = $this->normalizeFolderValue($newFolderValue, $media->folder);
        $newName = $payload['original_name'] ?? $media->original_name;
        $tags = collect($payload['tags'] ?? [])
            ->map(fn ($tag) => Str::lower($tag))
            ->unique()
            ->values()
            ->all();

        if ($newFolder !== $media->folder) {
            $this->storage->move($media, $newFolder);
        }

        if ($newName !== $media->original_name) {
            $this->storage->rename($media, $newName);
        }

        $payload = [
            'filename' => $media->filename,
            'original_name' => $newName,
            'folder' => $media->folder,
            'path' => $media->path,
            'url' => $media->url,
            'thumbnail_path' => $media->thumbnail_path,
            'tags' => $tags,
        ];

        $mediaId = $media->getKey();

        Media::query()->whereKey($mediaId)->update($payload);

        $fresh = Media::query()->with('uploader')->findOrFail($mediaId);

        return new MediaResource($fresh);
    }

    /**
     * Replace the file backing a media item.
     */
    public function replace(ReplaceMediaRequest $request, Media $media): MediaResource
    {
        $originalName = $request->string('original_name')->trim()->toString() ?: $media->original_name;

        $result = $this->storage->replace($media, $request->file('file'), [
            'original_name' => $originalName,
        ]);

        $media->fill([
            'filename' => $result->filename,
            'original_name' => $result->originalName,
            'type' => $result->mimeType,
            'path' => $result->path,
            'url' => $result->url,
            'thumbnail_path' => $result->thumbnailPath,
            'size' => $result->size,
            'metadata' => $result->metadata,
            'width' => $result->width,
            'height' => $result->height,
        ]);

        $media->save();

        return new MediaResource($media->fresh('uploader'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Media $media): JsonResponse
    {
        $this->storage->delete($media);

        return response()->json([
            'message' => 'Media deleted successfully.',
        ]);
    }

    private function normalizeFolderValue(mixed $folder, ?string $fallback = '/'): string
    {
        if (! is_string($folder)) {
            return $fallback ?? '/';
        }

        $folder = trim($folder);

        if ($folder === '' || $folder === '/') {
            return '/';
        }

        return '/'.ltrim($folder, '/');
    }
}
