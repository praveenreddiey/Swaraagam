# Swaraagam website

Public website and secure enquiry service for Swaraagam, a creative
therapeutic practice based in Mumbai with online services across India.

For independent hosting, start with [DEPLOY_YOURSELF.md](./DEPLOY_YOURSELF.md). It
contains the account setup, D1 migration, secrets, and Cloudflare Worker deploy
steps for this standalone copy.

## Technology

- React and TypeScript through Vinext
- Cloudflare Sites and Workers
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
- `components/`: shared navigation, footer and appointment-request form
- `db/`: D1 schema and persistence helpers
- `worker/`: Cloudflare entry point and security headers
- `tests/`: production-build integration tests
- `.openai/hosting.json`: logical Sites resources only

## Deployment

Sites applies the packaged D1 migration and injects the logical `DB` binding.
Runtime secrets are managed through Sites and never stored in the repository.
The primary public origin is `https://swaraagam.com`. The application uses
`NEXT_PUBLIC_SITE_URL` when supplied and otherwise falls back to that canonical
origin; keep any deployment override aligned with the live domain.
