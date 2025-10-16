<?php

use App\Http\Controllers\Admin\CollectionController;
use App\Http\Controllers\Admin\ComponentController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\MfaController;
use App\Http\Middleware\EnsureUserIsActive;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('bo', fn () => redirect()->route('login'));

Route::prefix('bo')->middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Authentication endpoints

// MFA endpoints (protected by auth and active-user check)
Route::prefix('bo')->middleware(['auth', 'verified', EnsureUserIsActive::class])->group(function () {
    Route::post('mfa/enable', [MfaController::class, 'enableMfa'])->name('mfa.enable');
    Route::post('mfa/enable-for-user', [MfaController::class, 'enableMfaForUser'])->name('mfa.enable-for-user');
    Route::post('mfa/verify-enable', [MfaController::class, 'verifyAndEnableMfa'])->name('mfa.confirm');
    Route::post('mfa/disable', [MfaController::class, 'disableMfa'])->name('mfa.disable');
    Route::post('mfa/verify', [MfaController::class, 'verifyMfa'])->name('mfa.login');

    Route::get('components/workspace', function () {
        return Inertia::render('components/workspace');
    })->name('components.workspace');

    Route::apiResource('components', ComponentController::class)->except(['create', 'edit']);
    Route::post('components/{component}/duplicate', [ComponentController::class, 'duplicate'])
        ->name('components.duplicate');
    Route::apiResource('collections', CollectionController::class)->except(['create', 'edit']);
    Route::apiResource('pages', PageController::class)->except(['create', 'edit']);
    Route::apiResource('media', MediaController::class)->except(['create', 'edit', 'update']);
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});
