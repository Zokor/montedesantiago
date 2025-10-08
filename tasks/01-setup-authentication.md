# Phase 1: Foundation & Authentication

**Duration:** Week 1-2  
**Goal:** Set up project infrastructure and secure authentication system

---

## 1.1 Project Initialization

### Task 1.1.1: Laravel Setup

**Estimated Time:** 2 hours

- [ ] Install Laravel 11.x: `composer create-project laravel/laravel cms-backend`
- [ ] Configure `.env` file:
  ```env
  APP_NAME="Headless CMS"
  APP_URL=http://localhost:8000
  DB_CONNECTION=mysql
  DB_DATABASE=cms_headless
  CACHE_DRIVER=redis
  SESSION_DRIVER=redis
  ```
- [ ] Create database: `CREATE DATABASE cms_headless;`
- [ ] Run initial migration: `php artisan migrate`
- [ ] Install required packages:
  ```bash
  composer require laravel/sanctum
  composer require spatie/laravel-permission
  composer require pragmarx/google2fa-laravel
  composer require intervention/image
  ```
- [ ] Publish vendor configs:
  ```bash
  php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
  php artisan vendor:publish --tag=sanctum-config
  ```

**Verification:** `php artisan serve` runs without errors

---

### Task 1.1.2: React + Vite Setup

**Estimated Time:** 3 hours

- [ ] Install Node dependencies:
  ```bash
  npm install
  npm install react react-dom
  npm install -D @vitejs/plugin-react
  npm install react-router-dom
  npm install axios
  ```
- [ ] Configure Vite for React (`vite.config.js`):

  ```js
  import { defineConfig } from 'vite';
  import laravel from 'laravel-vite-plugin';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [
      laravel({
        input: ['resources/js/app.jsx'],
        refresh: true,
      }),
      react(),
    ],
  });
  ```

- [ ] Update `resources/js/app.jsx` to bootstrap React
- [ ] Create blade template: `resources/views/app.blade.php` with:
  - `@vite` directive
  - Root div: `<div id="app"></div>`
- [ ] Test React renders: Add simple "Hello World" component

**Verification:** Visit `/` and see React component rendering

---

### Task 1.1.3: shadcn/ui Installation

**Estimated Time:** 2 hours

- [ ] Install Tailwind CSS:
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] Configure `tailwind.config.js`:
  ```js
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.jsx',
    './resources/**/*.js',
  ];
  ```
- [ ] Install shadcn/ui dependencies:
  ```bash
  npm install class-variance-authority clsx tailwind-merge
  npm install lucide-react
  npm install @radix-ui/react-slot
  ```
- [ ] Create `resources/js/lib/utils.js` for `cn()` helper
- [ ] Install initial shadcn components:
  ```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add input
  npx shadcn-ui@latest add label
  npx shadcn-ui@latest add card
  npx shadcn-ui@latest add table
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add dropdown-menu
  npx shadcn-ui@latest add toast
  ```

**Verification:** Use a Button component in your test page

---

### Task 1.1.4: Environment Configuration

**Estimated Time:** 1 hour

- [ ] Set up Redis (Docker or local):
  ```yaml
  # docker-compose.yml (optional)
  version: '3.8'
  services:
    redis:
      image: redis:alpine
      ports:
        - '6379:6379'
  ```
- [ ] Configure Laravel queue driver to `redis`
- [ ] Configure session driver to `redis`
- [ ] Test Redis connection: `php artisan tinker` → `Redis::set('test', 'value')`
- [ ] Set up environment variables for MFA:
  ```env
  GOOGLE2FA_ENABLED=true
  ```

**Verification:** All services running, no errors in logs

---

## 1.2 Database Schema - Authentication

### Task 1.2.1: Users Table Migration

**Estimated Time:** 1 hour

- [ ] Modify existing users migration:
  ```php
  Schema::create('users', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('email')->unique();
      $table->timestamp('email_verified_at')->nullable();
      $table->string('password');
      $table->boolean('is_active')->default(true);
      $table->boolean('is_mfa_enabled')->default(false);
      $table->text('mfa_secret')->nullable();
      $table->json('mfa_backup_codes')->nullable();
      $table->timestamp('blocked_at')->nullable();
      $table->string('blocked_reason')->nullable();
      $table->timestamp('last_login_at')->nullable();
      $table->string('last_login_ip')->nullable();
      $table->rememberToken();
      $table->timestamps();
      $table->softDeletes();
  });
  ```
- [ ] Run migration: `php artisan migrate`
- [ ] Create User model with:
  - Fillable fields
  - Hidden fields (password, mfa_secret)
  - Casts (is_active, is_mfa_enabled to boolean)
  - Soft deletes trait

**Verification:** Check database table structure

---

### Task 1.2.2: Seeder - Default Admin

**Estimated Time:** 30 minutes

- [ ] Create seeder: `php artisan make:seeder AdminUserSeeder`
- [ ] Add default webmaster user:
  ```php
  User::create([
      'name' => 'Webmaster',
      'email' => 'webmaster@cms.local',
      'password' => Hash::make('change-me-in-production'),
      'is_active' => true,
      'email_verified_at' => now(),
  ]);
  ```
- [ ] Update `DatabaseSeeder.php` to call `AdminUserSeeder`
- [ ] Run seeder: `php artisan db:seed`

**Verification:** Webmaster user exists in database

---

## 1.3 Authentication System

### Task 1.3.1: Login Backend

**Estimated Time:** 2 hours

- [ ] Create `AuthController`: `php artisan make:controller Auth/AuthController`
- [ ] Implement methods:
  ```php
  public function showLogin() // Return view
  public function login(Request $request) // Handle login
  public function logout(Request $request) // Handle logout
  ```
- [ ] Create login validation:
  - Email required and valid
  - Password required
  - Rate limiting (5 attempts per minute)
- [ ] Implement authentication logic:
  - Check credentials
  - Verify user is active
  - Check if MFA is enabled
  - Store session
  - Log last login details
- [ ] Define routes in `routes/web.php`:
  ```php
  Route::get('/bo/login', [AuthController::class, 'showLogin'])
      ->name('login');
  Route::post('/bo/login', [AuthController::class, 'login']);
  Route::post('/bo/logout', [AuthController::class, 'logout'])
      ->middleware('auth');
  ```

**Verification:** Login endpoint works with Postman

---

### Task 1.3.2: Login Frontend

**Estimated Time:** 3 hours

- [ ] Create `resources/js/Pages/Auth/Login.jsx`
- [ ] Build login form with shadcn components:
  - Email input with validation
  - Password input with show/hide toggle
  - Remember me checkbox
  - Submit button with loading state
  - Error message display
- [ ] Implement form handling:
  - Use axios for API call
  - Handle validation errors
  - Redirect on success
  - Show toast notifications
- [ ] Add styling:
  - Centered card layout
  - Responsive design
  - Brand colors
  - Background gradient/pattern

**Verification:** Login form submits and authenticates

---

### Task 1.3.3: MFA Setup Backend

**Estimated Time:** 3 hours

- [ ] Create `MfaController`: `php artisan make:controller Auth/MfaController`
- [ ] Implement methods:
  ```php
  public function enableMfa() // Generate secret & QR
  public function verifyAndEnableMfa(Request $request) // Verify code
  public function disableMfa(Request $request) // Disable MFA
  public function verifyMfa(Request $request) // Login verification
  ```
- [ ] Generate QR code for TOTP setup:
  - Use `pragmarx/google2fa`
  - Generate backup codes (10 codes)
  - Store encrypted secret
- [ ] Verify TOTP code:
  - Check code validity
  - Rate limit attempts
  - Mark code as used (if using backup)
- [ ] Define routes:
  ```php
  Route::middleware('auth')->prefix('bo')->group(function () {
      Route::post('/mfa/enable', [MfaController::class, 'enableMfa']);
      Route::post('/mfa/verify-enable', [MfaController::class, 'verifyAndEnableMfa']);
      Route::post('/mfa/disable', [MfaController::class, 'disableMfa']);
  });
  Route::post('/bo/mfa/verify', [MfaController::class, 'verifyMfa']);
  ```

**Verification:** QR code generates, TOTP validates correctly

---

### Task 1.3.4: MFA Frontend

**Estimated Time:** 3 hours

- [ ] Create `resources/js/Pages/Auth/MfaVerify.jsx`
- [ ] Build MFA verification screen:
  - 6-digit code input
  - Auto-focus and auto-submit
  - "Use backup code" option
  - Error handling
  - Loading states
- [ ] Create `resources/js/Pages/Settings/MfaSetup.jsx`
- [ ] Build MFA setup screen:
  - QR code display
  - Manual entry key display
  - Verification code input
  - Backup codes download
  - Enable/disable toggle
- [ ] Add MFA status indicator in user menu

**Verification:** Complete MFA flow from setup to login

---

### Task 1.3.5: Password Management

**Estimated Time:** 2 hours

- [ ] Create `PasswordController`
- [ ] Implement password reset:
  ```php
  public function showResetForm() // Show form
  public function sendResetLink(Request $request) // Email link
  public function showResetPassword($token) // Show reset form
  public function resetPassword(Request $request) // Update password
  ```
- [ ] Configure email settings in `.env`:
  ```env
  MAIL_MAILER=smtp
  MAIL_FROM_ADDRESS=noreply@cms.local
  ```
- [ ] Create password reset email template
- [ ] Create password reset form (React)
- [ ] Add password strength requirements:
  - Minimum 8 characters
  - At least 1 uppercase, 1 lowercase, 1 number
  - Visual strength indicator
- [ ] Define routes for password reset

**Verification:** Complete password reset flow

---

### Task 1.3.6: Session Management

**Estimated Time:** 1 hour

- [ ] Configure session timeout (30 minutes idle)
- [ ] Implement "Remember Me" functionality:
  - Extended token expiry (30 days)
  - Secure cookie settings
- [ ] Create middleware to check:
  - User is authenticated
  - User is active (not blocked)
  - Session is valid
- [ ] Add automatic logout on token expiry
- [ ] Clear session on logout

**Verification:** Session persists/expires correctly

---

## 1.4 Admin Layout

### Task 1.4.1: Layout Structure

**Estimated Time:** 3 hours

- [ ] Create `resources/js/Components/Layout/AdminLayout.jsx`
- [ ] Build layout structure:
  ```jsx
  <div className='flex h-screen'>
    <Sidebar />
    <div className='flex-1 flex flex-col'>
      <Header />
      <main className='flex-1 overflow-y-auto p-6'>{children}</main>
    </div>
  </div>
  ```
- [ ] Create responsive sidebar:
  - Collapsible on mobile
  - Expandable/collapsible on desktop
  - Active link highlighting
- [ ] Style with Tailwind:
  - Modern, clean design
  - Dark/light mode toggle (optional)

**Verification:** Layout renders with mock navigation

---

### Task 1.4.2: Sidebar Navigation

**Estimated Time:** 2 hours

- [ ] Create `resources/js/Components/Layout/Sidebar.jsx`
- [ ] Define navigation structure:
  ```js
  const navigation = [
    { name: 'Dashboard', href: '/bo/dashboard', icon: Home },
    { name: 'Collections', href: '/bo/collections', icon: Database },
    { name: 'Components', href: '/bo/components', icon: Boxes },
    { name: 'Pages', href: '/bo/pages', icon: FileText },
    { name: 'Media', href: '/bo/media', icon: Image },
    { name: 'Users', href: '/bo/users', icon: Users },
  ];
  ```
- [ ] Implement navigation items with:
  - Lucide React icons
  - Active state styling
  - Hover effects
  - Badge for counts (optional)
- [ ] Add logo/brand at top
- [ ] Add collapse button

**Verification:** All navigation items render and link

---

### Task 1.4.3: Header Component

**Estimated Time:** 2 hours

- [ ] Create `resources/js/Components/Layout/Header.jsx`
- [ ] Add elements:
  - Page title/breadcrumbs
  - Search bar (placeholder for now)
  - Notifications icon (placeholder)
  - User dropdown menu
- [ ] Create user dropdown with:
  - User name and email
  - "Profile" link
  - "Settings" link
  - "MFA Setup" link
  - "Logout" button
- [ ] Style with shadcn DropdownMenu
- [ ] Implement logout functionality

**Verification:** Header displays, dropdown works

---

### Task 1.4.4: Dashboard Page

**Estimated Time:** 2 hours

- [ ] Create `resources/js/Pages/Dashboard.jsx`
- [ ] Add welcome message
- [ ] Create stat cards:
  - Total collections
  - Total components
  - Total pages
  - Total media files
- [ ] Add recent activity section (placeholder)
- [ ] Use shadcn Card components
- [ ] Make responsive grid layout

**Verification:** Dashboard displays mock data

---

## 1.5 Routing & Middleware

### Task 1.5.1: Backend Routes

**Estimated Time:** 1 hour

- [ ] Define route structure in `routes/web.php`:

  ```php
  // Public routes
  Route::get('/bo/login', [AuthController::class, 'showLogin']);
  Route::post('/bo/login', [AuthController::class, 'login']);

  // Protected routes
  Route::middleware(['auth', 'active.user'])->prefix('bo')->group(function () {
      Route::get('/dashboard', [DashboardController::class, 'index']);
      Route::post('/logout', [AuthController::class, 'logout']);
      // More routes will be added in later phases
  });
  ```

- [ ] Create middleware: `php artisan make:middleware EnsureUserIsActive`
  - Check `is_active` flag
  - Redirect to login if blocked
- [ ] Register middleware in `app/Http/Kernel.php`

**Verification:** Routes accessible only when authenticated

---

### Task 1.5.2: Frontend Routing

**Estimated Time:** 2 hours

- [ ] Set up React Router in `app.jsx`:
  ```jsx
  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  ```
- [ ] Define routes:
  ```jsx
  <Routes>
    <Route path='/bo/login' element={<Login />} />
    <Route path='/bo/mfa-verify' element={<MfaVerify />} />
    <Route path='/bo/*' element={<AdminLayout />}>
      <Route path='dashboard' element={<Dashboard />} />
      {/* More routes in later phases */}
    </Route>
  </Routes>
  ```
- [ ] Create `ProtectedRoute` component:
  - Check authentication state
  - Redirect to login if not authenticated
- [ ] Handle 404 pages

**Verification:** Navigation between pages works

---

### Task 1.5.3: API Error Handling

**Estimated Time:** 2 hours

- [ ] Create axios instance with interceptors:

  ```js
  // resources/js/lib/axios.js
  import axios from 'axios';

  const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
  });

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        window.location.href = '/bo/login';
      }
      return Promise.reject(error);
    }
  );
  ```

- [ ] Create error boundary component
- [ ] Add toast notification system:
  - Install: `npx shadcn-ui@latest add toast`
  - Create toast context
  - Add success/error helpers
- [ ] Standardize API error responses in Laravel

**Verification:** Errors display as toasts

---

## 1.6 Security Hardening

### Task 1.6.1: CSRF Protection

**Estimated Time:** 1 hour

- [ ] Ensure CSRF token in all forms
- [ ] Add CSRF token to axios headers:
  ```js
  axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector(
    'meta[name="csrf-token"]'
  ).content;
  ```
- [ ] Test CSRF protection on all POST requests

**Verification:** Forms submit with CSRF token

---

### Task 1.6.2: Rate Limiting

**Estimated Time:** 1 hour

- [ ] Apply rate limiting to login:
  ```php
  Route::post('/bo/login', [AuthController::class, 'login'])
      ->middleware('throttle:5,1'); // 5 attempts per minute
  ```
- [ ] Apply rate limiting to MFA verification
- [ ] Apply rate limiting to password reset
- [ ] Customize rate limit response messages

**Verification:** Rate limiting blocks excessive requests

---

### Task 1.6.3: Security Headers

**Estimated Time:** 30 minutes

- [ ] Add middleware for security headers:
  ```php
  // X-Frame-Options, X-Content-Type-Options, etc.
  ```
- [ ] Configure Content Security Policy (CSP)
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags

**Verification:** Check headers with browser dev tools

---

## 1.7 Testing & Documentation

### Task 1.7.1: Authentication Tests

**Estimated Time:** 3 hours

- [ ] Create feature test: `tests/Feature/AuthenticationTest.php`
- [ ] Test cases:
  - Successful login
  - Failed login (wrong password)
  - Login with inactive user
  - MFA setup and verification
  - Logout
  - Remember me functionality
  - Session timeout
- [ ] Run tests: `php artisan test --filter=Authentication`

**Verification:** All tests pass

---

### Task 1.7.2: Setup Documentation

**Estimated Time:** 2 hours

- [ ] Create `docs/setup.md` with:
  - Prerequisites (PHP, Node, MySQL, Redis)
  - Installation steps
  - Environment configuration
  - Database setup
  - Running the application
- [ ] Add screenshots of key screens
- [ ] Document default credentials
- [ ] Add troubleshooting section

**Verification:** Fresh install works following docs

---

## Phase 1 Checklist

- [ ] All tasks completed
- [ ] Laravel + React + shadcn/ui working
- [ ] User can login at `/bo/login`
- [ ] MFA setup and verification works
- [ ] Admin layout displays correctly
- [ ] Navigation functional
- [ ] Session management works
- [ ] All tests passing
- [ ] Documentation complete

**Estimated Total Time:** 40-50 hours

---

## Ready for Phase 2?

Once Phase 1 is complete, proceed to `02-data-models.md` to build the core data structures.
