<?php

namespace App\Services;

use App\Enums\DataType;
use App\Models\Collection;
use App\Models\CollectionField;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class CollectionBuilderService
{
    public function __construct(
        private readonly SlugService $slugService,
    ) {}

    /**
     * Create a collection and its fields.
     *
     * @param  array<string, mixed>  $payload
     */
    public function buildCollection(array $payload): Collection
    {
        $fields = $payload['fields'] ?? [];
        unset($payload['fields']);

        return DB::transaction(function () use ($payload, $fields): Collection {
            $collection = $this->storeCollection(new Collection, $payload);
            $this->syncFields($collection, $fields);

            return $collection->load('fields');
        });
    }

    /**
     * Update an existing collection definition.
     *
     * @param  array<string, mixed>  $payload
     */
    public function updateCollection(Collection $collection, array $payload): Collection
    {
        $fields = $payload['fields'] ?? [];
        unset($payload['fields']);

        return DB::transaction(function () use ($collection, $payload, $fields): Collection {
            $collection = $this->storeCollection($collection, $payload);
            $collection->fields()->delete();
            $this->syncFields($collection, $fields);

            return $collection->load('fields');
        });
    }

    /**
     * Persist collection attributes.
     *
     * @param  array<string, mixed>  $payload
     */
    private function storeCollection(Collection $collection, array $payload): Collection
    {
        $data = Arr::only($payload, [
            'name',
            'slug',
            'description',
            'is_active',
        ]);

        $slug = $data['slug'] ?? null;

        if ($slug) {
            if (! $this->slugService->validate($slug)) {
                throw new InvalidArgumentException('The provided slug contains invalid characters.');
            }

            $data['slug'] = $this->slugService->generate(
                $slug,
                Collection::class,
                $collection->exists ? $collection->getKey() : null
            );
        } elseif (! empty($data['name'])) {
            $data['slug'] = $this->slugService->generate(
                $data['name'],
                Collection::class,
                $collection->exists ? $collection->getKey() : null
            );
        }

        $collection->fill($data);
        $collection->save();

        return $collection;
    }

    /**
     * Persist collection field definitions.
     *
     * @param  array<int, array<string, mixed>>  $fields
     */
    private function syncFields(Collection $collection, array $fields): void
    {
        $usedSlugs = [];

        foreach ($fields as $index => $fieldPayload) {
            $payload = $this->prepareFieldPayload($collection, $fieldPayload, (int) $index, $usedSlugs);
            CollectionField::create($payload);
        }
    }

    /**
     * Normalise field payload.
     *
     * @param  array<int, string>  $usedSlugs
     * @return array<string, mixed>
     */
    private function prepareFieldPayload(Collection $collection, array $fieldPayload, int $index, array &$usedSlugs): array
    {
        $name = Arr::get($fieldPayload, 'name');
        if (! $name) {
            throw new InvalidArgumentException('Field name is required.');
        }

        $slug = Arr::get($fieldPayload, 'slug') ?: Str::slug($name);
        if ($slug === '') {
            throw new InvalidArgumentException('Unable to derive a slug for field "'.$name.'".');
        }

        $slug = $this->ensureUniqueFieldSlug($slug, $usedSlugs);

        $dataType = Arr::get($fieldPayload, 'data_type');
        if (! $dataType) {
            throw new InvalidArgumentException(sprintf('Field "%s" requires a data_type.', $name));
        }

        $dataType = $dataType instanceof DataType ? $dataType : DataType::from((string) $dataType);

        $config = Arr::get($fieldPayload, 'config', []);
        if (! is_array($config)) {
            throw new InvalidArgumentException(sprintf('Field "%s" config must be an array.', $name));
        }

        return [
            'collection_id' => $collection->getKey(),
            'name' => $name,
            'slug' => $slug,
            'data_type' => $dataType,
            'config' => $config,
            'is_required' => (bool) Arr::get($fieldPayload, 'is_required', false),
            'default_value' => Arr::get($fieldPayload, 'default_value'),
            'help_text' => Arr::get($fieldPayload, 'help_text'),
            'order' => Arr::get($fieldPayload, 'order', $index),
        ];
    }

    /**
     * Guarantee uniqueness per collection.
     *
     * @param  array<int, string>  $usedSlugs
     */
    private function ensureUniqueFieldSlug(string $slug, array &$usedSlugs): string
    {
        $base = $slug;
        $suffix = 1;

        while (in_array($slug, $usedSlugs, true)) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        $usedSlugs[] = $slug;

        return $slug;
    }
}
