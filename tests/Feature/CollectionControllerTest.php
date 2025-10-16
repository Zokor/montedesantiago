<?php

use App\Enums\DataType;
use App\Models\Collection;
use App\Models\CollectionField;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'is_active' => true,
        'email_verified_at' => now(),
    ]);
});

it('creates a collection with fields', function () {
    $payload = [
        'name' => 'Articles',
        'description' => 'Site articles.',
        'fields' => [
            [
                'name' => 'Title',
                'data_type' => DataType::SHORT_TEXT->value,
                'is_required' => true,
            ],
            [
                'name' => 'Body',
                'data_type' => DataType::MARKDOWN->value,
            ],
        ],
    ];

    $response = $this
        ->actingAs($this->user)
        ->postJson('/bo/collections', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Articles')
        ->assertJsonCount(2, 'data.fields');

    $this->assertDatabaseHas('collections', ['name' => 'Articles']);
    $this->assertDatabaseHas('collection_fields', [
        'name' => 'Title',
        'data_type' => DataType::SHORT_TEXT->value,
    ]);
});

it('lists collections with counts and filtering', function () {
    $collection = Collection::factory()->create([
        'name' => 'Products',
        'slug' => 'products',
        'is_active' => true,
    ]);

    CollectionField::factory()->for($collection)->create([
        'name' => 'Name',
        'data_type' => DataType::SHORT_TEXT,
    ]);

    CollectionField::factory()->for($collection)->create([
        'name' => 'Price',
        'data_type' => DataType::NUMBER,
    ]);

    $response = $this
        ->actingAs($this->user)
        ->getJson('/bo/collections?status=active');

    $response->assertOk()
        ->assertJsonPath('data.0.name', 'Products')
        ->assertJsonPath('data.0.fields_count', 2);
});
