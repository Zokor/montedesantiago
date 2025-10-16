<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Media>
 */
class MediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = Str::uuid()->toString().'.jpg';
        $width = $this->faker->numberBetween(640, 1920);
        $height = $this->faker->numberBetween(480, 1080);

        return [
            'filename' => $filename,
            'original_filename' => $this->faker->lexify('image-????.jpg'),
            'mime_type' => 'image/jpeg',
            'disk' => 'public',
            'path' => 'uploads/'.$filename,
            'thumbnail_path' => null,
            'size' => $this->faker->numberBetween(50_000, 4_000_000),
            'metadata' => [
                'width' => $width,
                'height' => $height,
                'alt' => $this->faker->sentence(),
            ],
            'folder' => '/images',
            'uploaded_by' => User::factory(),
        ];
    }
}
