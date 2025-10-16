# Laravel CMS — Implementation Checklist

## 1. Project Setup

- [ ] Confirm Laravel Herd environment and Docker DB connection.
- [ ] Ensure migrations and seeders are synced.

## 2. Architecture

- [ ] Align folder structure with defined architecture plan.
- [ ] Validate model and relationship consistency.
- [ ] Apply naming conventions and PSR standards.

## 3. Components

- [ ] Migrate existing vanilla components.
- [ ] Add drag-and-drop ordering and visibility logic.
- [ ] Test rendering via Blade and API.

## 4. Fields & Media

- [ ] Support all field types (`text`, `number`, `boolean`, `date`, `media`, `select`, `list`, `textarea`, `markdown`).
- [ ] Implement conditional field logic.
- [ ] Enable multi-upload and image reordering.

## 5. UX / UI

- [ ] Apply Shadcn UI design system.
- [ ] Optimize component editor UX.
- [ ] Ensure accessibility and responsiveness.

## 6. Headless Mode

- [ ] Add toggle to enable/disable API endpoints.
- [ ] Test endpoint responses for all content types.

## 7. Testing & QA

- [ ] Verify CRUD operations across collections and components.
- [ ] Validate data synchronization with headless API.
- [ ] Test rendering via Blade components and React.

---

✅ **Output goal:**  
Provide a complete, actionable checklist to validate migration and refinement progress.
