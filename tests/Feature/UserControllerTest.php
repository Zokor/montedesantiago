<?php

use App\Models\User;
use App\Notifications\UserInvitationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    collect(['admin', 'editor', 'developer'])->each(fn ($name) => Role::firstOrCreate(['name' => $name]));

    $this->admin = User::factory()->create([
        'is_active' => true,
        'email_verified_at' => now(),
    ]);

    $this->admin->syncRoles(['admin']);
});

it('lists users with filters', function () {
    User::factory()->create(['name' => 'Active User', 'is_active' => true]);
    User::factory()->create(['name' => 'Inactive User', 'is_active' => false]);

    $response = $this
        ->actingAs($this->admin)
        ->getJson('/bo/users?status=active');

    $response->assertOk();
});

it('updates user status', function () {
    $user = User::factory()->create(['is_active' => true]);

    $response = $this
        ->actingAs($this->admin)
        ->put("/bo/users/{$user->id}", ['is_active' => false]);

    $response->assertRedirect();
    $this->assertFalse($user->fresh()->is_active);
});

it('allows admins to invite new users', function () {
    Notification::fake();

    $response = $this
        ->actingAs($this->admin)
        ->post('/bo/users', [
            'name' => 'New User',
            'email' => 'invite@example.com',
            'role' => 'editor',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', ['email' => 'invite@example.com']);
    $invited = User::where('email', 'invite@example.com')->first();

    $this->assertNotNull($invited);
    Notification::assertSentTo($invited, UserInvitationNotification::class);
});

it('prevents editors from inviting users', function () {
    $editor = User::factory()->create([
        'is_active' => true,
        'email_verified_at' => now(),
    ]);
    $editor->syncRoles(['editor']);

    $response = $this
        ->actingAs($editor)
        ->post('/bo/users', [
            'name' => 'Blocked',
            'email' => 'blocked@example.com',
            'role' => 'developer',
        ]);

    $response->assertForbidden();
});

it('allows managers to delete users with confirmation', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($this->admin)
        ->delete("/bo/users/{$user->id}", ['confirmation' => 'I Confirm']);

    $response->assertRedirect();
    $this->assertSoftDeleted($user);
});
