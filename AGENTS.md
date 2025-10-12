===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to enhance the user's satisfaction building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4.13
- inertiajs/inertia-laravel (INERTIA) - v2
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v12
- laravel/prompts (PROMPTS) - v0
- laravel/sanctum (SANCTUM) - v4
- laravel/wayfinder (WAYFINDER) - v0
- laravel/mcp (MCP) - v0
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA) - v2
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove it works. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure - don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

## Laravel Boost

- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan

- Use the `list-artisan-commands` tool when you need to call an Artisan command to double check the available parameters.

## URLs

- Whenever you share a project URL with the user you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain / IP, and port.

## Tinker / Debugging

- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Reading Browser Logs With the `browser-logs` Tool

- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)

- Boost comes with a powerful `search-docs` tool you should use before any other approaches. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation specific for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- The 'search-docs' tool is perfect for all Laravel related packages, including Laravel, Inertia, Livewire, Filament, Tailwind, Pest, Nova, Nightwatch, etc.
- You must use this tool to search for Laravel-ecosystem documentation before falling back to other approaches.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic based queries to start. For example: `['rate limiting', 'routing rate limiting', 'routing']`.
- Do not add package names to queries - package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax

- You can and should pass multiple queries at once. The most relevant results will be returned first.

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit"
3. Quoted Phrases (Exact Position) - query="infinite scroll" - Words must be adjacent and in that order
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit"
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms

=== php rules ===

## PHP

- Always use curly braces for control structures, even if it has one line.

### Constructors

- Use PHP 8 constructor property promotion in `__construct()`.
    - <code-snippet>public function \_\_construct(public GitHub $github) { }</code-snippet>
- Do not allow empty `__construct()` methods with zero parameters.

### Type Declarations

- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<code-snippet name="Explicit Return Types and Method Params" lang="php">
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
</code-snippet>

## Comments

- Prefer PHPDoc blocks over comments. Never use comments within the code itself unless there is something _very_ complex going on.

## PHPDoc Blocks

- Add useful array shape type definitions for arrays when appropriate.

## Enums

- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.

=== herd rules ===

## Laravel Herd

- The application is served by Laravel Herd and will be available at: https?://[kebab-case-project-dir].test. Use the `get-absolute-url` tool to generate URLs for the user to ensure valid URLs.
- You must not run any commands to make the site available via HTTP(s). It is _always_ available through Laravel Herd.

=== inertia-laravel/core rules ===

## Inertia Core

- Inertia.js components should be placed in the `resources/js/Pages` directory unless specified differently in the JS bundler (vite.config.js).
- Use `Inertia::render()` for server-side routing instead of traditional Blade views.
- Use `search-docs` for accurate guidance on all things Inertia.

<code-snippet lang="php" name="Inertia::render Example">
// routes/web.php example
Route::get('/users', function () {
    return Inertia::render('Users/Index', [
        'users' => User::all()
    ]);
});
</code-snippet>

=== inertia-laravel/v2 rules ===

## Inertia v2

- Make use of all Inertia features from v1 & v2. Check the documentation before making any changes to ensure we are taking the correct approach.

### Inertia v2 New Features

- Polling
- Prefetching
- Deferred props
- Infinite scrolling using merging props and `WhenVisible`
- Lazy loading data on scroll

### Deferred Props & Empty States

- When using deferred props on the frontend, you should add a nice empty state with pulsing / animated skeleton.

### Inertia Form General Guidance

- The recommended way to build forms when using Inertia is with the `<Form>` component - a useful example is below. Use `search-docs` with a query of `form component` for guidance.
- Forms can also be built using the `useForm` helper for more programmatic control, or to follow existing conventions. Use `search-docs` with a query of `useForm helper` for guidance.
- `resetOnError`, `resetOnSuccess`, and `setDefaultsOnSuccess` are available on the `<Form>` component. Use `search-docs` with a query of 'form component resetting' for guidance.

=== laravel/core rules ===

## Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Database

- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

### Controllers & Validation

- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

### Queues

- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

### Authentication & Authorization

- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

### URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

### Configuration

- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

### Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] <name>` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

### Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== laravel/v12 rules ===

## Laravel 12

- Use the `search-docs` tool to get version specific documentation.
- This project upgraded from Laravel 10 without migrating to the new streamlined Laravel file structure.
- This is **perfectly fine** and recommended by Laravel. Follow the existing structure from Laravel 10. We do not to need migrate to the new Laravel structure unless the user explicitly requests that.

### Laravel 10 Structure

- Middleware typically lives in `app/Http/Middleware/` and service providers in `app/Providers/`.
- There is no `bootstrap/app.php` application configuration in a Laravel 10 structure:
    - Middleware registration happens in `app/Http/Kernel.php`
    - Exception handling is in `app/Exceptions/Handler.php`
    - Console commands and schedule register in `app/Console/Kernel.php`
    - Rate limits likely exist in `RouteServiceProvider` or `app/Http/Kernel.php`

### Database

- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 11 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models

- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.

=== pint/core rules ===

## Laravel Pint Code Formatter

- You must run `vendor/bin/pint --dirty` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test`, simply run `vendor/bin/pint` to fix any formatting issues.

=== pest/core rules ===

## Pest

### Testing

- If you need to verify a feature is working, write or update a Unit / Feature test.

### Pest Tests

- All tests must be written using Pest. Use `php artisan make:test --pest <name>`.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files - these are core to the application.
- Tests should test all of the happy paths, failure paths, and weird paths.
- Tests live in the `tests/Feature` and `tests/Unit` directories.
- Pest tests look and behave like this:
  <code-snippet name="Basic Pest Test Example" lang="php">
  it('is true', function () {
  expect(true)->toBeTrue();
  });
  </code-snippet>

### Running Tests

- Run the minimal number of tests using an appropriate filter before finalizing code edits.
- To run all tests: `php artisan test`.
- To run all tests in a file: `php artisan test tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --filter=testName` (recommended after making a change to a related file).
- When the tests relating to your changes are passing, ask the user if they would like to run the entire test suite to ensure everything is still passing.

### Pest Assertions

- When asserting status codes on a response, use the specific method like `assertForbidden` and `assertNotFound` instead of using `assertStatus(403)` or similar, e.g.:
  <code-snippet name="Pest Example Asserting postJson Response" lang="php">
  it('returns all', function () {
  $response = $this->postJson('/api/docs', []);

          $response->assertSuccessful();

    });
    </code-snippet>

### Mocking

- Mocking can be very helpful when appropriate.
- When mocking, you can use the `Pest\Laravel\mock` Pest function, but always import it via `use function Pest\Laravel\mock;` before using it. Alternatively, you can use `$this->mock()` if existing tests do.
- You can also create partial mocks using the same import or self method.

### Datasets

- Use datasets in Pest to simplify tests which have a lot of duplicated data. This is often the case when testing validation rules, so consider going with this solution when writing tests for validation rules.

<code-snippet name="Pest Dataset Example" lang="php">
it('has emails', function (string $email) {
    expect($email)->not->toBeEmpty();
})->with([
    'james' => 'james@laravel.com',
    'taylor' => 'taylor@laravel.com',
]);
</code-snippet>

=== pest/v4 rules ===

## Pest 4

- Pest v4 is a huge upgrade to Pest and offers: browser testing, smoke testing, visual regression testing, test sharding, and faster type coverage.
- Browser testing is incredibly powerful and useful for this project.
- Browser tests should live in `tests/Browser/`.
- Use the `search-docs` tool for detailed guidance on utilizing these features.

### Browser Testing

- You can use Laravel features like `Event::fake()`, `assertAuthenticated()`, and model factories within Pest v4 browser tests, as well as `RefreshDatabase` (when needed) to ensure a clean state for each test.
- Interact with the page (click, type, scroll, select, submit, drag-and-drop, touch gestures, etc.) when appropriate to complete the test.
- If requested, test on multiple browsers (Chrome, Firefox, Safari).
- If requested, test on different devices and viewports (like iPhone 14 Pro, tablets, or custom breakpoints).
- Switch color schemes (light/dark mode) when appropriate.
- Take screenshots or pause tests for debugging when appropriate.

### Example Tests

<code-snippet name="Pest Browser Test Example" lang="php">
it('may reset the password', function () {
    Notification::fake();

    $this->actingAs(User::factory()->create());

    $page = visit('/sign-in'); // Visit on a real browser...

    $page->assertSee('Sign In')
        ->assertNoJavascriptErrors() // or ->assertNoConsoleLogs()
        ->click('Forgot Password?')
        ->fill('email', 'nuno@laravel.com')
        ->click('Send Reset Link')
        ->assertSee('We have emailed your password reset link!')

    Notification::assertSent(ResetPassword::class);

});
</code-snippet>

<code-snippet name="Pest Smoke Testing Example" lang="php">
$pages = visit(['/', '/about', '/contact']);

$pages->assertNoJavascriptErrors()->assertNoConsoleLogs();
</code-snippet>

=== inertia-react/core rules ===

## Inertia + React

- Use `router.visit()` or `<Link>` for navigation instead of traditional links.

<code-snippet name="Inertia Client Navigation" lang="react">

import { Link } from '@inertiajs/react'

<Link href="/">Home</Link>

</code-snippet>

=== inertia-react/v2/forms rules ===

## Inertia + React Forms

<code-snippet name="`<Form>` Component Example" lang="react">

import { Form } from '@inertiajs/react'

export default () => (

<Form action="/users" method="post">
{({
errors,
hasErrors,
processing,
wasSuccessful,
recentlySuccessful,
clearErrors,
resetAndClearErrors,
defaults
}) => (
<>
<input type="text" name="name" />

        {errors.name && <div>{errors.name}</div>}

        <button type="submit" disabled={processing}>
            {processing ? 'Creating...' : 'Create User'}
        </button>

        {wasSuccessful && <div>User created successfully!</div>}
        </>
    )}
    </Form>

)

</code-snippet>

=== tailwindcss/core rules ===

## Tailwind Core

- Use Tailwind CSS classes to style HTML, check and use existing tailwind conventions within the project before writing your own.
- Offer to extract repeated patterns into components that match the project's conventions (i.e. Blade, JSX, Vue, etc..)
- Think through class placement, order, priority, and defaults - remove redundant classes, add classes to parent or child carefully to limit repetition, group elements logically
- You can use the `search-docs` tool to get exact examples from the official documentation when needed.

### Spacing

- When listing items, use gap utilities for spacing, don't use margins.

        <code-snippet name="Valid Flex Gap Spacing Example" lang="html">
            <div class="flex gap-8">
                <div>Superior</div>
                <div>Michigan</div>
                <div>Erie</div>
            </div>
        </code-snippet>

### Dark Mode

- If existing pages and components support dark mode, new pages and components must support dark mode in a similar way, typically using `dark:`.

=== tailwindcss/v4 rules ===

## Tailwind 4

- Always use Tailwind CSS v4 - do not use the deprecated utilities.
- `corePlugins` is not supported in Tailwind v4.
- In Tailwind v4, you import Tailwind using a regular CSS `@import` statement, not using the `@tailwind` directives used in v3:

<code-snippet name="Tailwind v4 Import Tailwind Diff" lang="diff">
   - @tailwind base;
   - @tailwind components;
   - @tailwind utilities;
   + @import "tailwindcss";
</code-snippet>

### Replaced Utilities

- Tailwind v4 removed deprecated utilities. Do not use the deprecated option - use the replacement.
- Opacity values are still numeric.

| Deprecated | Replacement |
|------------+--------------|
| bg-opacity-_ | bg-black/_ |
| text-opacity-_ | text-black/_ |
| border-opacity-_ | border-black/_ |
| divide-opacity-_ | divide-black/_ |
| ring-opacity-_ | ring-black/_ |
| placeholder-opacity-_ | placeholder-black/_ |
| flex-shrink-_ | shrink-_ |
| flex-grow-_ | grow-_ |
| overflow-ellipsis | text-ellipsis |
| decoration-slice | box-decoration-slice |
| decoration-clone | box-decoration-clone |

=== tests rules ===

## Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test` with a specific filename or filter.
  </laravel-boost-guidelines>

# Project Specific

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

## 2025-10-11 — Route Name De-duplication & Registration Removal

### Summary

Resolved Vite / Wayfinder build failures caused by duplicate generated TypeScript exports stemming from reused Laravel route names. Removed unused user registration UI since registration is disabled. Standardized MFA route names to prevent future collisions.

### Changes

- Removed `resources/js/pages/auth/register.tsx` (registration page) and all references (`register()` helper removed from `welcome.tsx` header and login page footer message simplified).
- Left Fortify registration routes commented out (no backend exposure) keeping prior intent explicit.
- Renamed MFA route names in `routes/web.php` from legacy `two-factor.*` style (previous interim naming) to a concise, unique `mfa.*` namespace:
    - `mfa.enable`
    - `mfa.enable-for-user`
    - `mfa.confirm` (was `two-factor.confirm` / `two-factor.verify-enable` previously)
    - `mfa.disable`
    - `mfa.login` (TOTP / backup code verification during login)
- Renamed POST password confirmation route from `password.confirmation` to `password.confirmation.store` to avoid clashing with the GET `password.confirm` route when Wayfinder generated helpers (previous build error: duplicate `confirmation` / `store` exports in generated files).

### Rationale

Wayfinder generates TypeScript constants per route name. When two Laravel routes share the same name (even with different methods or URLs), the emitted TS module re-declares an exported constant (e.g., `confirmation`, `store`, `enable`, `confirm`), causing esbuild compilation errors. By ensuring uniqueness across all named routes (especially GET vs POST pairs & parallel Fortify/MFA endpoints), builds now succeed.

### Result

- `npm run build` now completes successfully (no duplicate export errors).
- Frontend no longer imports non-existent registration route helpers.
- MFA naming is clearer (`mfa.*`) aligning with actual endpoint path `/bo/mfa/...`.

### How To Reintroduce Registration (If Needed Later)

1. Uncomment the registration routes in `routes/auth.php` (GET & POST) and assign distinct names (e.g., `register.show`, `register.store`).
2. Restore a page at `resources/js/pages/auth/register.tsx` (can recover from git history) updating it to use the new names.
3. Run `npm run build` to regenerate Wayfinder helpers.

### Follow-Up Suggestions

- Add a lightweight test asserting that a GET to `/bo/login` succeeds and `/login` 404s to guard against accidental Fortify view re-enablement.
- Consider a Pest test verifying each `mfa.*` route is authenticated + guarded by `ensureUserIsActive`.

---
