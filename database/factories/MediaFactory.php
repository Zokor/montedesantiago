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
        $folder = '/images';
        $basePath = 'media';

        return [
            'filename' => $filename,
            'original_name' => $this->faker->lexify('image-????.jpg'),
            'type' => 'image/jpeg',
            'disk' => 'media_local',
            'path' => $basePath.'/'.$filename,
            'url' => config('app.url').'/'.$basePath.'/'.$filename,
            'thumbnail_path' => $basePath.'/thumbnails/'.$filename,
            'size' => $this->faker->numberBetween(50_000, 4_000_000),
            'metadata' => [
                'width' => $width,
                'height' => $height,
                'alt' => $this->faker->sentence(),
            ],
            'folder' => $folder,
            'tags' => [$this->faker->word()],
            'width' => $width,
            'height' => $height,
            'uploaded_by' => User::factory(),
        ];
    }
}
