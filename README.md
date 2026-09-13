# Swaraagam website

Counselling, arts-based therapy and music-informed support.

Public website and secure enquiry service for Swaraagam, a creative
therapeutic practice based in Mumbai with online services across India.

For independent hosting, start with [DEPLOY_YOURSELF.md](./DEPLOY_YOURSELF.md). It
contains the account setup, D1 migration, secrets, and Cloudflare Worker deploy
steps for this standalone copy.

## Technology

- React and TypeScript through Vinext
- Cloudflare Workers
- Cloudflare D1 with Drizzle migrations
- Cloudflare Turnstile for server-verified spam protection
- Resend for practice-inbox notifications
- A native, database-backed appointment-request flow with no external redirect

## Local setup

Requirements: Node.js 22.13 or later.

```bash
npm ci
Copy-Item .env.example .env.local
npm run dev
```

The `.env.example` values use Cloudflare's local Turnstile test keys. Never
commit a real `.env.local` file or provider secret.

## Validation

```bash
npm run check
```

This runs lint, strict TypeScript validation, a production build, integration
tests in an isolated Cloudflare-compatible runtime with D1, and a production
dependency audit.

## Appointment-request reliability

`POST /api/enquiries` verifies the request and Turnstile token, then writes the
appointment request to D1 before asking Resend to send a notification. Email
failure cannot erase a valid request. Submission UUIDs make retries idempotent, and the rate
limit is shared through D1 rather than process memory.

The database schema is in `db/schema.ts`; generated migrations are in
`drizzle/`. After a schema change, run:

```bash
npm run db:generate
```

See `PRODUCTION_READINESS.md` for provider configuration, incident recovery,
data retention, deployment checks and the remaining custom-domain work.

## Primary source areas

- `app/`: routes, pages and API endpoint
- `app/styles/`: focused visual-system, page-section and responsive stylesheets
- `components/home/`: focused homepage sections, decorative visuals and reveal behavior
- `components/`: shared navigation, footer and appointment-request form
- `db/`: D1 schema and persistence helpers
- `worker/`: Cloudflare entry point and security headers
- `tests/`: production-build integration tests
- `wrangler.example.jsonc`: safe template for your Worker and D1 binding

## Deployment

Deploy the Worker yourself with Wrangler by following
[DEPLOY_YOURSELF.md](./DEPLOY_YOURSELF.md). The deployment creates and migrates
your own D1 database, configures Worker secrets, and publishes both the React
assets and `/api/enquiries` route from your account. Runtime secrets are entered
with `wrangler secret put` and are never stored in this repository.

After the one-time Cloudflare setup, every push or merge to `main` runs the full
quality checks and then uses the **Deploy Swaraagam** GitHub Actions workflow to
migrate and publish automatically. Pull requests run quality checks without
deploying, and the deployment workflow can still be started manually on demand.

You can start with the free `*.workers.dev` hostname. When you own a domain,
attach it to the Worker and keep `NEXT_PUBLIC_SITE_URL`, Turnstile hostnames,
and `ALLOWED_ORIGINS` aligned with the live origin.

## Visual language

Swaraagam uses self-hosted Fraunces and Manrope fonts, an original paper-collage
visual language, a green rhythm ribbon, and a compact charcoal footer panel. The
header keeps the English Swaraagam wordmark clear; the hero remains static while
lower-page motion adds energy on scroll and hover. Modality cards start compact
and reveal their descriptions in an expanded face on hover, click or keyboard
activation. Privacy, service-information and accessibility pages use the same
painted surfaces, editorial headings and compact footer. All animation is
disabled when a visitor requests reduced motion.

The design intentionally does not reuse third-party website copy or imagery.
See [docs/VISUAL_LANGUAGE.md](./docs/VISUAL_LANGUAGE.md) before changing colors,
fonts, animation, or homepage artwork.
