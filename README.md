# cf-senders

SvelteKit and Tailwind CSS web app configured for server rendering on Cloudflare Workers.

The official SvelteKit Cloudflare adapter creates the Worker bundle. Runtime bindings, including the `EMAIL` send-email binding, are configured in `wrangler.jsonc`.

## Development

The pinned Node and package-manager tools are defined in `mise.toml`.

```sh
mise install
aube install
aube run dev
```

## Commands

- `aube run build` creates the production site in `.svelte-kit/cloudflare/`.
- `aube run check` runs Svelte type checks, ESLint, and dprint.
- `aube run cf-typegen` regenerates TypeScript definitions from `wrangler.jsonc`.
- `aube run format` formats supported source and configuration files.
- `aube run deploy:dry-run` validates the Cloudflare bundle locally.
- `aube run deploy` builds and deploys the site to Cloudflare.
