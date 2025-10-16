<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    /** @use HasFactory<\Database\Factories\SettingFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'group',
        'value',
        'is_locked',
    ];

    public $timestamps = true;

    public function casts(): array
    {
        return [
            'value' => 'array',
            'is_locked' => 'boolean',
        ];
    }

    /**
     * Scope: filter by group identifier.
     */
    public function scopeForGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }
}
