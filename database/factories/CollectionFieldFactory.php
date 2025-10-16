<?php

namespace Database\Factories;

use App\Enums\DataType;
use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CollectionField>
 */
class CollectionFieldFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(2, true);
        $dataType = $this->faker->randomElement([
            DataType::SHORT_TEXT,
            DataType::TEXT,
            DataType::NUMBER,
            DataType::BOOLEAN,
            DataType::DATE,
        ]);

        return [
            'collection_id' => Collection::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'data_type' => $dataType,
            'config' => [],
            'is_required' => $this->faker->boolean(20),
            'default_value' => null,
            'help_text' => $this->faker->optional()->sentence(),
            'order' => $this->faker->unique()->numberBetween(1, 50),
        ];
    }
}
