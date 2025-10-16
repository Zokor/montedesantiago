# Laravel CMS — Migration & Integration Steps

## 1. Purpose
Provide an actionable sequence for moving vanilla CMS capabilities into the Laravel 12/Inertia stack while preserving data integrity, editorial workflows, and headless flexibility.

## 2. Current Status Summary
1. Core auth and admin shell exist, but CMS tables/models/services are missing or partial (see unfinished migrations under `database/migrations/2025_10_13_*.php`).
2. No data has been migrated; vanilla collections/components/pages live in JSON/PHP arrays under `vanilla-cms/`.
3. React admin pages for collections/components/pages/media are placeholders—no CRUD APIs or form builders are wired up.

## 3. Step-by-Step Migration Plan
1. **Schema Audit & Completion**
   1. Finish all planned migrations: add missing columns to `collections`, create `component_fields`, `page_components`, `page_versions`, `media`, and `settings` tables per `database-schema.md`.
   2. Re-run migrations on a fresh database to confirm schema parity; document any deviations from vanilla field names/types.
   3. Implement database-level safeguards (unique indices on slugs, composite indices on order/state columns, foreign key cascades).
2. **Eloquent Models & Factories**
   1. Generate models via `php artisan make:model` with factories (`--factory`) for each content entity.
   2. Port vanilla data structures (field definitions, page components) into model casts and helper methods (`getSchema`, `getFieldValue`).
   3. Add factories/states representing common vanilla fixtures (hero components, media galleries) for test coverage.
3. **Data Import Utilities**
   1. Build import commands (`php artisan make:command`) that read vanilla JSON/PHP config (e.g., `vanilla-cms/db/*.php`) and seed the new schema.
   2. Map vanilla field identifiers to new slugs; preserve UUIDs/order metadata where possible.
   3. Store migrated media metadata (paths, sizes) and queue regeneration of thumbnails if needed.
4. **Application Services**
   1. Implement `ComponentBuilderService`, `ConditionalVisibilityService`, `SlugService`, and `VersioningService` mirroring vanilla behaviours (drag-and-drop ordering, visibility rules, slugging).
   2. Add transaction-safe create/update operations invoked by controllers and import commands.
5. **HTTP Layer & Feature Flags**
   1. Scaffold admin controllers (`Admin\CollectionController`, etc.) returning JSON/Inertia responses per prompts.
   2. Create API resources & routes for headless consumption under `/api/v1/...`.
   3. Introduce configuration flag (`settings` table or config) to toggle headless API exposure; wrap routes with middleware checking feature state.
6. **Front-End Integration**
   1. Generate Wayfinder route helpers for new endpoints; update navigation (`Sidebar.jsx`) to use named routes instead of hard-coded hrefs.
   2. Build React form builder components mirroring vanilla UX (drag-and-drop with @dnd-kit, conditional visibility, multi-language support).
   3. Implement media uploader using signed endpoints, progress feedback, and reorderable galleries.
7. **Testing & Verification**
   1. Write Pest feature tests covering collection/component CRUD, conditional visibility, and headless API responses.
   2. Add browser tests for visual builder workflows (create component, add fields, reorder items).
   3. Validate imported vanilla data by snapshotting representative pages/components and verifying render output (Blade + API).

## 4. Data Integrity & QA Checklist
1. Backfill `deleted_at` fields for soft-deleted vanilla records before import.
2. Confirm JSON schema compatibility by running validation against DataType rules.
3. Implement audit logging (created_by/updated_by) for collections/pages to maintain history.
4. Schedule routine to prune orphaned media and regenerate derived assets after migration.

---

✅ **Output goal:** Deliver a sequenced migration strategy that developers can follow to port vanilla data, feature parity, and headless functionality into the Laravel CMS.
