# Laravel CMS — Implementation Checklist

## 1. Foundation & Environment
- [ ] Confirm Laravel Herd, Docker DB, and queue services are running; document `.env` settings for Sanctum, Google2FA, storage, and headless toggle.
- [ ] Run `php artisan migrate:fresh --seed` after completing schema fixes to validate migrations and seeders.
- [ ] Execute `vendor/bin/pint --dirty` and `npm run lint` before each commit to keep styling consistent.

## 2. Data Layer Readiness
- [ ] Complete all CMS migrations (collections, component_fields, page_components, page_versions, media, settings) with indexes and soft deletes.
- [ ] Generate Eloquent models + factories for collections, components, items, pages, media, and settings with required casts (`DataType`, JSON).
- [ ] Implement import command to migrate vanilla data (components, pages, media metadata) and verify row counts match source.

## 3. Services & Business Logic
- [ ] Ship `ComponentBuilderService`, `SlugService`, `VersioningService`, and `ConditionalVisibilityService` with Pest unit tests.
- [ ] Add policies/guards using Spatie Permission (roles: admin, editor, author) and gate controller actions accordingly.
- [ ] Configure media storage jobs for thumbnail generation and orphan cleanup.

## 4. API & Inertia Controllers
- [ ] Create admin controllers (`CollectionController`, `ComponentController`, `PageController`, `MediaController`) returning JSON + Inertia responses.
- [ ] Add API resources/transformers with pagination support and ensure Wayfinder route helpers regenerate without name collisions.
- [ ] Implement `/api/v1/...` headless endpoints protected by Sanctum and feature flag middleware.

## 5. Frontend Builder & Forms
- [ ] Build shared form components under `resources/js/components/forms/` for each DataType (text, markdown, list, collection, media, boolean, date).
- [ ] Implement drag-and-drop builder canvas using @dnd-kit with autosave + validation feedback.
- [ ] Replace placeholder navigation and header logic with real user context, breadcrumbs, and logout flows.

## 6. Media Experience
- [ ] Create media library modal with upload queue, filters, and reorderable gallery support.
- [ ] Integrate upload endpoints with signed URLs, progress indicators, and failure retries.
- [ ] Provide image transformations (thumbnails, webp) and expose URLs via accessors on `Media`.

## 7. Rendering & Headless Parity
- [ ] Develop Blade components mirroring component schemas for SSR; ensure JSON schema exported to React matches PHP definition.
- [ ] Add page preview endpoint that renders selected version (draft/published) via Inertia and headless API.
- [ ] Implement cache strategy (per-page + per-collection) invalidated on content updates.

## 8. QA & Tooling
- [ ] Write Pest feature tests covering CRUD, visibility, media uploads, and headless API responses.
- [ ] Add browser tests for builder interactions (create component, reorder fields, upload media).
- [ ] Update `_assets/codex-memory/memory-log.md` and `current-context.md` after each milestone; capture known issues in `planning-journal.md`.

---

✅ **Output goal:** Track progress across schema, services, frontend, and QA to guarantee feature parity with the vanilla CMS and readiness for headless delivery.
