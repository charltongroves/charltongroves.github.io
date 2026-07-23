---
name: add-experience
description: Adds a full-screen audiovisual experience to this site. Use when creating, importing, or registering a new experience.
---

# Add an experience

1. Create `src/experiences/<id>/package.json` with a private `@charlie/experience-<id>` package.
2. Implement `src/experiences/<id>/src/index.ts` as a default `Experience` export from `src/runtime/types.ts`.
3. Render only inside the supplied `root`. Return a controller that removes listeners, media, timers, animation frames, and DOM in `destroy()`.
4. Add a lazy import to the `experiences` registry in `src/index.ts`.
5. Put experience-only dependencies in its package, then run `pnpm install`.
6. Verify with `pnpm build`.

The host makes every root full-screen. Set `persistent: true` only when its DOM/state should survive navigation; implement `activate()` and `deactivate()` to toggle input and active-only visuals.
