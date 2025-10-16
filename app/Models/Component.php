<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Component extends Model
{
    /** @use HasFactory<\Database\Factories\ComponentFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    public function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Scope: only active components.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Field definitions linked to the component.
     */
    public function fields(): HasMany
    {
        return $this->hasMany(ComponentField::class);
    }

    /**
     * Pages using this component.
     */
    public function pages(): BelongsToMany
    {
        return $this->belongsToMany(Page::class, 'page_components')
            ->using(PageComponent::class)
            ->withPivot(['data', 'order'])
            ->withTimestamps()
            ->orderByPivot('order');
    }

    /**
     * Pivot records representing usage across pages.
     */
    public function pageComponents(): HasMany
    {
        return $this->hasMany(PageComponent::class);
    }
}
