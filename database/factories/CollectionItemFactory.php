<?php

namespace Database\Factories;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CollectionItem>
 */
class CollectionItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'collection_id' => Collection::factory(),
            'data' => [
                'title' => $this->faker->sentence(),
                'summary' => $this->faker->paragraph(),
            ],
            'is_published' => $this->faker->boolean(80),
            'order' => $this->faker->unique()->numberBetween(1, 100),
        ];
    }
}
