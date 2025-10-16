# Laravel CMS — UI & UX Improvements Plan

## 1. Current UX Snapshot
1. **Vanilla CMS:** Alpine-driven component builder already delivers drag-and-drop reordering, multilingual inputs, conditional visibility, and media previews (`vanilla-cms/includes/component-builder-scripts.php`).
2. **Laravel CMS:** Admin shell (`resources/js/components/Layout/*.jsx`) renders navigation and header, but module links are static, user context is mocked, and builder/editor screens are absent.
3. **Field Editing:** React form components for DataType inputs, markdown editors, and media uploaders have not been created; login form uses shadcn components but lacks consistent design tokens elsewhere.
4. **Media UX:** No uploader UI is implemented; vanilla’s multi-upload experience with existing file manager is not replicated.

## 2. UX / Design Goals
1. Provide a modern, consistent editorial experience using shadcn UI primitives with Tailwind v4 tokens and dark-mode parity.
2. Recreate and extend vanilla builder ergonomics (drag-and-drop, conditional visibility, inline help) within Inertia + React.
3. Support fast content entry with autosave/optimistic feedback, thorough validation messaging, and keyboard-accessible flows.
4. Ensure headless/preview parity: editors should preview components/pages exactly as headless consumers receive them.

## 3. High-Priority Improvements
### 3.1 Component & Collection Builder
1. Implement a reusable builder workspace (sidebar palette + central canvas + inspector) using shadcn `Tabs`, `Sheet`, and @dnd-kit for drag/drop ordering.
2. Port vanilla conditional visibility rules into a React hook (`useConditionalVisibility`) fed by backend schema metadata.
3. Add field-level helpers: inline markdown toolbar, JSON schema viewer, referenced collection lookup with previews.

### 3.2 Media Management
1. Build a media library modal with grid/list toggle, filters (type, uploader, folder), and pagination backed by headless API endpoints.
2. Add drag-and-drop upload zone with progress indicators, error toasts, and reorderable galleries for multi-image fields.
3. Support existing asset selection from vanilla uploads by displaying metadata (dimensions, size) and thumbnail previews.

### 3.3 Navigation & Layout
1. Replace hard-coded hrefs in `Sidebar.jsx` and `Header.jsx` with Wayfinder route helpers to avoid broken navigation during route refactors.
2. Inject real user context (name, avatar, roles) into header dropdown; connect logout button to `logout.form` helper.
3. Add breadcrumbs derived from Inertia shared props and show status chips (Draft/Published) for pages and collections.

### 3.4 Interaction Patterns
1. Standardize forms on the Inertia `<Form>` component or `useForm` hook with consistent validation/error messaging.
2. Provide save/preview/schedule buttons with clear states (processing, success, failure) and toast feedback via shadcn `Toast`.
3. Introduce autosave checkpoints for drafts and visual indicators for unsaved changes.

## 4. Implementation Roadmap
1. **Design Tokens:** Establish Tailwind theme scales (spacing, typography, color) and shadcn config baseline; update existing layout components to use shared tokens.
2. **Component Library:** Create `resources/js/components/forms/` with DataType-specific editors (text, markdown, media, list, collection selector) sharing consistent props and skeleton loaders.
3. **Builder Screens:** Develop Inertia pages for Collections/Components/Pages that compose the builder, inspector, and media modals; ensure responsive layout for tablet editing.
4. **Feedback & Accessibility:** Add focus outlines, ARIA roles, keyboard shortcuts (e.g., reorder with arrow keys), and reduce motion options.
5. **Testing:** Write browser tests covering drag-and-drop reordering, conditional visibility, and media upload flows; add unit tests for visibility hook logic.

---

✅ **Output goal:** Ship a cohesive shadcn-driven editorial UX that matches (and improves upon) the vanilla CMS experience while integrating tightly with Laravel + Inertia APIs.
