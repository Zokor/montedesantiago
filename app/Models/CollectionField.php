<?php

namespace App\Models;

use App\Enums\DataType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionField extends Model
{
    /** @use HasFactory<\Database\Factories\CollectionFieldFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'collection_id',
        'name',
        'slug',
        'data_type',
        'config',
        'is_required',
        'default_value',
        'help_text',
        'order',
    ];

    /**
     * Attribute casting configuration.
     */
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
     * Owning collection.
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }
}
