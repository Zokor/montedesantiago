<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageVersion extends Model
{
    /** @use HasFactory<\Database\Factories\PageVersionFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'page_id',
        'content',
        'created_by',
        'change_summary',
    ];

    public function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    /**
     * Page associated with the version snapshot.
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Author who created the version.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
