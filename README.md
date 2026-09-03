# CF Senders

A small, access-controlled web interface for sending plain-text email through
[Cloudflare Email Service](https://developers.cloudflare.com/email-service/).
It runs as a SvelteKit application on Cloudflare Workers and uses a native
`EMAIL` binding. No third-party mail provider or API key is required.

## Features

- Send plain-text messages to To, CC, and BCC recipients.
- Set a sender, subject, and optional Reply-To address.
- Validate email fields and Cloudflare Email Service errors on the server.
- Limit each message to 50 total recipients and a 4 MiB body.
- Require a valid Cloudflare Access JWT before any request reaches the app.
- Adapt to light and dark color schemes.

## Prerequisites

- **A Cloudflare account with the Workers Paid plan.**
- A domain using Cloudflare DNS and onboarded to
  [Email Sending](https://developers.cloudflare.com/email-service/get-started/send-emails/).
- A Cloudflare Access policy identifying who may use the app.
- (Optional) [mise](https://mise.jdx.dev/) for the Node.js and Aube versions.
  Or use your own Node.js version.

## Cloudflare configuration

### 1. Configure Email Service

Onboard the sender domain under **Compute > Email Service > Email Sending**.
The address entered in the app's From field must belong to an onboarded
domain.

The `EMAIL` binding is already declared in `wrangler.jsonc`. By default it may
send to any verified destination in the Cloudflare account. For tighter
controls, add `allowed_sender_addresses` or `allowed_destination_addresses` as
described in the
[send binding documentation](https://developers.cloudflare.com/email-service/configuration/send-bindings/).

### 2. Protect the Worker with Cloudflare Access

Follow Cloudflare's guide to
[protect one Worker](https://developers.cloudflare.com/workers/configuration/cloudflare-access/#protect-one-worker)
and apply an authentication policy to all traffic.

The app also validates the `Cf-Access-Jwt-Assertion` header before SvelteKit
handles a request. It checks the signature against Cloudflare's rotating public
keys as well as the issuer, audience, algorithm, and expiration. Missing or
invalid configuration and tokens receive a `403 Forbidden` response.

### 3. Set the required bindings

`wrangler.jsonc` declares two required secrets. The declaration makes Wrangler
validate their presence, but you must provide their values:

| Name          | Value                                                               |
| ------------- | ------------------------------------------------------------------- |
| `POLICY_AUD`  | The Access application's **Application Audience (AUD) Tag**         |
| `TEAM_DOMAIN` | Your team URL, for example `https://your-team.cloudflareaccess.com` |

To get `POLICY_AUD`:

1. In the Cloudflare dashboard, open **Zero Trust**.
2. Go to **Access controls > Applications**.
3. Find the Access application protecting this Worker and select
   **Configure**.
4. Open **Additional settings** and copy the **Application Audience (AUD)
   Tag**.

Use the copied value exactly as `POLICY_AUD`. It is the application's audience
tag—not its application ID or a policy ID—and it remains stable unless the
Access application is deleted and recreated. See Cloudflare's
[JWT validation guide](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/#get-your-aud-tag)
for the current dashboard steps.

For an initial deployment, place them in an ignored dotenv file such as
`.env.production`:

```dotenv
POLICY_AUD="your-application-aud-tag"
TEAM_DOMAIN="https://your-team.cloudflareaccess.com"
```

Then upload the values with the deployment:

```sh
mise exec -- aubr deploy -- --secrets-file .env.production
```

After the secrets exist on the Worker, subsequent deployments can use the
regular `deploy` command. You can also manage the values under **Workers &
Pages > cf-senders > Settings > Variables and Secrets**.

> [!CAUTION]
> Never commit the dotenv file!

### 4. Custom Domain

Add the custom domain in the Worker's domain settings.
Then deploy the `production` environment with `wrangler deploy --env production`,
or change the deployment command in Worker's settings.

## Development

Install the toolchain and dependencies, then start Vite:

```sh
mise install
mise exec -- aube install
mise exec -- aubr dev
```

Authentication deliberately fails closed. Starting the development server is
useful for build and UI work, but requests without the Cloudflare platform
bindings and a valid Access JWT return `403`. Use a protected deployed Worker
for end-to-end email testing.

## Commands

Run project scripts through the versions pinned in `mise.toml`:

| Command                            | Description                                                            |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `mise exec -- aubr dev`            | Start the Vite development server.                                     |
| `mise exec -- aubr build`          | Build the Worker in `.svelte-kit/cloudflare/`.                         |
| `mise exec -- aubr preview`        | Preview the production build locally.                                  |
| `mise exec -- aubr check`          | Run Wrangler type checks, Svelte checks, Oxlint, and Oxfmt validation. |
| `mise exec -- aubr test`           | Run all static checks and the Cloudflare Access tests.                 |
| `mise exec -- aubr format`         | Format supported source and configuration files.                       |
| `mise exec -- aubr cf-typegen`     | Regenerate Worker binding types from `wrangler.jsonc`.                 |
| `mise exec -- aubr deploy:dry-run` | Build and validate the Wrangler deployment without publishing.         |
| `mise exec -- aubr deploy`         | Build and deploy to Cloudflare Workers.                                |

## Project structure

```text
src/routes/       SvelteKit page, form action, and layout
src/lib/          Shared components, validation, and Access verification
src/styles/       Global styles
public/           Static assets
wrangler.jsonc    Worker, asset, secret, and email binding configuration
```

Generated output is written to `.svelte-kit/cloudflare/`; do not edit or commit
it.

## Security notes

- Keep Cloudflare Access enabled as the outer authentication layer. The in-app
  JWT verification is defense in depth.
- Do not add a production authentication bypass. If Access or its variables are
  misconfigured, the app is designed to remain unavailable.
- Restrict the email binding's allowed sender and destination addresses when
  the deployment does not need account-wide access.
- Treat changes to the `EMAIL` binding, required secrets, asset handling, and
  compatibility date as deployment-sensitive; validate them with
  `deploy:dry-run`.
