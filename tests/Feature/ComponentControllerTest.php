<?php

use App\Enums\DataType;
use App\Models\Component;
use App\Models\ComponentField;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'is_active' => true,
        'email_verified_at' => now(),
    ]);
});

it('stores a component with fields', function () {
    $payload = [
        'name' => 'Hero Banner',
        'description' => 'Homepage hero section.',
        'fields' => [
            [
                'name' => 'Title',
                'data_type' => DataType::SHORT_TEXT->value,
                'is_required' => true,
            ],
            [
                'name' => 'Background Image',
                'data_type' => DataType::IMAGE->value,
                'config' => ['accept' => ['image/*']],
            ],
        ],
    ];

    $response = $this
        ->actingAs($this->user)
        ->postJson('/bo/components', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Hero Banner')
        ->assertJsonCount(2, 'data.fields');

    $this->assertDatabaseHas('components', [
        'name' => 'Hero Banner',
        'slug' => 'hero-banner',
    ]);

    $this->assertDatabaseHas('component_fields', [
        'name' => 'Title',
        'data_type' => DataType::SHORT_TEXT->value,
    ]);
});

it('lists components with field counts', function () {
    $component = Component::factory()->create([
        'name' => 'Feature List',
        'slug' => 'feature-list',
    ]);

    ComponentField::factory()->for($component)->create([
        'name' => 'Heading',
        'data_type' => DataType::SHORT_TEXT,
    ]);

    ComponentField::factory()->for($component)->create([
        'name' => 'Items',
        'data_type' => DataType::LIST,
    ]);

    $response = $this
        ->actingAs($this->user)
        ->getJson('/bo/components');

    $response->assertOk()
        ->assertJsonPath('data.0.name', 'Feature List')
        ->assertJsonPath('data.0.fields_count', 2);
});
