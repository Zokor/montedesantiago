Para criar e update: docker-compose up --build -d

# Monte de Santiago — CMS Architecture Review & Migration Plan

## Local Setup

The local development environment runs on **Laravel Herd**.  
The database is already running in Docker — no additional setup or migration commands are required.

---

## Role

You are an **expert CMS architect and full-stack developer** with deep experience in:

- PHP and Laravel 12
- Shadcn UI + TailwindCSS
- Inertia.js + React 19
- Headless CMS design inspired by Strapi 5 and Payload CMS

---

## Context

This project originated as a **vanilla PHP CMS** built with Alpine.js and TailwindCSS.  
A new **Laravel-based CMS** is being developed, reusing and improving on concepts from the vanilla version.

Your mission is to **review, compare, and create a structured plan** for refining and migrating the best parts of the vanilla CMS into the Laravel CMS.

---

## Reference Files & Directories

You have access to the following:

- `/vanilla-cms/` → all files of the original CMS
- `/` → the Laravel 12 project currently in progress
- `/_assets/tasks/START-HERE.md`
- `/_assets/tasks/00-development-plan.md`
- `/_assets/tasks/01-setup-authentication.md`
- `/_assets/tasks/02-data-models.md`
- `/_assets/tasks/03-collections.md`
- `/_assets/tasks/04-components.md`
- `/_assets/tasks/05-pages-media-users.md`
- `/_assets/tasks/06-api-polish.md`
- `/_assets/tasks/api-specification.md`
- `/_assets/tasks/database-schema.md`
- `/_assets/prompt-plans/prompts.md` → chronological plan used to build both CMS versions (currently up to Prompt 2.3)

---

## Objectives

1. **Analyze**  
   Examine the current structure and logic of the **vanilla CMS**, including:
    - Component model and organization
    - Field types and editing UI
    - Media handling and UX flow

2. **Compare**  
   Evaluate the Laravel CMS progress against the `prompts.md` and all relevant task files.

3. **Identify Gaps & Improvements**  
   Determine what has been achieved, what’s missing, and where performance, UX, or maintainability can be improved.

4. **Define Refinement & Migration Strategy**  
   Establish a unified approach in the Laravel CMS that includes:
    - Support for both **standard website rendering** (via Blade components) and **headless API mode**.
    - Modular **component system** with drag-and-drop ordering.
    - Full support for field types:  
      `text`, `number`, `boolean`, `date`, `media`, `select`, `list`, `textarea`, `markdown`.
    - **Media management**: multi-upload and drag-and-drop image reordering.
    - **Conditional fields logic**: dynamically show or hide fields based on other values.

5. **Produce a Structured Plan**  
   Write one or more `.md` files in a new directory:

    ```
    /_assets/laravel-refinement-plan/
        ├── architecture.md
        ├── migration-steps.md
        ├── ui-ux-improvements.md
        └── checklist.md
    ```

    Each file must include clear, numbered action items and implementation notes that can be directly executed by developers.

---

## Deliverables

- A **modular, actionable plan** to continue Laravel CMS development from its current state.
- Explicit verification of `prompts.md` ensuring no features or logic were lost from the vanilla CMS.
- Recommendations for:
    - Component schema normalization.
    - Improved UX using **Shadcn UI + React**.
    - Optional **API toggle** for headless functionality.
    - Maintainability, scalability, and code reusability best practices.

---

## 🧠 Persistent Local Memory (Codex Journal System)

To maintain continuity between sessions, Codex must record its reasoning, findings, and decisions in Markdown files inside the project.  
This allows all progress to be version-controlled, transparent, and reusable for future analysis.

Create the following structure if not present:

```
/_assets/codex-memory/
    ├── memory-log.md
    ├── current-context.md
    └── planning-journal.md
```

### Instructions for Memory Usage

1. **After each major analysis or planning step**, append a summary to:

    ```
    /_assets/codex-memory/memory-log.md
    ```

    Format example:

    ```markdown
    ### [2025-10-16 12:34]

    **Task:** Reviewed Vanilla CMS component schema  
    **Outcome:** Identified missing conditional logic and planned field types expansion  
    **Next Steps:** Integrate into Laravel refinement plan step 3
    ```

2. **Keep the current working state** (summary of current objectives, pending actions, and current stage) updated in:

    ```
    /_assets/codex-memory/current-context.md
    ```

3. **Use `planning-journal.md`** for detailed reflections, comparisons, or architectural reasoning that needs to be revisited.

4. At the start of each new session:
    - Read `current-context.md` to reestablish continuity.
    - Review the last entries of `memory-log.md` before continuing work.
    - Write any updates or insights as new sections appended to `memory-log.md`.

This system replaces the need for external persistent memory (like Context7) and keeps all project reasoning fully local and auditable.

---

## Output

Generate all resulting `.md` files in:  
`/_assets/laravel-refinement-plan/`

Each file must be **self-contained**, properly titled, and ready for direct inclusion in the Laravel repository.  
Also append a summary of the planning progress to `/_assets/codex-memory/memory-log.md` and update `current-context.md` with the latest state.

---

## Notes

- Assume **Herd** is running the Laravel environment.
- The database is already active (Docker).
- Focus on CMS architecture, UX, and feature parity — not setup scripts.
- Prioritize developer experience (DX), maintainability, and modularity.
- Follow Laravel 12 + Inertia.js conventions, and integrate Shadcn UI principles for the admin experience.
- Maintain consistent naming and directory structures across CMS layers.
- Suggest incremental steps wherever possible.
