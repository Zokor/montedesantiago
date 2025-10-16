# Current Context — Codex Working Memory

This file summarizes the **current active goals, context, and pending actions** in the CMS planning workflow.  
Codex should read this file at the beginning of each session to re-establish state and continuity.

---

## 🧩 Current Stage

Architecture review complete. Backend and headless APIs plus component builder UI exist; upcoming work focuses on vanilla data import, enhanced frontend flows for collections/pages, and end-to-end testing.

---

## 🎯 Active Objectives

- [x] Wire admin/API controllers and resources for components, collections, pages, media, and headless delivery.
- [x] Design React builder workspace (palette/canvas/inspector) and DataType form components leveraging shadcn + @dnd-kit.
- [ ] Deliver import routines / seeders to map vanilla CMS data into the new schema.
- [ ] Author Pest tests covering remaining modules, services, and import routines (beyond current happy paths).
- [ ] Extend frontend to manage collections/pages (list + edit) reusing new APIs.

---

## ⚙️ Pending or Follow-up Actions

- [ ] Map vanilla component data to new schema during import command development.
- [ ] Plan Blade rendering layer that mirrors headless JSON schema for front-end parity.
- [ ] Draft testing matrix (feature + browser tests) covering builder workflows and media uploads.
- [ ] Expose version preview endpoints once frontend preview workflow is defined.

---

## 📎 References

- Related planning files: `/_assets/tasks/04-components.md`, `/_assets/tasks/05-pages-media-users.md`
- Last memory log entry: `/_assets/codex-memory/memory-log.md`
- Current working branch: _(Codex can append branch info here if relevant)_

---

_(Codex updates this file whenever goals or progress changes.)_
