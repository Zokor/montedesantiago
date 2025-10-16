# Phases 8-9: API & Final Polish

This document covers the public API, optimization, and production readiness.

---

## PHASE 8: Public API & JSON Output (Week 8)

### 8.1 API Authentication

**Task 8.1.1: API Tokens Table (1h)**

```php
Schema::create('api_tokens', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name'); // Token description
    $table->string('token', 64)->unique();
    $table->json('permissions')->nullable(); // ['pages:read', 'collections:read']
    $table->timestamp('last_used_at')->nullable();
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();
});
```

**Task 8.1.2: Token Management UI (4h)**

- [ ] Create `Settings/ApiTokens.jsx`
- [ ] List user's tokens
- [ ] Create new token with:
    - Name/description
    - Permissions checkboxes
    - Expiry date
    - Show token once after creation
- [ ] Revoke token
- [ ] Show last used date
- [ ] Copy token button

**Task 8.1.3: Token Middleware (2h)**

- [ ] Create `AuthenticateApiToken` middleware
- [ ] Check `Authorization: Bearer {token}` header
- [ ] Validate token exists and not expired
- [ ] Check permissions for route
- [ ] Update `last_used_at`
- [ ] Rate limit by token

---

### 8.2 Public API Endpoints

**Task 8.2.1: API Routes (1h)**

```php
// routes/api.php
Route::prefix('v1')->middleware('auth:api-token')->group(function () {
    // Pages
    Route::get('pages', [ApiPageController::class, 'index']);
    Route::get('pages/{slug}', [ApiPageController::class, 'show']);

    // Collections
    Route::get('collections/{slug}', [ApiCollectionController::class, 'index']);
    Route::get('collections/{slug}/{id}', [ApiCollectionController::class, 'show']);

    // Components (optional - if you want raw component data)
    Route::get('components/{slug}', [ApiComponentController::class, 'show']);

    // Media
    Route::get('media/{id}', [ApiMediaController::class, 'show']);
});
```

**Task 8.2.2: API Page Controller (3h)**

- [ ] Create `Api/V1/PageController`
- [ ] `index()`: Return all published pages
    ```php
    public function index(Request $request)
    {
        $pages = Page::published()
            ->with(['components.fields'])
            ->when($request->input('homepage'), fn($q) => $q->homepage())
            ->get();

        return PageApiResource::collection($pages);
    }
    ```
- [ ] `show($slug)`: Return single page with all components and data
- [ ] Include component data in response
- [ ] Format dates consistently (ISO 8601)
- [ ] Add pagination for index

**Task 8.2.3: API Collection Controller (2h)**

- [ ] Create `Api/V1/CollectionController`
- [ ] `index($slug)`: Return all published items in collection
- [ ] `show($slug, $id)`: Return single collection item
- [ ] Support filtering, sorting, pagination
- [ ] Return formatted data based on field types

**Task 8.2.4: API Resources (4h)**

- [ ] Create `PageApiResource`:
    ```php
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'is_homepage' => $this->is_homepage,
            'published_at' => $this->published_at?->toIso8601String(),
            'components' => $this->components->map(function ($component) {
                return [
                    'type' => $component->slug,
                    'data' => $this->formatComponentData($component),
                ];
            }),
            'seo' => [
                'title' => $this->seo_title,
                'description' => $this->seo_description,
            ],
        ];
    }
    ```
- [ ] Create `CollectionApiResource`
- [ ] Create `MediaApiResource`
- [ ] Ensure consistent JSON structure

---

### 8.3 Response Caching

**Task 8.3.1: Cache Implementation (3h)**

- [ ] Cache page responses in Redis
- [ ] Cache collection responses
- [ ] Set TTL (e.g., 1 hour)
- [ ] Cache key based on URL + query params
- [ ] Invalidate cache on content update:
    ```php
    // In PageController@update
    Cache::tags(['pages', "page:{$page->id}"])->flush();
    ```

**Task 8.3.2: Cache Middleware (1h)**

- [ ] Create `CacheApiResponse` middleware
- [ ] Check cache before processing
- [ ] Store response in cache
- [ ] Add cache headers (ETag, Last-Modified)

---

### 8.4 Rate Limiting

**Task 8.4.1: Rate Limit Configuration (2h)**

- [ ] Configure rate limits in `RouteServiceProvider`:
    ```php
    RateLimiter::for('api', function (Request $request) {
        return $request->user()
            ? Limit::perMinute(1000)->by($request->user()->id)
            : Limit::perMinute(60)->by($request->ip());
    });
    ```
- [ ] Different limits for authenticated vs anonymous
- [ ] Per-token limits
- [ ] Return 429 with Retry-After header

---

### 8.5 Webhooks

**Task 8.5.1: Webhooks Table (1h)**

```php
Schema::create('webhooks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('url');
    $table->json('events'); // ['page.published', 'collection.updated']
    $table->string('secret')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

Schema::create('webhook_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('webhook_id')->constrained()->cascadeOnDelete();
    $table->string('event');
    $table->integer('status_code')->nullable();
    $table->text('response')->nullable();
    $table->timestamp('sent_at');
    $table->timestamps();
});
```

**Task 8.5.2: Webhook Management UI (4h)**

- [ ] Create `Settings/Webhooks.jsx`
- [ ] List webhooks
- [ ] Create webhook form
- [ ] Select events to listen to
- [ ] Test webhook button
- [ ] View delivery logs
- [ ] Enable/disable toggle

**Task 8.5.3: Webhook Dispatcher (3h)**

- [ ] Create `WebhookService`
- [ ] Dispatch webhook on events:
    ```php
    // In PageController@publish
    WebhookService::dispatch('page.published', $page);
    ```
- [ ] Queue webhook calls (don't block requests)
- [ ] Sign payload with HMAC
- [ ] Retry on failure (3 attempts)
- [ ] Log all attempts

---

### 8.6 API Documentation

**Task 8.6.1: OpenAPI/Swagger Setup (4h)**

- [ ] Install `darkaonline/l5-swagger`
- [ ] Annotate API controllers with docblocks
- [ ] Generate OpenAPI spec
- [ ] Create documentation UI at `/api/documentation`
- [ ] Include examples for each endpoint
- [ ] Document authentication

**Task 8.6.2: API Documentation Page (3h)**

- [ ] Create user-friendly API docs page in admin
- [ ] Show available endpoints
- [ ] Show example requests/responses
- [ ] Interactive API explorer (optional)
- [ ] Link to Swagger docs

---

### 8.7 Testing (4h)

- [ ] Test API authentication
- [ ] Test all endpoints
- [ ] Test caching
- [ ] Test rate limiting
- [ ] Test webhooks
- [ ] Test permissions

**Phase 8 Total: ~40-45 hours**

---

## PHASE 9: Polish & Optimization (Week 9)

### 9.1 Performance Optimization

**Task 9.1.1: Database Optimization (3h)**

- [ ] Add indexes:

    ```php
    // collections table
    $table->index('slug');
    $table->index('is_active');

    // pages table
    $table->index(['status', 'published_at']);
    $table->index('is_homepage');

    // media table
    $table->index('mime_type');
    $table->index('folder');

    // collection_items table
    $table->index(['collection_id', 'is_published']);
    ```

- [ ] Run `EXPLAIN` on slow queries
- [ ] Add composite indexes where needed

**Task 9.1.2: N+1 Query Prevention (3h)**

- [ ] Audit all controllers for N+1 issues
- [ ] Add eager loading:
    ```php
    Page::with(['components.fields', 'creator', 'updater'])->get();
    Collection::with(['fields', 'items'])->get();
    ```
- [ ] Use `withCount()` for counts
- [ ] Install Laravel Debugbar to detect N+1s

**Task 9.1.3: Frontend Performance (4h)**

- [ ] Code splitting (lazy load routes)
- [ ] Optimize images (WebP, lazy loading)
- [ ] Minify JS/CSS bundles
- [ ] Tree shake unused code
- [ ] Add loading skeletons
- [ ] Implement virtual scrolling for long lists
- [ ] Debounce search inputs

**Task 9.1.4: Caching Strategy (2h)**

- [ ] Cache frequently accessed data
- [ ] Cache component schemas
- [ ] Cache collection definitions
- [ ] Implement cache warming on deploy
- [ ] Add cache clear command

---

### 9.2 UX Improvements

**Task 9.2.1: Loading States (3h)**

- [ ] Add loading spinners/skeletons everywhere
- [ ] Optimistic updates where appropriate
- [ ] Progress indicators for uploads
- [ ] Disable buttons during submission
- [ ] Show "Saving..." indicators

**Task 9.2.2: Error Handling (3h)**

- [ ] Friendly error messages
- [ ] Error boundary components
- [ ] 404 page
- [ ] 500 error page
- [ ] Network error handling
- [ ] Retry failed requests
- [ ] Show validation errors clearly

**Task 9.2.3: Toast Notifications (2h)**

- [ ] Consistent toast system
- [ ] Success toasts (green)
- [ ] Error toasts (red)
- [ ] Info toasts (blue)
- [ ] Warning toasts (yellow)
- [ ] Auto-dismiss after 3-5 seconds
- [ ] Stackable toasts

**Task 9.2.4: Keyboard Shortcuts (3h)**

- [ ] Ctrl+S to save
- [ ] Ctrl+K for search
- [ ] Esc to close modals
- [ ] Arrow keys for navigation
- [ ] Show shortcuts help (Ctrl+?)
- [ ] Implement with `react-hotkeys-hook`

**Task 9.2.5: Tooltips & Help Text (2h)**

- [ ] Add tooltips throughout UI
- [ ] Help icons with explanations
- [ ] Contextual help text
- [ ] Onboarding tooltips for new users
- [ ] "What's this?" links

**Task 9.2.6: Empty States (2h)**

- [ ] Design beautiful empty states
- [ ] Clear call-to-action
- [ ] Illustrations (optional)
- [ ] Helpful text
- [ ] Quick start buttons

**Task 9.2.7: Confirmation Dialogs (2h)**

- [ ] Confirm destructive actions
- [ ] "Are you sure?" for delete
- [ ] Unsaved changes warning
- [ ] Use shadcn AlertDialog
- [ ] Keyboard support (Enter/Esc)

---

### 9.3 Accessibility

**Task 9.3.1: Semantic HTML (2h)**

- [ ] Use proper heading hierarchy
- [ ] Use semantic elements (nav, main, aside, etc.)
- [ ] Proper form labels
- [ ] ARIA labels where needed
- [ ] Skip navigation link

**Task 9.3.2: Keyboard Navigation (2h)**

- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators
- [ ] Tab order makes sense
- [ ] Modal focus trapping
- [ ] Esc to close modals/dropdowns

**Task 9.3.3: Screen Reader Support (2h)**

- [ ] ARIA landmarks
- [ ] Alt text for images
- [ ] Screen reader announcements
- [ ] Form field descriptions
- [ ] Test with screen reader

**Task 9.3.4: Color Contrast (1h)**

- [ ] Check all text meets WCAG AA standards
- [ ] Don't rely on color alone
- [ ] Test with color blindness simulator
- [ ] Sufficient contrast ratios

---

### 9.4 Security Hardening

**Task 9.4.1: Security Headers (1h)**

- [ ] Set Content-Security-Policy
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin
- [ ] Permissions-Policy

**Task 9.4.2: Input Sanitization (2h)**

- [ ] Sanitize all user inputs
- [ ] Strip dangerous HTML tags
- [ ] Prevent XSS attacks
- [ ] SQL injection prevention (use Eloquent)
- [ ] CSRF protection on all forms

**Task 9.4.3: File Upload Security (2h)**

- [ ] Validate MIME types server-side
- [ ] Check file extensions
- [ ] Scan for malware (optional)
- [ ] Prevent path traversal
- [ ] Store uploads outside webroot (or use signed URLs)

**Task 9.4.4: Rate Limiting (1h)**

- [ ] Rate limit login attempts
- [ ] Rate limit password reset
- [ ] Rate limit API calls
- [ ] Rate limit file uploads

---

### 9.5 Testing Suite

**Task 9.5.1: Unit Tests (6h)**

- [ ] Test all models
- [ ] Test all services
- [ ] Test all helpers
- [ ] Test enums
- [ ] Test resources
- [ ] Aim for 80%+ code coverage

**Task 9.5.2: Feature Tests (6h)**

- [ ] Test all API endpoints
- [ ] Test authentication flows
- [ ] Test CRUD operations
- [ ] Test permissions
- [ ] Test validation
- [ ] Test edge cases

**Task 9.5.3: Frontend Tests (4h)**

- [ ] Test critical user flows
- [ ] Test form submissions
- [ ] Test validation
- [ ] Test component rendering
- [ ] Use React Testing Library

**Task 9.5.4: E2E Tests (4h - Optional)**

- [ ] Set up Cypress or Playwright
- [ ] Test complete user journeys
- [ ] Test login flow
- [ ] Test page creation
- [ ] Test content publishing

---

### 9.6 Documentation

**Task 9.6.1: User Documentation (6h)**

- [ ] Getting started guide
- [ ] Creating collections tutorial
- [ ] Creating components tutorial
- [ ] Building pages tutorial
- [ ] Media library guide
- [ ] User management guide
- [ ] API usage guide
- [ ] FAQ section
- [ ] Screenshots/videos

**Task 9.6.2: Developer Documentation (4h)**

- [ ] Installation instructions
- [ ] Environment configuration
- [ ] Database setup
- [ ] Development workflow
- [ ] Testing instructions
- [ ] Deployment guide
- [ ] Architecture overview
- [ ] Code style guide
- [ ] Contributing guidelines

**Task 9.6.3: API Documentation (3h)**

- [ ] Complete endpoint reference
- [ ] Authentication guide
- [ ] Example requests/responses
- [ ] Error codes reference
- [ ] Rate limiting info
- [ ] Webhook documentation
- [ ] Code examples (cURL, JS, PHP)

---

### 9.7 Deployment Preparation

**Task 9.7.1: Environment Configuration (2h)**

- [ ] Create `.env.example` with all vars
- [ ] Document required environment variables
- [ ] Set up production `.env`
- [ ] Configure mail settings
- [ ] Configure storage (S3, etc.)
- [ ] Configure Redis
- [ ] Configure queue driver

**Task 9.7.2: Build Process (2h)**

- [ ] Create production build script
- [ ] Optimize assets
- [ ] Run migrations
- [ ] Seed initial data
- [ ] Clear/cache routes and config
- [ ] Test production build

**Task 9.7.3: Server Setup (3h)**

- [ ] Install PHP 8.2+
- [ ] Install Composer
- [ ] Install Node.js
- [ ] Configure Nginx/Apache
- [ ] Set up SSL certificate
- [ ] Configure firewall
- [ ] Set up supervisor for queues

**Task 9.7.4: Deployment Automation (3h)**

- [ ] Create deployment script
- [ ] Zero-downtime deployment
- [ ] Automated backups
- [ ] Rollback procedure
- [ ] Health checks
- [ ] Use Deployer, Envoyer, or custom script

---

### 9.8 Monitoring & Logging

**Task 9.8.1: Error Tracking (2h)**

- [ ] Set up Sentry or similar
- [ ] Track backend errors
- [ ] Track frontend errors
- [ ] Set up alerts
- [ ] Log to external service

**Task 9.8.2: Application Logging (2h)**

- [ ] Configure Laravel logging
- [ ] Log important events
- [ ] Log authentication attempts
- [ ] Log API calls
- [ ] Rotate logs
- [ ] Send logs to centralized service

**Task 9.8.3: Performance Monitoring (2h)**

- [ ] Set up APM (New Relic, Scout, etc.)
- [ ] Monitor response times
- [ ] Monitor database queries
- [ ] Monitor memory usage
- [ ] Set up alerts for slow requests

---

### 9.9 Final Polish

**Task 9.9.1: Code Cleanup (3h)**

- [ ] Remove unused code
- [ ] Remove console.logs
- [ ] Remove TODOs
- [ ] Format all code consistently
- [ ] Run linters
- [ ] Fix all warnings

**Task 9.9.2: UI Polish (4h)**

- [ ] Consistent spacing
- [ ] Consistent colors
- [ ] Smooth animations
- [ ] Responsive design check
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Dark mode (optional)

**Task 9.9.3: Final Testing (4h)**

- [ ] Complete QA pass
- [ ] Test on different devices
- [ ] Test with different data volumes
- [ ] Test edge cases
- [ ] Security audit
- [ ] Performance audit

---

## Phase 9 Checklist

- [ ] Performance optimized
- [ ] All UX improvements implemented
- [ ] Accessibility standards met
- [ ] Security hardened
- [ ] Test suite complete (80%+ coverage)
- [ ] Documentation complete
- [ ] Deployment process defined
- [ ] Monitoring set up
- [ ] Production-ready

**Phase 9 Total: ~70-80 hours**

---

## 🎉 PROJECT COMPLETE!

**Total Estimated Time: 400-450 hours (10-12 weeks)**

### Post-Launch Tasks

- [ ] Monitor error rates
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Plan v2 features
- [ ] Regular maintenance
- [ ] Security updates

### Optional Future Enhancements

- [ ] Multi-language content
- [ ] Content scheduling
- [ ] Workflow/approval system
- [ ] Advanced permissions
- [ ] Content preview
- [ ] A/B testing
- [ ] Analytics integration
- [ ] GraphQL API
- [ ] Mobile app
- [ ] AI content suggestions

---

## Summary of All Files Created

1. **00-development-plan.md** - Overall project plan
2. **01-setup-authentication.md** - Phase 1 detailed tasks
3. **02-data-models.md** - Phase 2 detailed tasks
4. **03-collections.md** - Phase 3 detailed tasks
5. **04-components.md** - Phase 4 detailed tasks
6. **05-pages-media-users.md** - Phases 5-7 combined
7. **06-api-polish-deployment.md** - Phases 8-9 combined

**You now have a complete, actionable development plan to build your headless CMS!**
