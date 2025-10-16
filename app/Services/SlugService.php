<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SlugService
{
    /**
     * Generate a unique slug for the provided model class.
     *
     * @param  class-string<Model>  $modelClass
     */
    public function generate(string $text, string $modelClass, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($text);

        if ($baseSlug === '') {
            $baseSlug = Str::lower(Str::random(8));
        }

        $slug = $baseSlug;
        $counter = 1;

        /** @var \Illuminate\Database\Eloquent\Builder $query */
        $query = $modelClass::query();
        if ($excludeId !== null) {
            $query->whereKeyNot($excludeId);
        }

        while ((clone $query)->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Validate slug format.
     */
    public function validate(string $slug): bool
    {
        return (bool) preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug);
    }
}
