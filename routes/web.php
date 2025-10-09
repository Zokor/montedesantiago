<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\MfaController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// Authentication endpoints
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout']);

// MFA endpoints (protected by auth and active‑user check)
Route::middleware(['auth', 'verified', 'ensureUserIsActive'])->group(function () {
    Route::post('mfa/enable', [MfaController::class, 'enableMfa']);
    Route::post('mfa/verify-enable', [MfaController::class, 'verifyAndEnableMfa']);
    Route::post('mfa/disable', [MfaController::class, 'disableMfa']);
    Route::post('mfa/verify', [MfaController::class, 'verifyMfa']);
});
