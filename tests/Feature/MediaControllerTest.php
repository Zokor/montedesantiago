<?php

use App\Models\Media;
use App\Models\User;
use App\Services\MediaStorageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'is_active' => true,
        'email_verified_at' => now(),
    ]);

    config([
        'database.default' => 'sqlite',
        'database.connections.sqlite.database' => database_path('database.sqlite'),
        'media.storage' => 'local',
        'media.disks.local' => 'media_local',
        'media.directories.base' => 'uploads',
        'media.directories.thumbnails' => 'uploads/thumbnails',
    ]);

    if (! file_exists(database_path('database.sqlite'))) {
        file_put_contents(database_path('database.sqlite'), '');
    }

    Storage::fake('media_local');
});

it('uploads media files to the configured disk', function () {
    $image = UploadedFile::fake()->image('hero.jpg', 1200, 800);
    $document = UploadedFile::fake()->create('brief.pdf', 300, 'application/pdf');

    $response = $this
        ->actingAs($this->user)
        ->postJson('/bo/media', [
            'files' => [$image, $document],
            'folder' => '/',
            'tags' => ['component:hero'],
        ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.0.original_name', 'hero.jpg')
        ->assertJsonPath('data.1.original_name', 'brief.pdf');

    $media = Media::all();
    expect($media)->toHaveCount(2);

    $media->each(function (Media $item): void {
        Storage::disk('media_local')->assertExists($item->path);
        expect($item->tags)->toContain('component:hero');
    });
});

it('moves and renames media files via the storage service', function () {
    Storage::disk('media_local')->put('uploads/hero/feature.jpg', 'content');

    $media = Media::factory()->create([
        'filename' => 'feature.jpg',
        'original_name' => 'feature.jpg',
        'type' => 'image/jpeg',
        'disk' => 'media_local',
        'path' => 'uploads/hero/feature.jpg',
        'folder' => '/hero',
        'tags' => ['component:hero'],
        'uploaded_by' => $this->user->id,
    ]);

    $storage = app(MediaStorageService::class);
    $storage->move($media, '/homepage');
    $storage->rename($media, 'feature-banner.jpg');

    Media::query()->whereKey($media->id)->update([
        'filename' => $media->filename,
        'original_name' => 'feature-banner.jpg',
        'folder' => $media->folder,
        'path' => $media->path,
        'url' => $media->url,
        'thumbnail_path' => $media->thumbnail_path,
        'tags' => ['component:homepage'],
    ]);

    $media->refresh();
    expect($media->folder)->toBe('/homepage');
    expect($media->original_name)->toBe('feature-banner.jpg');
    expect($media->filename)->toBe('feature-banner.jpg');
    Storage::disk('media_local')->assertExists($media->path);
});

it('replaces media file and stores new metadata', function () {
    Storage::disk('media_local')->put('uploads/team/photo.jpg', 'original-content');

    $media = Media::factory()->create([
        'filename' => 'photo.jpg',
        'original_name' => 'photo.jpg',
        'disk' => 'media_local',
        'path' => 'uploads/team/photo.jpg',
        'folder' => '/team',
        'uploaded_by' => $this->user->id,
    ]);

    $replacement = UploadedFile::fake()->image('replacement.jpg', 1024, 768);

    $response = $this
        ->actingAs($this->user)
        ->postJson("/bo/media/{$media->id}/replace", [
            'file' => $replacement,
            'original_name' => 'team-portrait.jpg',
        ]);

    $response->assertOk()->assertJsonPath('data.original_name', 'team-portrait.jpg');

    $media->refresh();
    Storage::disk('media_local')->assertExists($media->path);
    expect($media->width)->not->toBeNull();
    expect($media->height)->not->toBeNull();
});

it('filters media items by tag', function () {
    Media::factory()->count(2)->create([
        'disk' => 'media_local',
        'tags' => ['component:hero'],
        'uploaded_by' => $this->user->id,
    ]);

    Media::factory()->create([
        'disk' => 'media_local',
        'tags' => ['component:footer'],
        'uploaded_by' => $this->user->id,
    ]);

    $response = $this
        ->actingAs($this->user)
        ->getJson('/bo/media?tag=component:hero');

    $response->assertOk();
    expect(data_get($response->json(), 'media.data'))->toHaveCount(2);
});

it('stores svg uploads without attempting image processing', function () {
    $icon = UploadedFile::fake()->create('icon.svg', 4, 'image/svg+xml');

    $response = $this
        ->actingAs($this->user)
        ->postJson('/bo/media', [
            'files' => [$icon],
            'folder' => '/icons',
        ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.0.original_name', 'icon.svg');

    $media = Media::first();
    expect($media)->not->toBeNull();
    expect($media->thumbnail_path)->toBeNull();
    Storage::disk('media_local')->assertExists($media->path);
});
