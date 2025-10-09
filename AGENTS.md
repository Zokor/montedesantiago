## 2025-10-09 — Headless CMS User System Enhancements

- Extended `database/migrations/0001_01_01_000000_create_users_table.php` to add MFA and security auditing fields (`is_mfa_enabled`, `mfa_secret`, `mfa_backup_codes`, `is_active`, `blocked_at`, `blocked_reason`, `last_login_at`, `last_login_ip`), indexes, and soft deletes.
- Updated `app/Models/User.php` with matching fillable attributes, hidden sensitive fields, boolean/array/datetime casts, and the `SoftDeletes` trait.
- Recorded required setup commands for the Laravel 12 + React stack:
    - Composer packages: Sanctum, Spatie Permission, Pragmarx Google2FA, Intervention Image.
    - NPM packages and initialization for Tailwind + shadcn/ui.
    - Artisan vendor publish commands and migration run.
    - `.env` variables for Sanctum, sessions, Google2FA, and image driver.
- Provided finalized `vite.config.ts` configuration tailored for React, Tailwind, Wayfinder, and HMR settings.

## 2025-10-10 — Laravel Authentication System with MFA Support

- **AuthController** (`app/Http/Controllers/Auth/AuthController.php`):
    - Implemented `login` with validation, rate limiting (5 attempts per minute), credential checking, last login timestamp & IP storage, and JSON success response.
    - Implemented `logout` with session invalidation and JSON response.
    - Added `showLogin` placeholder returning a JSON message.
    - Added helper methods `ensureIsNotRateLimited` and `throttleKey` for rate limiting logic.

- **MfaController** (`app/Http/Controllers/Auth/MfaController.php`):
    - `enableMfa`: Generates a new Google2FA secret (or reuses existing), encrypts it, and returns a QR code URL for the authenticator app.
    - `verifyAndEnableMfa`: Validates the TOTP code, marks MFA as confirmed, creates 10 hashed backup codes, stores them encrypted, and returns a success message.
    - `disableMfa`: Clears MFA secret, backup codes, and confirmation timestamp.
    - `verifyMfa`: Checks supplied code against hashed backup codes (consuming a code on success) or validates the TOTP code; returns appropriate JSON response.

- **User Model** (`app/Models/User.php`):
    - Added `two_factor_secret` and `two_factor_recovery_codes` to `$fillable`.
    - Hid these fields in `$hidden`.
    - Cast `two_factor_recovery_codes` to `array` for automatic JSON handling.

- **Middleware**:
    - Created `app/Http/Middleware/Authenticate.php` (standard Laravel authentication middleware).
    - Updated `app/Http/Middleware/EnsureUserIsActive.php` to check the `is_active` flag and block inactive users.

- **Kernel** (`app/Http/Kernel.php`):
    - Registered route middleware `'ensureUserIsActive' => \App\Http\Middleware\EnsureUserIsActive::class`.

- **Routes** (`routes/web.php`):
    - Added POST `/login` and `/logout` endpoints using `AuthController`.
    - Added MFA routes (`/mfa/enable`, `/mfa/verify-enable`, `/mfa/disable`, `/mfa/verify`) protected by `auth`, `verified`, and `ensureUserIsActive` middleware.
    - Fixed duplicate Inertia import.

- **Integration**:
    - Utilized `pragmarx/google2fa` for TOTP generation and verification.
    - All endpoints return JSON responses with proper validation and error handling, suitable for API consumption.

This documentation provides a concise source of knowledge for the implemented authentication and MFA system, making it easy to reference and maintain.

## [2025-10-09] Admin Route Refactor

- All admin pages and endpoints are now under the `/bo` slug.
- Updated `routes/web.php`:
    - Wrapped dashboard and MFA routes with `Route::prefix('bo')`.
    - All admin URLs are now `/bo/dashboard`, `/bo/mfa/enable`, etc.
- No frontend `.tsx` files required changes (no hardcoded admin URLs found).
- Login and logout endpoints remain at `/bo` and `/logout`.

**Tested:**

- Admin dashboard and MFA endpoints are accessible only under `/bo`.

---

**Summary of Project Organization and Changes**

- All admin functionality is now grouped under the `/bo` prefix for improved separation.
- Dashboard and MFA endpoints are protected by authentication and verification middleware.
- Authentication endpoints (`/bo`, `/logout`) are available for login/logout.
- No hardcoded admin URLs in frontend code, so navigation is handled by backend route changes.
- This file will continue to track all major organizational and route changes for the project.

---

## [2025-10-09] Login Entry Relocation

- Added a redirect so `/bo` forwards to the `login` route, serving `/bo/login`.
- Disabled Fortify’s built-in view routes (`config/fortify.php` → `'views' => false`) to ensure `/login` is no longer available.
- Registered a custom Inertia login view via `Fortify::loginView()` so `/bo/login` renders `resources/js/pages/auth/login.tsx`.

**Status:**

- `/bo/login` renders the Inertia login page.
- `/login` now returns a 404 because Fortify view routes are disabled.
