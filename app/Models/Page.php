<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Page extends Model
{
    /** @use HasFactory<\Database\Factories\PageFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'slug',
        'is_homepage',
        'status',
        'published_at',
        'created_by',
        'updated_by',
    ];

    public function casts(): array
    {
        return [
            'is_homepage' => 'boolean',
            'published_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Scope: published pages.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope: the homepage record.
     */
    public function scopeHomepage(Builder $query): Builder
    {
        return $query->where('is_homepage', true);
    }

    /**
     * Linked components via the pivot table.
     */
    public function components(): BelongsToMany
    {
        return $this->belongsToMany(Component::class, 'page_components')
            ->using(PageComponent::class)
            ->withPivot(['data', 'order'])
            ->withTimestamps()
            ->orderByPivot('order');
    }

    /**
     * Direct access to pivot records.
     */
    public function pageComponents(): HasMany
    {
        return $this->hasMany(PageComponent::class);
    }

    /**
     * Historic page versions.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(PageVersion::class);
    }

    /**
     * Author relationship.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Last editor relationship.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
