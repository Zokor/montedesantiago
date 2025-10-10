<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\MfaController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('bo', fn() => redirect()->route('login'));

Route::prefix('bo')->middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// Authentication endpoints
Route::post('bo', [AuthController::class, 'login'])->name('login');
Route::post('logout', [AuthController::class, 'logout'])->name('logout');

// MFA endpoints (protected by auth and active-user check)
Route::prefix('bo')->middleware(['auth', 'verified', 'ensureUserIsActive'])->group(function () {
    Route::post('mfa/enable', [MfaController::class, 'enableMfa'])->name('two-factor.enable');
    Route::post('mfa/enable-for-user', [MfaController::class, 'enableMfaForUser'])->name('two-factor.enable-for-user');
    Route::post('mfa/verify-enable', [MfaController::class, 'verifyAndEnableMfa'])->name('two-factor.confirm');
    Route::post('mfa/disable', [MfaController::class, 'disableMfa'])->name('two-factor.disable');
    Route::post('mfa/verify', [MfaController::class, 'verifyMfa'])->name('two-factor.login');
});
