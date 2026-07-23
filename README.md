# charliegroves.net

A sequence of full-screen audiovisual experiences.

```sh
pnpm install
pnpm dev
```

Experiences live in `src/experiences`. Each is a small workspace package with
its own dependencies and a default `Experience` export. The host in
`src/runtime` owns navigation, loading, prompts, and lifecycle.

Run `pnpm build` to create the static site in `dist`. Deployment is automatic:
any push to `main` triggers the GitHub Actions workflow, which rebuilds and
publishes to GitHub Pages. `pnpm deploy` builds locally first (catching errors
before CI) and then pushes the current branch to `main`.
