<?php

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::forget('settings.headless_enabled');
});

it('allows access to headless endpoints when enabled', function () {
    $response = $this->getJson('/api/v1/pages');

    $response->assertOk();
});

it('returns 404 when headless feature is disabled', function () {
    Setting::factory()->create([
        'group' => 'features',
        'key' => 'headless',
        'value' => ['enabled' => false],
    ]);
    Cache::forget('settings.headless_enabled');

    $response = $this->getJson('/api/v1/pages');

    $response->assertNotFound();
});
