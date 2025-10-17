<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\PngEncoder;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

class MediaStorageService
{
    private ImageManager $images;

    private string $baseDirectory;

    private string $thumbnailDirectory;

    private const PROCESSABLE_IMAGE_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    public function __construct()
    {
        $this->images = new ImageManager(new Driver);

        $directories = config('media.directories', []);
        $this->baseDirectory = trim((string) ($directories['base'] ?? 'uploads'), '/');
        $this->thumbnailDirectory = trim((string) ($directories['thumbnails'] ?? 'uploads/thumbnails'), '/');
    }

    public function upload(UploadedFile $file, string $folder = '/', array $options = []): MediaStorageResult
    {
        $diskName = $this->resolveDisk($options['disk'] ?? null);
        $disk = Storage::disk($diskName);

        $normalizedFolder = $this->normalizeFolder($folder);
        $databaseFolder = $this->databaseFolder($normalizedFolder);
        $originalName = (string) ($options['original_name'] ?? $file->getClientOriginalName());

        $filename = $this->generateFilename($file, $originalName);
        $path = $this->buildPath($normalizedFolder, $filename);

        $this->ensureDirectory($disk, $this->buildDirectory($normalizedFolder));

        $mimeType = $file->getMimeType() ?? $file->guessExtension() ?? 'application/octet-stream';
        $metadata = [];
        $width = null;
        $height = null;
        $thumbnailPath = null;
        $size = (int) $file->getSize();

        $processed = false;

        if ($this->isProcessableImage($mimeType)) {
            try {
                [$contents, $thumbnailContents, $width, $height, $thumbnailPath] = $this->processImage(
                    $file,
                    $normalizedFolder,
                    $filename,
                    $mimeType
                );

                $disk->put($path, $contents, $this->visibilityOptions($diskName));
                $size = strlen($contents);
                $metadata = array_filter(['width' => $width, 'height' => $height]);

                if ($thumbnailContents !== null && $thumbnailPath !== null) {
                    $this->ensureDirectory($disk, Str::beforeLast($thumbnailPath, '/'));
                    $disk->put($thumbnailPath, $thumbnailContents, $this->visibilityOptions($diskName));
                }

                $processed = true;
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        if (! $processed) {
            $directory = $this->buildDirectory($normalizedFolder);
            $disk->putFileAs($directory, $file, $filename, $this->visibilityOptions($diskName));
            $path = trim($directory.'/'.$filename, '/');
        }

        $url = $disk->url($path);

        return new MediaStorageResult(
            disk: $diskName,
            path: $path,
            filename: $filename,
            originalName: $originalName,
            mimeType: $mimeType,
            size: $size,
            metadata: $metadata,
            folder: $databaseFolder,
            thumbnailPath: $thumbnailPath,
            url: $url,
            width: $width,
            height: $height,
        );
    }

    public function replace(Media $media, UploadedFile $file, array $options = []): MediaStorageResult
    {
        $this->deleteFiles($media);

        $folder = $media->folder ?? '/';

        $result = $this->upload($file, $folder, [
            'disk' => $media->disk,
            'original_name' => $options['original_name'] ?? $media->original_name,
        ]);

        return $result;
    }

    public function rename(Media $media, string $originalName): Media
    {
        $disk = Storage::disk($media->disk);
        $normalizedFolder = $this->normalizeFolder($media->folder ?? '/');

        $currentFilename = $media->filename ?: basename((string) $media->path);
        $extension = pathinfo($currentFilename, PATHINFO_EXTENSION);
        if ($extension === '') {
            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        }

        if ($extension === '') {
            $extension = $this->extensionFromMime($media->type ?? null) ?? null;
        }

        $sanitized = $this->sanitizeFilename($originalName, $extension ?: null);
        $newPath = $this->buildPath($normalizedFolder, $sanitized);

        if ($media->path && $media->path !== $newPath) {
            $this->ensureDirectory($disk, $this->buildDirectory($normalizedFolder));
            $disk->move($media->path, $newPath);

            if ($media->thumbnail_path) {
                $newThumb = $this->buildThumbnailPath($normalizedFolder, $sanitized);
                $this->ensureDirectory($disk, Str::beforeLast($newThumb, '/'));
                if ($disk->exists($media->thumbnail_path)) {
                    $disk->move($media->thumbnail_path, $newThumb);
                }
                $media->thumbnail_path = $newThumb;
            }

            $media->path = $newPath;
        }

        $media->filename = $sanitized;
        $media->original_name = $originalName;
        $media->url = $disk->url($media->path ?? $newPath);
        $media->folder = $this->databaseFolder($normalizedFolder);

        if (! $media->path) {
            $media->path = $newPath;
        }
        $media->exists = true;

        return $media;
    }

    public function move(Media $media, string $folder): Media
    {
        $normalizedFolder = $this->normalizeFolder($folder);
        $disk = Storage::disk($media->disk);
        $filename = $media->filename ?: basename((string) $media->path);

        if ($filename === '') {
            return $media;
        }

        $newPath = $this->buildPath($normalizedFolder, $filename);

        if (! $media->path) {
            $media->path = $newPath;
            $media->folder = $this->databaseFolder($normalizedFolder);
            $media->url = $disk->url($newPath);
            $media->save();

            return $media;
        }

        if ($newPath === $media->path) {
            $media->folder = $this->databaseFolder($normalizedFolder);

            return $media;
        }

        $this->ensureDirectory($disk, $this->buildDirectory($normalizedFolder));
        $disk->move($media->path, $newPath);

        if ($media->thumbnail_path) {
            $newThumb = $this->buildThumbnailPath($normalizedFolder, $media->filename);
            $this->ensureDirectory($disk, Str::beforeLast($newThumb, '/'));
            if ($disk->exists($media->thumbnail_path)) {
                $disk->move($media->thumbnail_path, $newThumb);
            }
            $media->thumbnail_path = $newThumb;
        }

        $media->path = $newPath;
        $media->folder = $this->databaseFolder($normalizedFolder);
        $media->url = $disk->url($newPath);
        $media->exists = true;

        return $media;
    }

    public function delete(Media $media): void
    {
        $this->deleteFiles($media);
        $media->delete();
    }

    private function deleteFiles(Media $media): void
    {
        $disk = Storage::disk($media->disk);
        if ($media->path && $disk->exists($media->path)) {
            $disk->delete($media->path);
        }

        if ($media->thumbnail_path && $disk->exists($media->thumbnail_path)) {
            $disk->delete($media->thumbnail_path);
        }
    }

    private function resolveDisk(?string $disk): string
    {
        if ($disk) {
            $map = config('media.disks', []);
            $candidate = $map[$disk] ?? $disk;
        } else {
            $storageOption = config('media.storage', 'local');
            $map = config('media.disks', []);
            $candidate = $map[$storageOption] ?? $storageOption;
        }

        try {
            Storage::disk($candidate);

            return $candidate;
        } catch (\InvalidArgumentException $exception) {
            report($exception);

            return config('filesystems.default', 'public');
        }
    }

    private function normalizeFolder(string $folder): string
    {
        $folder = trim($folder);

        if ($folder === '' || $folder === '/') {
            return '';
        }

        return trim($folder, '/');
    }

    private function databaseFolder(string $folder): string
    {
        return $folder === '' ? '/' : '/'.$folder;
    }

    private function buildPath(string $folder, string $filename): string
    {
        $directory = $this->buildDirectory($folder);

        return trim($directory.'/'.$filename, '/');
    }

    private function buildDirectory(string $folder): string
    {
        if ($this->baseDirectory === '') {
            return $folder;
        }

        return trim($this->baseDirectory.($folder !== '' ? '/'.$folder : ''), '/');
    }

    private function buildThumbnailPath(string $folder, string $filename): string
    {
        $basename = pathinfo($filename, PATHINFO_FILENAME);
        $thumbName = $basename.'-thumb.webp';
        $directory = $this->thumbnailDirectory === ''
            ? $folder
            : trim($this->thumbnailDirectory.($folder !== '' ? '/'.$folder : ''), '/');

        return trim($directory.'/'.$thumbName, '/');
    }

    /**
     * @return array{0:string,1:?string,2:?int,3:?int,4:?string}
     */
    private function processImage(UploadedFile $file, string $folder, string $filename, string $mimeType): array
    {
        $source = $this->images->read($file->getPathname());

        $config = config('media.image', []);

        $optimizedImage = clone $source;
        $optimizedImage->scaleDown(
            width: Arr::get($config, 'max_width', 3840),
            height: Arr::get($config, 'max_height', 3840),
        );

        $width = $optimizedImage->width();
        $height = $optimizedImage->height();

        $quality = Arr::get($config, 'quality', 82);
        $encoder = $this->encoderForMime($mimeType, $quality);
        $encoded = $optimizedImage->encode($encoder);
        $contents = (string) $encoded;

        $thumbnailImage = clone $source;
        $thumbnailImage->scaleDown(
            width: Arr::get($config, 'thumbnail_width', 480),
            height: Arr::get($config, 'thumbnail_height', 480),
        );

        $thumbnailEncoded = $thumbnailImage->encode(new WebpEncoder(quality: $quality));
        $thumbnailContents = (string) $thumbnailEncoded;
        $thumbnailPath = $this->buildThumbnailPath($folder, $filename);

        return [$contents, $thumbnailContents, $width, $height, $thumbnailPath];
    }

    private function encoderForMime(string $mimeType, int $quality): JpegEncoder|PngEncoder|WebpEncoder
    {
        return match (true) {
            str_contains($mimeType, 'png') => new PngEncoder,
            str_contains($mimeType, 'webp') => new WebpEncoder(quality: $quality),
            default => new JpegEncoder(quality: $quality),
        };
    }

    private function extensionFromMime(?string $mimeType): ?string
    {
        if (! $mimeType) {
            return null;
        }

        return match (true) {
            str_contains($mimeType, 'jpeg') || str_contains($mimeType, 'jpg') => 'jpg',
            str_contains($mimeType, 'png') => 'png',
            str_contains($mimeType, 'gif') => 'gif',
            str_contains($mimeType, 'webp') => 'webp',
            str_contains($mimeType, 'pdf') => 'pdf',
            str_contains($mimeType, 'svg') => 'svg',
            default => null,
        };
    }

    private function ensureDirectory(FilesystemAdapter $disk, string $directory): void
    {
        if ($directory === '') {
            return;
        }

        try {
            $disk->makeDirectory($directory);
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function generateFilename(UploadedFile $file, string $originalName): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'bin');

        $base = pathinfo($originalName, PATHINFO_FILENAME);
        $slug = Str::slug($base);

        if ($slug === '') {
            $slug = Str::uuid()->toString();
        }

        return $slug.'-'.Str::random(6).'.'.$extension;
    }

    private function sanitizeFilename(string $originalName, ?string $extension = null): string
    {
        $base = pathinfo($originalName, PATHINFO_FILENAME);
        $slug = Str::slug($base);

        if ($slug === '') {
            $slug = Str::uuid()->toString();
        }

        $extension = $extension ? trim($extension, '.') : null;
        $extension = $extension ?: 'bin';

        return $slug.'.'.$extension;
    }

    private function isProcessableImage(string $mimeType): bool
    {
        if (in_array(strtolower($mimeType), self::PROCESSABLE_IMAGE_MIME_TYPES, true)) {
            return true;
        }

        $extension = $this->extensionFromMime($mimeType);

        if (! $extension) {
            return false;
        }

        return in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true);
    }

    /**
     * @return array{visibility:?string}
     */
    private function visibilityOptions(string $disk): array
    {
        return ['visibility' => 'public'];
    }
}

final class MediaStorageResult
{
    public function __construct(
        public readonly string $disk,
        public readonly string $path,
        public readonly string $filename,
        public readonly string $originalName,
        public readonly string $mimeType,
        public readonly int $size,
        public readonly array $metadata,
        public readonly string $folder,
        public readonly ?string $thumbnailPath,
        public readonly string $url,
        public readonly ?int $width = null,
        public readonly ?int $height = null,
    ) {}
}
