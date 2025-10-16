<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Arr;

class CollectionItem extends Model
{
    /** @use HasFactory<\Database\Factories\CollectionItemFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'collection_id',
        'data',
        'is_published',
        'order',
    ];

    /**
     * Attribute casting configuration.
     */
    public function casts(): array
    {
        return [
            'data' => 'array',
            'is_published' => 'boolean',
            'order' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Scope: only published items.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Owning collection.
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * Retrieve a field value by slug.
     */
    public function getFieldValue(string $slug, mixed $default = null): mixed
    {
        return Arr::get($this->data ?? [], $slug, $default);
    }

    /**
     * Set a field value by slug.
     */
    public function setFieldValue(string $slug, mixed $value): void
    {
        $payload = $this->data ?? [];
        Arr::set($payload, $slug, $value);
        $this->data = $payload;
    }
}
