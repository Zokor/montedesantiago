<?php

use App\Enums\DataType;
use App\Models\Component;
use App\Models\ComponentField;
use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'is_active' => true,
        'email_verified_at' => now(),
    ]);
});

function createComponentWithFields(): Component
{
    $component = Component::factory()->create([
        'name' => 'Text Block',
        'slug' => 'text-block',
    ]);

    ComponentField::factory()->for($component)->create([
        'name' => 'Heading',
        'slug' => 'heading',
        'data_type' => DataType::SHORT_TEXT,
        'is_required' => true,
    ]);

    ComponentField::factory()->for($component)->create([
        'name' => 'Body',
        'slug' => 'body',
        'data_type' => DataType::MARKDOWN,
    ]);

    return $component;
}

it('creates a page with components and versions', function () {
    $component = createComponentWithFields();

    $payload = [
        'title' => 'About Us',
        'status' => 'draft',
        'components' => [
            [
                'component_id' => $component->id,
                'data' => [
                    'heading' => 'Welcome',
                    'body' => '## Markdown body',
                ],
            ],
        ],
    ];

    $response = $this
        ->actingAs($this->user)
        ->postJson('/bo/pages', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.title', 'About Us')
        ->assertJsonCount(1, 'data.components');

    $page = Page::first();

    expect($page)->not->toBeNull();
    expect($page->pageComponents)->toHaveCount(1);

    $this->assertDatabaseHas('page_versions', [
        'page_id' => $page->id,
    ]);
});

it('lists pages with filters', function () {
    $page = Page::factory()->create([
        'title' => 'Landing',
        'slug' => 'landing',
        'status' => 'published',
        'is_homepage' => true,
    ]);

    $response = $this
        ->actingAs($this->user)
        ->getJson('/bo/pages?status=published');

    $response->assertOk()
        ->assertJsonPath('data.0.title', 'Landing');
});
