<?php

namespace Database\Factories;

use App\Models\Page;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PageVersion>
 */
class PageVersionFactory extends Factory
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
            'content' => [
                'title' => $this->faker->sentence(),
                'slug' => $this->faker->slug(),
                'status' => $this->faker->randomElement(['draft', 'published']),
                'components' => [],
            ],
            'created_by' => User::factory(),
            'change_summary' => $this->faker->optional()->sentence(),
        ];
    }
}
