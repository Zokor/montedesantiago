<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    /** @use HasFactory<\Database\Factories\MediaFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'filename',
        'original_filename',
        'mime_type',
        'disk',
        'path',
        'thumbnail_path',
        'size',
        'metadata',
        'folder',
        'uploaded_by',
    ];

    public function casts(): array
    {
        return [
            'metadata' => 'array',
            'size' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * User who uploaded the file.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Public URL accessor.
     */
    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->path
                ? Storage::disk($this->disk)->url($this->path)
                : null,
        );
    }

    /**
     * Thumbnail URL accessor (may be null).
     */
    protected function thumbnailUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->thumbnail_path
                ? Storage::disk($this->disk)->url($this->thumbnail_path)
                : null,
        );
    }

    /**
     * Formatted file size (human readable).
     */
    protected function formattedSize(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->size !== null
                ? $this->formatBytes($this->size)
                : null,
        );
    }

    /**
     * Helper to format bytes.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = $bytes > 0 ? floor(log($bytes) / log(1024)) : 0;
        $pow = min($pow, count($units) - 1);
        $bytes /= 1024 ** $pow;

        return round($bytes, $precision).' '.$units[$pow];
    }
}
