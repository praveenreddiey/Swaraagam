# Swaraagam production and operations guide

Last reviewed: 23 August 2026

This document explains how the public website protects and retains appointment requests,
how to validate a release, and how to operate the live custom-domain deployment.

## Appointment-request reliability model

Email is a notification, not the source of truth. A valid submission follows
this order:

1. The API checks the browser origin, body size, content type and database-backed rate limit.
2. It validates and normalises all fields and verifies Cloudflare Turnstile server-side.
3. It saves the appointment request in Cloudflare D1 with status `pending`.
4. It asks Resend to notify the configured practice inbox and send the visitor a
   minimal receipt that does not confirm an appointment.
5. It records each delivery as `accepted` or `failed` without deleting the request.

If the database is unavailable, the API does not claim success. The visitor's
form remains filled so they can retry. If D1 succeeds but Resend fails, the API
still confirms safe receipt because the appointment request remains in D1 for recovery.

Each browser submission has a UUID. Retrying the same submission cannot create
a second database record or resend either email after Resend has accepted it. Names,
addresses and notes are excluded from application logs.

## Information stored

The `enquiries` table contains only:

- submission ID and timestamps;
- name and email address;
- selected service, session format and relevant age group;
- preferred and alternate appointment dates and time windows;
- optional brief note;
- consent timestamp;
- notification state, attempt count and provider message ID; and
- an expiry timestamp.

The form explicitly asks visitors not to submit detailed clinical records or
urgent safety information. Web enquiries that do not proceed are retained for
up to six months. Expired records are removed during enquiry-service
maintenance. Client/service records must be managed separately under the
practice's professional record-retention process.

The `enquiry_rate_limits` table contains a salted hash and time window, never a
raw IP address. Old rate-limit rows are automatically removed.

## Recovery procedure

If email notifications are delayed or unavailable:

1. Treat your Cloudflare D1 database as the authoritative list of received web enquiries.
2. Review records where `notification_status != 'accepted'`, using restricted
   Cloudflare dashboard access only.
3. Contact the person through the dedicated practice mailbox. Do not copy their
   note into tickets, chat messages, monitoring tools or personal accounts.
4. Record resolution through the approved database tooling and investigate the
   Resend error using the request/provider ID rather than personal information.
5. Confirm the practice mailbox is receiving messages again before closing the incident.

Useful restricted query:

```sql
SELECT id, created_at, name, email, service, session_mode, client_group,
       preferred_date, preferred_time, alternate_date, alternate_time, note, notification_status,
       notification_attempts, last_notification_attempt_at, visitor_confirmation_status,
       visitor_confirmation_attempts, last_visitor_confirmation_attempt_at
FROM enquiries
WHERE notification_status != 'accepted' OR visitor_confirmation_status != 'accepted'
ORDER BY created_at ASC;
```

Only authorised practice personnel should run this query. Exported enquiry data
must not be kept on unmanaged devices.

## Self-hosted deployment checklist

- The Worker is deployed from your own Cloudflare account with Wrangler.
- Your own D1 database is bound as `DB` and migrations are applied remotely.
- Turnstile accepts every hostname that serves the Worker.
- Resend is configured with a verified sender and the practice inbox as the recipient.
- The Worker `workers.dev` URL is the temporary public address until a custom domain is attached.
- Appointment requests are completed natively on the site without an external scheduling redirect.

Keep the live hostname, Turnstile hostnames, `ALLOWED_ORIGINS`, and
`NEXT_PUBLIC_SITE_URL` aligned after every deployment.

## Runtime configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Trusted public origin used for metadata, canonical URLs and the sitemap. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile widget key. |
| `TURNSTILE_SECRET_KEY` | Server-side Turnstile verification secret. |
| `TURNSTILE_EXPECTED_HOSTNAMES` | Comma-separated hostnames accepted from Turnstile. |
| `RESEND_API_KEY` | Restricted Resend API key. |
| `ENQUIRY_TO_EMAIL` | Up to five comma-separated notification recipients. |
| `ENQUIRY_FROM_EMAIL` | Sender authorised by Resend. |
| `RATE_LIMIT_SALT` | Long random secret used to hash client identifiers. |
| `ALLOWED_ORIGINS` | Additional browser origins permitted to submit. |

`wrangler.jsonc` declares the D1 binding `DB`. Real secrets belong in Worker
secret storage and must never be committed.

## Implemented safeguards

- durable D1 storage before email notification;
- database-backed global request limiting;
- Turnstile action and hostname verification;
- strict field allowlists, Unicode normalisation and HTML escaping;
- 12 KB body limit and 600-character optional note limit;
- honeypot, origin validation and provider timeouts;
- generic visitor errors with non-identifying request IDs;
- Content Security Policy, HSTS, clickjacking, MIME-sniffing, referrer and permissions headers;
- real Privacy, Accessibility and Service Information pages;
- India-specific 112 and Tele-MANAS crisis information;
- static trusted metadata, sitemap, robots file, brand icons and social preview;
- automated build, type, lint, integration, storage-failure and dependency checks.

## Release validation

Run:

```bash
npm run check
```

The integration suite uses an isolated Cloudflare-compatible runtime and D1
database. It verifies valid storage, notification failure retention,
idempotency, global rate limiting, invalid input, hostile origins, anti-spam
failure, legal routes, crawler resources and security headers.

After deployment, submit one clearly labelled non-clinical test appointment request and
confirm both:

- the D1 record exists; and
- the practice notification arrives in the practice mailbox; and
- the visitor receipt arrives at the harmless test address and does not confirm an appointment.

Never use a real client's information for a smoke test.

## Operational schedule

- Daily: monitor the practice inbox and respond within the stated two working days.
- After any provider incident: check D1 for `pending` or `failed` notifications.
- Monthly: verify form delivery, Turnstile and the emergency links with test data.
- Quarterly: review database access, mailbox MFA, secrets, dependencies, privacy wording and retention.
- Immediately after suspected exposure: rotate affected secrets and review access logs without exporting enquiry content.

## Post-launch checks and remaining hardening

After the first self-hosted deployment, continue with these operational checks:

1. Keep the live Worker hostname aligned across site metadata, the sitemap,
   robots, Turnstile and allowed-origin configuration after every deployment.
2. When you add a custom domain, decide whether `www` redirects to the apex.
3. Confirm the configured practice mailbox is actively monitored.
4. Confirm SPF, DKIM and DMARC are valid for the Resend sending domain.
5. Add or verify Cloudflare zone-level WAF/rate rules as defence in depth.
6. Verify the domain in search-engine webmaster tools after domain attachment.
7. Run a D1-plus-email smoke test on the live hostname after each material release.

The website copy and policies are practical drafts, not legal or professional
advice. The practice should obtain an appropriate India-specific legal/privacy
and professional review before inviting actual clients.
