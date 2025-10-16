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

---

## 🧩 Concept Transfers from Vanilla to Laravel

- Component system concept: dynamic JSON schema per component type.
- Field management logic: use normalized storage instead of serialized arrays.
- Drag-and-drop ordering: leverage Vue/React drag API with Inertia bridge.

---

## 💡 UX and UI Observations

- Markdown field types need dual-mode editor (plain + preview).
- Image field UX: consider gallery picker with multi-upload.
- Conditional logic fields must maintain reactive dependencies.

---

## 🔮 Next-Stage Vision

> Future features to explore or refine.

- Versioning and rollback per page.
- Role-based permissions on component types.
- Live preview integration using Inertia hot-reload.

---

_(Codex appends new sections as needed, referencing relevant tasks or commits.)_
