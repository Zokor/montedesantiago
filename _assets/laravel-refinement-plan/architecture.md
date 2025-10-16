# Laravel CMS — Architecture Review & Core Structure Plan

## 1. Current Implementation Snapshot (Laravel Project)
1. Authentication stack is active (Fortify overrides in `routes/auth.php` and controllers in `app/Http/Controllers/Auth/`), including MFA endpoints, but only `/bo/dashboard` renders via Inertia and there are no domain-specific routes yet (`routes/web.php`).
2. Content modelling is incomplete: only `collections`, `collection_fields`, `collection_items`, and `components` migrations exist, and `database/migrations/2025_10_13_143000_create_collections_table.php` and `...143300_create_components_table.php` stop mid-file (missing flags such as `is_active`, timestamps, and down-method closures).
3. No CMS models beyond `app/Models/User.php`; required models (`Collection`, `Component`, `Page`, `Media`, etc.) plus factories/seeders are absent, so Eloquent relationships and scopes are still to be defined.
4. React admin shell (`resources/js/components/Layout/*.jsx`) and auth pages exist, but collections/components/pages/media modules are placeholders with no navigation wiring to real data or API calls.
5. Services, policies, jobs, and event-driven hooks described in planning documents have not been started; the codebase lacks a dedicated domain or application layer for content operations.

## 2. Vanilla CMS & Prompt Coverage Verification
1. Vanilla component builder (`vanilla-cms/includes/component-builder-scripts.php`) already supports drag-and-drop ordering, per-field conditional visibility, multilingual values, and region support—none of which are present in the Laravel project yet.
2. Prompts 1.1–1.6 (authentication, layout, React router) are partially complete; prompts 2.1–2.6 (data models and form components) plus Phase 3 onward remain unimplemented, creating feature gaps for collections, components, media, and pages.
3. Field type coverage: vanilla supports `text`, `number`, `boolean`, `date`, `media`, `select/list`, `collection`, `richtext/markdown`, and conditional logic; Laravel enum (`app/Enums/DataType.php`) lacks markdown/rich text and default configuration metadata that vanilla relies on.
4. Media UX in vanilla (`vanilla-cms/components/area-file-upload/`) enables multi-upload, previews, and existing file selection—functionality is missing in the Laravel React layer.
5. API expectations from `/_assets/tasks/api-specification.md` and Wayfinder integration are not yet represented in routes/controllers; there is no API versioning or headless toggle implemented.

## 3. Major Architectural Gaps to Close
1. **Data Layer:** Finish and audit all CMS migrations (collections, components, pages, media, pivots, versions) with soft deletes, ordering, indexing, and foreign keys. Mirror vanilla JSON structures where content is stored.
2. **Domain Models:** Create dedicated models with casts to `DataType`, JSON columns, scopes (`published`, `active`, `homepage`), accessors for computed values, and factories for testing.
3. **Services & Actions:** Introduce services for slugging, versioning, component building, conditional evaluation, and media handling to keep controllers thin and reuse logic across Inertia and API flows.
4. **API & Routing:** Partition standard web (Blade/Inertia) routes from API endpoints under `/api/v1/...`, sharing resources/transformers and controlled via a headless feature flag stored in config or settings table.
5. **Rendering Pipeline:** Define a presenter/renderer layer that can output Blade partials for SSR and JSON payloads for headless consumers, using consistent schema definitions derived from components and fields.
6. **Frontend State Management:** Replace placeholder JSX with an Inertia + React toolkit that consumes schema metadata, supports drag-and-drop (Dnd Kit), optimistic updates, and conditional visibility logic aligned with vanilla configuration JSON.
7. **Access Control:** Align Spatie Permission roles with content modules (collections, components, media, pages) and gate operations via policies to support multi-user editorial flows from prompts/tasks.

## 4. Target Architecture Blueprint
1. **Domain Modules**
   - `app/Models/*` for Collection, Component, CollectionField, ComponentField, CollectionItem, Page, PageComponent, PageVersion, Media, Setting. Each model exposes schema helpers (e.g., `getSchema()`, `casts()`), slug generation, and relationships for eager loading.
   - `database/factories/*` to support Pest tests and seeding scenarios.
2. **Application Layer**
   - `app/Services/ComponentBuilderService`, `SlugService`, `VersioningService`, `ConditionalVisibilityService`, and `MediaLibraryService` encapsulating validation, transformations, and third-party integrations (e.g., storage, image resizing).
   - Command-style classes (e.g., `app/Actions/Collections/CreateCollection`) for complex workflows invoked by controllers or queues.
3. **Interface Layer**
   - REST + Inertia controllers in `app/Http/Controllers/Admin/` for Collections, Components, Pages, Media, Users.
   - API Resources under `app/Http/Resources/` aligned with Wayfinder route names and headless API spec; ensure JSON:API-style envelopes if required.
   - Middleware pipelines for `ensureUserIsActive`, role checks, and optional headless toggle.
4. **Presentation Layer**
   - Inertia pages under `resources/js/pages` mirroring admin modules with shared form builder components under `resources/js/components/forms/`.
   - Blade components for public rendering stored in `resources/views/components/cms/` consuming the same schema definitions to render SSR pages.
   - Shared schema serialization in `resources/js/lib/schema.ts` (generated from PHP definitions) to keep frontend/backend in sync.
5. **Configuration & Settings**
   - Centralize feature toggles (headless mode, draft preview, media drivers) in a `settings` table managed through an admin UI and cached via config repository.
6. **Testing Strategy**
   - Pest feature tests per module (collections/components/pages/media) covering CRUD, validation, conditional logic, and API responses.
   - Browser smoke tests for key admin flows (login, collection CRUD, component builder interactions).

## 5. Implementation Notes & Dependencies
1. Repair truncated migrations before proceeding; ensure every column defined in planning docs exists (e.g., `is_active`, soft deletes, `order` fields) and wrap alterations in transactions for future schema updates.
2. Extend `DataType` enum to include `MARKDOWN`/`RICH_TEXT`, and expose configuration metadata so the frontend can hydrate field defaults and validation hints.
3. Extract vanilla conditional visibility rules into a reusable PHP service so both backend validation and frontend rendering can respect `dependsOn`/`operator` logic.
4. Plan for media storage abstraction (local vs S3) using Laravel’s filesystem; align metadata structure with vanilla `upload/` conventions and support responsive image generation via Intervention Image queues.
5. Document naming conventions (snake_case table columns, kebab-case slugs, PascalCase enums) and enforce them with linters plus `vendor/bin/pint`.
6. Schedule phased delivery: finish data layer → services → API → React builder, ensuring each phase ends with automated tests and updated memory log entries.

---

✅ **Output goal:** Deliver a concrete architecture roadmap that allows developers to complete the CMS feature set while preserving vanilla CMS capabilities and supporting both SSR and headless delivery.
