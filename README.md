# CF Senders

A SvelteKit web app for sending emails via Cloudflare Send emails.

## Setup

### Prerequisites

- Cloudflare account with **Workers Paid** plan (Cloudflare Send Mail is only available on Workers Paid)
- Properly configured Cloudflare Send emails
  See <https://developers.cloudflare.com/email-service/get-started/send-emails/> for instructions
- A Cloudflare Access application protecting the Worker

### Cloudflare Access

This app validates Cloudflare Access application tokens before SvelteKit handles any request. It rejects requests when the token is missing or invalid, and it also rejects every request when the Access variables are left unconfigured. This protects the email binding if an Access policy or route is removed accidentally.

After creating the Access application, set these non-secret variables in `wrangler.jsonc`:

- `TEAM_DOMAIN`: your team URL, such as `https://your-team.cloudflareaccess.com`
- `POLICY_AUD`: the application's **Application Audience (AUD) Tag**, found under Zero Trust > Access controls > Applications > your application > Additional settings

Keep Cloudflare Access enabled as the first authentication layer. The in-app check is defense in depth: it validates the `Cf-Access-Jwt-Assertion` signature against Cloudflare's rotating public keys, as well as the token issuer, audience, algorithm, and expiration.

Both values default to empty strings so a fresh deployment fails closed until they are configured. Do not add an authentication bypass for production.

See <https://developers.cloudflare.com/workers/configuration/cloudflare-access/#protect-one-worker> for instructions

## Development

The pinned Node and package-manager tools are defined in `mise.toml`.

```sh
mise install
aube install
aubr dev
```

## Commands

- `aubr build` creates the production site in `.svelte-kit/cloudflare/`.
- `aubr check` runs Svelte type checks, ESLint, and dprint.
- `aubr cf-typegen` regenerates TypeScript definitions from `wrangler.jsonc`.
- `aubr format` formats supported source and configuration files.
- `aubr deploy:dry-run` validates the Cloudflare bundle locally.
- `aubr deploy` builds and deploys the site to Cloudflare.
