<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class PageComponent extends Pivot
{
    /** @use HasFactory<\Database\Factories\PageComponentFactory> */
    use HasFactory;

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = true;

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = true;

    /**
     * The table associated with the pivot model.
     *
     * @var string
     */
    protected $table = 'page_components';

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'page_id',
        'component_id',
        'data',
        'order',
    ];

    public function casts(): array
    {
        return [
            'data' => 'array',
            'order' => 'integer',
        ];
    }

    /**
     * Owning page.
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Component referenced by the pivot.
     */
    public function component(): BelongsTo
    {
        return $this->belongsTo(Component::class);
    }
}
