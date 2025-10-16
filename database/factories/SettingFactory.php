<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Setting>
 */
class SettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $key = Str::slug($this->faker->unique()->words(3, true));

        return [
            'key' => $key,
            'group' => $this->faker->randomElement(['general', 'headless', 'media']),
            'value' => [
                'enabled' => $this->faker->boolean(),
            ],
            'is_locked' => false,
        ];
    }
}
