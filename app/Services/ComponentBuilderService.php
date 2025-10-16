<?php

namespace App\Services;

use App\Enums\DataType;
use App\Models\Component;
use App\Models\ComponentField;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ComponentBuilderService
{
    public function __construct(
        private readonly SlugService $slugService,
    ) {}

    /**
     * Build a component and its fields inside a transaction.
     *
     * @param  array<string, mixed>  $payload
     */
    public function buildComponent(array $payload): Component
    {
        $fields = $payload['fields'] ?? [];
        unset($payload['fields']);

        return DB::transaction(function () use ($payload, $fields): Component {
            $component = $this->storeComponent(new Component, $payload);
            $this->syncFields($component, $fields);

            return $component->load('fields');
        });
    }

    /**
     * Update an existing component and replace its fields.
     *
     * @param  array<string, mixed>  $payload
     */
    public function updateComponent(Component $component, array $payload): Component
    {
        $fields = $payload['fields'] ?? [];
        unset($payload['fields']);

        return DB::transaction(function () use ($component, $payload, $fields): Component {
            $component = $this->storeComponent($component, $payload);
            $component->fields()->delete();
            $this->syncFields($component, $fields);

            return $component->load('fields');
        });
    }

    /**
     * Validate component data payload against its schema.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function validateComponentData(Component $component, array $payload): array
    {
        $component->loadMissing('fields');

        $rules = [];
        foreach ($component->fields as $field) {
            $rules[$field->slug] = $this->rulesForField($field);
        }

        return Validator::make($payload, $rules)->validate();
    }

    /**
     * Persist component attributes.
     *
     * @param  array<string, mixed>  $payload
     */
    private function storeComponent(Component $component, array $payload): Component
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
                Component::class,
                $component->exists ? $component->getKey() : null
            );
        } elseif (! empty($data['name'])) {
            $data['slug'] = $this->slugService->generate(
                $data['name'],
                Component::class,
                $component->exists ? $component->getKey() : null
            );
        }

        $component->fill($data);
        $component->save();

        return $component;
    }

    /**
     * Persist fields.
     *
     * @param  array<int, array<string, mixed>>  $fields
     */
    private function syncFields(Component $component, array $fields): void
    {
        $usedSlugs = [];

        foreach ($fields as $index => $fieldPayload) {
            $payload = $this->prepareFieldPayload($component, $fieldPayload, (int) $index, $usedSlugs);
            ComponentField::create($payload);
        }
    }

    /**
     * Prepare field payload.
     *
     * @param  array<string, mixed>  $fieldPayload
     * @param  array<int, string>  $usedSlugs
     * @return array<string, mixed>
     */
    private function prepareFieldPayload(Component $component, array $fieldPayload, int $index, array &$usedSlugs): array
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
            'component_id' => $component->getKey(),
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
     * Build validation rules for a single field.
     *
     * @return array<int, string>
     */
    private function rulesForField(ComponentField $field): array
    {
        $rules = $field->is_required ? ['required'] : ['nullable'];

        return array_merge($rules, $field->data_type->validationRules());
    }

    /**
     * Ensure field slug uniqueness within same component.
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
