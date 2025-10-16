<?php

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'is_active' => true,
        'email_verified_at' => now(),
    ]);

    Storage::fake('public');
});

it('uploads media and stores metadata', function () {
    $file = UploadedFile::fake()->image('photo.jpg', 800, 600);

    $response = $this
        ->actingAs($this->user)
        ->postJson('/bo/media', [
            'file' => $file,
            'folder' => 'uploads',
            'disk' => 'public',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.original_filename', 'photo.jpg');

    $media = Media::first();
    expect($media)->not->toBeNull();

    Storage::disk('public')->assertExists($media->path);
});

it('lists uploaded media items', function () {
    $media = Media::factory()->create([
        'filename' => 'document.pdf',
        'original_filename' => 'document.pdf',
        'mime_type' => 'application/pdf',
        'disk' => 'public',
        'path' => 'media/document.pdf',
        'uploaded_by' => $this->user->id,
    ]);

    $response = $this
        ->actingAs($this->user)
        ->getJson('/bo/media');

    $response->assertOk()
        ->assertJsonPath('data.0.filename', 'document.pdf');
});
