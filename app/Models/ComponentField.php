<?php

namespace App\Models;

use App\Enums\DataType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComponentField extends Model
{
    /** @use HasFactory<\Database\Factories\ComponentFieldFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'component_id',
        'name',
        'slug',
        'data_type',
        'config',
        'is_required',
        'default_value',
        'help_text',
        'order',
    ];

    public function casts(): array
    {
        return [
            'data_type' => DataType::class,
            'config' => 'array',
            'is_required' => 'boolean',
            'order' => 'integer',
        ];
    }

    /**
     * Owning component.
     */
    public function component(): BelongsTo
    {
        return $this->belongsTo(Component::class);
    }
}
