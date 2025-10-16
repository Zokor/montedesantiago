Para criar e update: docker-compose up --build -d

# Monte de Santiago

Initiate Database - docker-compose exec webserver php artisan migrate
Update Database - docker-compose exec webserver php artisan db:seed

php artisan db:seed

# Role

You are an expert CMS architect and full-stack developer with deep experience in:

- PHP and Laravel 12
- Shadcn UI + TailwindCSS
- Inertia.js + React 19
- Headless CMS design inspired by Strapi 5 and Payload CMS

# Context

This project started as a **vanilla PHP CMS** using Alpine.js and TailwindCSS.
A **Laravel-based version** is now being built, reusing and refining the concepts developed in the vanilla version.

Your goal is to **review, compare, and produce a concrete plan** for refining and migrating the best parts of the vanilla CMS into the Laravel CMS.

You will have access to:

- `/vanilla-cms/` → all the files of the original CMS
- `/` → the Laravel 12 project currently in progress
- `/_assets/tasks/START-HERE.md` → plan file
- `/_assets/tasks/00-development-plan.md` → plan file
- `/_assets/tasks/01-setup-authentication.md` → plan file
- `/_assets/tasks/02-data-models.md` → plan file
- `/_assets/tasks/03-collections.md` → plan file
- `/_assets/tasks/04-components.md` → plan file
- `/_assets/tasks/05-pages-media-users.md` → plan file
- `/_assets/tasks/05-pages-media-users.md` → plan file
- `/_assets/tasks/06-api-polish.md` → plan file
- `/_assets/tasks/api-specification.md` → plan file
- `/_assets/tasks/database-schema.md` → plan file
- `/_assets/prompt-plans/prompts.md` → the chronological plan used to build both, up to “Prompt 2.3” so far

# Objectives

1. **Analyze** the current state of the vanilla CMS (structure, components, field types, UX flow).
2. **Compare** it with the Laravel CMS implementation progress and the steps in `prompts.md`.
3. **Identify** what was achieved, what’s missing, and what can be improved (in UX, architecture, performance, and maintainability).
4. **Define** how to migrate or refine these concepts in the Laravel project:
    - Support for both **standard website pages** (via Blade components) and **headless mode** (API endpoints).
    - Modular **component system** with drag-and-drop ordering.
    - **Field types**: text, number, boolean, date, media, select, list, textarea, and markdown.
    - **Media management** with multi-upload and drag-and-drop image reordering.
    - Conditional fields logic (show/hide depending on other field values).
5. **Write your plan** in one or more files in a new directory:
    - `/_assets/laravel-refinement-plan/architecture.md`
    - `/_assets/laravel-refinement-plan/migration-steps.md`
    - `/_assets/laravel-refinement-plan/ui-ux-improvements.md`
    - `/_assets/laravel-refinement-plan/checklist.md`

Each file should have clear, numbered action items and implementation notes that can be directly followed.

# Deliverables

- A structured and modular plan to continue the Laravel CMS from its current stage.
- Explicit verification of `prompts.md` to ensure nothing critical from the vanilla CMS was lost.
- Recommendations for:
    - Component schema normalization.
    - Improved UX with Shadcn UI + React.
    - Optional API toggle for headless mode.
    - Best practices for maintainability and scalability.

# Output

Generate all resulting `.md` plan files in the `/_assets/laravel-refinement-plan/` directory.
Each file should be self-contained and ready to be copied into the Laravel project repository.
