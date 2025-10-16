<?php

namespace Database\Factories;

use App\Models\Component;
use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PageComponent>
 */
class PageComponentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'page_id' => Page::factory(),
            'component_id' => Component::factory(),
            'data' => [
                'heading' => $this->faker->sentence(),
                'body' => $this->faker->paragraph(),
            ],
            'order' => $this->faker->unique()->numberBetween(1, 50),
        ];
    }
}
