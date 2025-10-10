<?php

use App\Models\User;
use App\Http\Controllers\Auth\MfaController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('admin can enable MFA for another user via controller', function () {
    // Create admin user
    $admin = User::factory()->create();
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $admin->assignRole($adminRole);

    // Create target user
    $targetUser = User::factory()->create();

    // Create request as admin
    $request = Request::create('/bo/mfa/enable-for-user', 'POST', ['user_id' => $targetUser->id]);
    $request->setUserResolver(fn() => $admin);

    // Call controller method directly
    $controller = new MfaController();
    $response = $controller->enableMfaForUser($request);

    // Assert response
    expect($response->getStatusCode())->toBe(200);

    $data = json_decode($response->getContent(), true);
    expect($data)->toHaveKeys(['message', 'user_id', 'user_email', 'qr_code_url', 'secret']);
    expect($data['user_id'])->toBe($targetUser->id);
    expect($data['user_email'])->toBe($targetUser->email);

    // Verify target user has MFA secret
    $targetUser->refresh();
    expect($targetUser->two_factor_secret)->not->toBeNull();
});

test('non-admin cannot enable MFA for another user via controller', function () {
    // Create regular user
    $regularUser = User::factory()->create();

    // Create target user
    $targetUser = User::factory()->create();

    // Create request as regular user
    $request = Request::create('/bo/mfa/enable-for-user', 'POST', ['user_id' => $targetUser->id]);
    $request->setUserResolver(fn() => $regularUser);

    // Call controller method directly
    $controller = new MfaController();
    $response = $controller->enableMfaForUser($request);

    // Assert response is forbidden
    expect($response->getStatusCode())->toBe(403);
});

test('admin cannot enable MFA for themselves via controller', function () {
    // Create admin user
    $admin = User::factory()->create();
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $admin->assignRole($adminRole);

    // Create request as admin trying to enable for themselves
    $request = Request::create('/bo/mfa/enable-for-user', 'POST', ['user_id' => $admin->id]);
    $request->setUserResolver(fn() => $admin);

    // Call controller method directly
    $controller = new MfaController();
    $response = $controller->enableMfaForUser($request);

    // Assert response is bad request
    expect($response->getStatusCode())->toBe(400);

    $data = json_decode($response->getContent(), true);
    expect($data['message'])->toBe('Use the regular MFA enable endpoint for yourself.');
});
