<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Page>
 */
class PageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = $this->faker->unique()->sentence(3);
        $status = $this->faker->randomElement(['draft', 'published']);
        $publishedAt = $status === 'published'
            ? $this->faker->dateTimeBetween('-1 month', 'now')
            : null;

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'is_homepage' => false,
            'status' => $status,
            'published_at' => $publishedAt,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
