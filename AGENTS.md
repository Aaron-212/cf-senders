# Repository Guidelines

## Project Structure & Module Organization

This SvelteKit site deploys to Cloudflare Workers with static assets. Routes live in `src/routes/`; shared code belongs in `src/lib/`; and global styles live in `src/styles/`. Put files served unchanged, such as icons, in `public/`. Production output is generated in `.svelte-kit/cloudflare/` and must not be edited or committed. Use the `@/*` alias for imports from `src`, for example `@/styles/global.css`.

## Build, Test, and Development Commands

Tool versions are pinned in `mise.toml`. Set up and run the project with:

```sh
mise install
mise exec -- aube install
mise exec -- aubr dev
```

- `mise exec -- aubr build` creates the production bundle in `.svelte-kit/cloudflare/`.
- `mise exec -- aubr preview` serves the built site locally.
- `mise exec -- aubr check` runs Svelte type checking, Oxlint, and Oxfmt validation.
- `mise exec -- aubr format` applies Oxfmt formatting.
- `mise exec -- aubr deploy:dry-run` builds and validates the Wrangler deployment without publishing.
- `mise exec -- aubr deploy` publishes to Cloudflare; run it only with the appropriate account access.

Notice differences between `aube`, `aubr` and `aubx` commands. `aube` is for running Aube CLI commands, `aubr` is for running `package.json` scripts, and `aubx` is for toolings.
Use `mise exec -- aube add ...`

## Coding Style & Naming Conventions

Use TypeScript-compatible Svelte components and the strict SvelteKit TypeScript configuration. Oxfmt enforces two-space indentation, double quotes, semicolons in TypeScript/JavaScript, and a 120-column print width. Run `aube run format` before submitting changes. Oxlint checks JavaScript, TypeScript, and Svelte script blocks with its correctness-focused defaults, and warnings fail validation. Name reusable Svelte components in `PascalCase` (`SenderForm.svelte`), use SvelteKit's route filenames (`+page.svelte`, `+layout.svelte`), and name CSS classes according to Tailwind conventions.

## Testing Guidelines

There is no unit-test framework yet. `aube run test` runs the same static checks as `check`. Every contribution should pass it and `aube run build`. For UI changes, inspect the affected route through `aube run dev` and verify light and dark themes. If tests are introduced, colocate them with the relevant module or add a documented `tests/` directory.

## Commit & Pull Request Guidelines

The repository has no existing commit history from which to infer a convention. Use concise, imperative subjects, optionally with a Conventional Commit prefix, such as `feat: add sender form` or `fix: correct dark-mode contrast`. Pull requests should explain the purpose and user impact, list validation performed, link related issues, and include screenshots for visual changes. Keep unrelated refactors in separate commits.

## Configuration & Security

Cloudflare deployment settings live in `wrangler.jsonc`. Never commit credentials, account identifiers, or local environment files. Treat changes to the `EMAIL` binding, compatibility date, and asset handling as deployment-sensitive and validate them with `aube run deploy:dry-run`.
