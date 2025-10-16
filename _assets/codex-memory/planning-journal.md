# Codex Planning Journal

This file holds **detailed reasoning, reflections, and long-form notes**.  
Use it to record comparisons, architectural justifications, or strategic thoughts that extend beyond the immediate checklist.

---

## 🏗️ Architectural Reflections

Document architectural reasoning and tradeoffs here.

> Example:
>
> - Vanilla CMS uses direct PHP templating; Laravel version moves toward Blade + Inertia.
> - Decision: Retain Blade compatibility for server-side rendering, while exposing headless API for frontends.

### [2025-10-16] Content Domain Assessment
- Laravel project currently stops at partial migrations; collections/components tables lack activation flags and soft deletes, blocking parity with vanilla archival features.
- Decided to organise domain layer into models + services (ComponentBuilder, Versioning, Slug) so controllers stay thin and reusable for both Inertia and API endpoints.
- Headless toggle will live in settings table with middleware guarding `/api/v1/*`, enabling enterprise deployments to disable public API quickly.
- Implemented settings table + factories today; future step is to seed defaults for headless mode, draft preview, and media settings.
- Component API now returns structured resources mirroring vanilla schema; duplication handled server-side to align with builder UX. Need equivalent service for collections next so list/detail flows match.
- Collections API now mirrors vanilla definitions and blocks deletion when items exist. Next similar builder service required for page composition so admin UI can treat collections/pages sym sym.

---

## 🧩 Concept Transfers from Vanilla to Laravel

- Component system concept: dynamic JSON schema per component type.
- Field management logic: use normalized storage instead of serialized arrays.
- Drag-and-drop ordering: leverage Vue/React drag API with Inertia bridge.
- Conditional visibility rules from vanilla `component-builder-scripts.php` map nicely to a PHP service + React hook pair; plan to serialise rule groups alongside schema metadata.
- Vanilla media library already stores derivative info; Laravel migration will track `metadata` JSON plus `folder`, enabling filters and future CDN integration.

---

## 💡 UX and UI Observations

- Markdown field types need dual-mode editor (plain + preview).
- Image field UX: consider gallery picker with multi-upload.
- Conditional logic fields must maintain reactive dependencies.
- Builder workspace should follow three-panel layout (palette / canvas / inspector) with responsive fallback; shadcn `Sheet` component is a good fit for small screens.
- Admin header currently uses hard-coded user info—needs Inertia shared props and proper logout route usage to avoid console warnings.

---

## 🔮 Next-Stage Vision

> Future features to explore or refine.

- Versioning and rollback per page.
- Role-based permissions on component types.
- Live preview integration using Inertia hot-reload.
- Snapshot testing pipeline: export page JSON + rendered Blade HTML each release to guard against schema regressions.

---

_(Codex appends new sections as needed, referencing relevant tasks or commits.)_
- Page API now snapshots versions automatically on create/update and guards homepage uniqueness; media endpoints handle storage abstraction with lightweight metadata. Next architectural focus: expose headless JSON endpoints and align React builder to new API contracts.
- React builder workspace now mirrors vanilla UX: palette/sidebar/canvas/inspector, saving directly to `/bo/components`. Next UI step is extending similar patterns to collections/pages and adding live previews.
