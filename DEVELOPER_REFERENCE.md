# Swaraagam developer guide

> **Standalone handoff note:** Use [DEPLOY_YOURSELF.md](./DEPLOY_YOURSELF.md) as the source of truth for deployment and current bindings. The enquiry API requires the `DB` binding described there.

This guide explains the application for a developer coming from Java/Spring with limited frontend experience. It focuses on the code that is active today, how a browser request moves through the system, and the safest places to make common changes.

## 1. What this application is

Swaraagam is a therapy-practice website with two primary visitor paths:

- Visitors can explore the practice, modalities, process, and service information.
- Visitors can request a session through the native enquiry form. The browser obtains a Cloudflare Turnstile token, sends JSON to the application's API route, and the server safely stores the enquiry before notifying the practice through Resend.

The application is full-stack TypeScript. React renders the interface, a Next.js-compatible App Router supplies page and API conventions, vinext/Vite builds it, and a Cloudflare Worker runs the deployed server code.

Cloudflare D1 is the durable source of truth for accepted enquiries, notification status, retention, and shared rate-limit counters. A provider failure cannot erase a valid request.

## 2. Java/Spring-to-this-project mental map

| Java/Spring concept | Closest concept here | Project example |
| --- | --- | --- |
| `pom.xml` / `build.gradle` | dependency and script manifest | `package.json` |
| Maven/Gradle wrapper command | npm script | `npm run build` |
| Java source package | source directory | `app/`, `db/`, `worker/` |
| `@RestController` method | route-handler function | `POST()` in `app/api/enquiries/route.ts` |
| Request DTO | TypeScript type plus runtime parsing | `Enquiry` and `parseEnquiry()` |
| Bean Validation | explicit validation in code | `parseEnquiry()` |
| Thymeleaf template plus browser JavaScript | React component written in JSX/TSX | `app/page.tsx` |
| Base page template | root layout | `app/layout.tsx` |
| application properties/environment variables | `.env.local` and deployment secrets | `.env.example` |
| JPA entity/schema | Drizzle table definition | `db/schema.ts` |
| application entry/servlet adapter | Worker `fetch()` entry point | `worker/index.ts` |
| JUnit | Node's built-in test runner | `tests/rendered-html.test.mjs` |

The analogy is useful, but one difference matters: React component state lives in one visitor's browser tab. It is not a singleton server bean and is not shared with another visitor.

## 3. Technology stack

- **TypeScript 5**: JavaScript with compile-time types. Types help during development but are erased from the generated JavaScript.
- **React 19**: component and state model for the page.
- **Next.js App Router conventions**: file-based pages, layouts, metadata, and API routes.
- **vinext + Vite**: builds the Next-style application for a Cloudflare runtime.
- **Tailwind CSS 4 plus custom CSS**: Tailwind utilities are available, but most of this site's visual design is custom CSS.
- **Cloudflare Workers**: deployed server runtime.
- **Cloudflare Turnstile**: bot check for the enquiry form.
- **Resend**: outbound email provider.
- **Drizzle ORM + Cloudflare D1**: durable enquiry storage, idempotency, retention, and shared rate limiting.
- **Playwright**: browser-level interaction and responsive-layout regression tests.

Node.js `>=22.13.0` is required.

## 4. Repository tour

```text
.
├── app/
│   ├── api/enquiries/route.ts  # Server-side enquiry endpoint
│   ├── styles/                 # Focused visual-system and responsive stylesheets
│   ├── globals.css             # Ordered stylesheet import manifest
│   ├── layout.tsx              # Root HTML shell and SEO/social metadata
│   └── page.tsx                # Server-rendered homepage composition
├── components/
│   ├── home/                   # Homepage sections, content, cards, and artwork
│   └── *.tsx                   # Shared header, footer, legal shell, and enquiry form
├── db/
│   ├── enquiries.ts            # Persistence, notification, and rate-limit operations
│   ├── index.ts                # Creates the Drizzle client from the D1 binding
│   └── schema.ts               # Durable enquiry and rate-limit tables
├── drizzle/                    # Generated migration metadata
├── public/                     # Static files served by URL from the site root
├── tests/                      # Render/API and Playwright browser tests
├── playwright.config.ts        # Isolated browser-test server and Chromium config
├── worker/index.ts             # Cloudflare Worker entry and image optimization
├── .env.example                # Environment variable template; contains no real secrets
├── drizzle.config.ts           # Drizzle migration generator configuration
├── next.config.ts              # Next-compatible configuration
├── vite.config.ts              # vinext and local Cloudflare build configuration
├── wrangler.example.jsonc      # Standalone Worker deployment template
├── package.json                # Dependencies and commands
└── PRODUCTION_READINESS.md     # Launch, privacy, security, and operations checklist
```

Generated or local-only directories such as `node_modules/`, `.vinext/`, `dist/`, `.wrangler/`, `outputs/`, and `work/` should not be hand-edited.

## 5. Architecture and request flow

```mermaid
flowchart LR
    Browser["Browser: React page"]
    API["POST /api/enquiries"]
    Turnstile["Cloudflare Turnstile Siteverify"]
    D1["Cloudflare D1"]
    Resend["Resend email API"]
    Inbox["Practice inbox"]

    Browser -->|"JSON + Turnstile token"| API
    API -->|"Verify token"| Turnstile
    API -->|"Store validated enquiry"| D1
    API -->|"Send notification"| Resend
    API -->|"Update notification status"| D1
    Resend --> Inbox
```

The API writes to D1 before contacting Resend. Submission UUIDs make retries idempotent, and notification state records whether delivery was accepted or remains pending.

### Enquiry sequence

1. `components/EnquiryForm.tsx` renders the form and loads the Turnstile browser script.
2. Turnstile calls a React callback with a short-lived token.
3. `handleSubmit()` prevents the browser's normal form post and calls `fetch("/api/enquiries")` with JSON.
4. `app/api/enquiries/route.ts` checks origin, content type, body size, and the D1-backed attempt limit.
5. The route parses, normalizes, and validates every field. Browser validation is treated only as a convenience.
6. The route sends the token to Turnstile Siteverify.
7. If verification succeeds, the route stores the request in D1 and reserves a notification attempt.
8. The route sends an escaped HTML email and a plain-text email through Resend, then records the provider outcome.
9. The API returns `202 Accepted` after safe storage; React resets the form and displays the success state. Provider failure leaves the stored request pending instead of losing it.
10. Failures return a safe message plus a request ID. Submitted personal data is not intentionally written to server logs.

## 6. Understanding the frontend

### 6.1 TSX and JSX

Files ending in `.tsx` contain TypeScript and JSX. JSX looks like HTML but is an expression syntax that React converts into element-creation calls.

```tsx
const title = "Counselling";
return <h3 className="card-title">{title}</h3>;
```

Key differences from HTML/templates:

- Use `className`, not `class`.
- JavaScript/TypeScript expressions go inside `{}`.
- Event handlers receive functions: `onClick={() => doSomething()}`.
- Tags must close: `<input />` and `<div></div>`.
- Lists are normally produced with `.map(...)`, comparable to a template `forEach`.
- A repeated React element needs a stable `key`, such as `key={item.title}`.

### 6.2 Components

`Home()` in `app/page.tsx` is a small server-rendered composition. Focused sections live in `components/home/`, shared page furniture lives in `components/`, and repeated modality, process, and FAQ copy lives in `components/home/content.ts`.

Interactive components are deliberately narrow. `PrimaryNavigation` owns route/hash state, `ModalityCard` owns one card's flip state and responsive height, `RevealOnScroll` owns viewport reveals, and `EnquiryForm` owns submission state and Turnstile integration.

### 6.3 Client and server code

Interactive files such as `components/EnquiryForm.tsx` begin with:

```tsx
"use client";
```

This is required because those components use browser features, event handlers, or React hooks. A Client Component can be pre-rendered into initial HTML, but its interaction logic is downloaded and **hydrated** in the browser.

`app/page.tsx` and `app/layout.tsx` have no `"use client"` marker and remain server components.

`app/api/enquiries/route.ts` is server-only. Secret keys are allowed there and must never be moved into a client component.

### 6.4 State: `useState`

`EnquiryForm` declares four state values:

| State | Purpose |
| --- | --- |
| `submitted` | shows the success message |
| `isSubmitting` | disables repeat submission and changes button text |
| `formError` | shows the latest visitor-safe error |
| `turnstileToken` | holds the current bot-check token |

Calling a setter such as `setIsSubmitting(true)` schedules a render. It does not mutate a field in place, and the new state should not be assumed to be synchronously available on the next line.

### 6.5 Lifecycle work: `useEffect`

`useEffect(callback, [])` runs after the component mounts in the browser and cleans up when it unmounts. The empty dependency array means "set this up once for this mount."

Client components use effects for distinct browser integrations:

- `RevealOnScroll` uses an `IntersectionObserver` to add `is-visible` when marked sections enter the viewport.
- `EnquiryForm` loads the external Turnstile script, renders its widget, registers callbacks, and removes the widget during cleanup.
- `ModalityCard` measures the rendered detail face so expanded cards remain content-safe at narrow widths.

Effects should not be used for values that can be calculated directly during rendering. They are intended for synchronization with systems outside React, such as browser APIs and third-party widgets.

### 6.6 DOM references: `useRef`

`turnstileContainerRef` gives Turnstile an actual DOM element to render into. `turnstileWidgetIdRef` remembers the provider's widget ID without causing a render when it changes. `ModalityCard` uses refs to measure its detail face and synchronously track pointer presence while click and hover events overlap.

In general, let React own the DOM. Direct DOM operations are justified here because Turnstile and `IntersectionObserver` are external browser APIs.

### 6.7 Form handling

The form combines two levels of validation:

- HTML attributes such as `required`, `minLength`, `maxLength`, and `type="email"` give visitors immediate feedback.
- The API repeats all meaningful validation because browser requests can be forged or modified.

`new FormData(form)` reads named inputs. `JSON.stringify(...)` produces the request DTO. `fetch(...)` returns a `Promise`; `await` pauses this async function until the response is available without blocking the browser UI thread.

The hidden `website` field is a honeypot. Humans do not see it, but simple bots may fill it. The server silently accepts such a request without contacting Turnstile or Resend.

## 7. Styling and responsive design

`app/globals.css` is an ordered import manifest. Shared tokens and primitives live in `app/styles/foundation.css`; each homepage section has one `home-*.css` owner; legal pages, modality-card interaction, shared visual motion, footer, and responsive overrides have focused files beside them. `responsive.css` must remain the final import.

### Design tokens

The `:root` block defines reusable CSS variables such as:

```css
:root {
  --cream: #f7f3eb;
  --ink: #24332d;
  --sage-deep: #4d6758;
  --font-display: Georgia, "Times New Roman", serif;
}
```

Change these variables to adjust the site-wide palette or fonts. This is similar to changing central theme constants rather than editing every component.

### Custom classes and Tailwind utilities

Most elements use semantic custom classes such as `hero-section`, `modality-card`, and `contact-form`. A few layout utilities, for example `flex`, `gap-5`, and `md:flex`, come from Tailwind.

Tailwind is enabled by `@import "tailwindcss";`. There is no separate Tailwind configuration file because Tailwind 4 can discover utilities from the source and accepts theme values through CSS.

### Responsive rules

`app/styles/responsive.css` adjusts grids, spacing, navigation, and form layout for smaller screens. Read the owning base stylesheet first, then the matching responsive override before changing a layout.

The `prefers-reduced-motion` rule is an accessibility feature. It removes reveal animation for visitors who request reduced motion.

### Accessibility already present

The page includes semantic sections and headings, labels connected to form fields, a keyboard skip link, visible focus styles, status/alert live regions, reduced-motion support, and explanatory screen-reader-only text. Preserve these when modifying markup.

## 8. Server API contract

### Endpoint

`POST /api/enquiries`

Request header:

```http
Content-Type: application/json
```

Request body:

```json
{
  "name": "Test Visitor",
  "email": "visitor@example.com",
  "service": "Counselling",
  "note": "A short optional note.",
  "website": "",
  "consent": true,
  "turnstileToken": "provider-token"
}
```

Allowed `service` values are:

- `Counselling`
- `Arts-Based Therapy`
- `Musical Therapy`
- `I'm not sure yet`

Successful response:

```http
HTTP/1.1 202 Accepted
Cache-Control: no-store
Content-Type: application/json
```

```json
{
  "ok": true,
  "requestId": "generated-uuid"
}
```

Error response shape:

```json
{
  "error": "Visitor-safe explanation",
  "requestId": "generated-uuid"
}
```

### Status codes

| Status | Meaning in this API |
| --- | --- |
| `202` | accepted for email delivery, or silently accepted honeypot submission |
| `400` | unreadable JSON or failed/expired Turnstile check |
| `403` | browser origin is not allowed |
| `405` | `GET` is not supported; use `POST` |
| `413` | body exceeds 12,000 bytes |
| `415` | content type is not JSON |
| `422` | field or consent validation failed |
| `429` | more than five attempts in a 15-minute local window |
| `503` | Turnstile/email is unconfigured, unavailable, timed out, or rejected |

Every response uses `Cache-Control: no-store`.

### Validation and security details

- Single-line values are Unicode-normalized, control characters are removed, whitespace is collapsed, and lengths are bounded.
- Notes preserve limited line breaks and are restricted to 600 characters.
- Email output is HTML-escaped before interpolation.
- Browser origins are compared with the request origin and `ALLOWED_ORIGINS`.
- Client identifiers are salted and SHA-256 hashed before entering the in-memory rate-limit map.
- The Turnstile response must be successful, have action `enquiry`, and optionally match an expected hostname.
- Provider calls have 8-second and 10-second timeouts.
- Resend receives an idempotency key based on the API request ID.

The rate limiter is best-effort and local to a Worker isolate. It is not a global production limit. The production environment should also have an edge rate-limit rule.

## 9. Configuration

Copy `.env.example` to `.env.local` for local development:

```powershell
Copy-Item .env.example .env.local
```

| Variable | Used by | Secret? | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | metadata and browser | no | canonical public origin |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | browser | no | renders the Turnstile widget |
| `TURNSTILE_SECRET_KEY` | API | yes | verifies Turnstile tokens |
| `TURNSTILE_EXPECTED_HOSTNAMES` | API | no, server-only | accepted token hostnames |
| `RESEND_API_KEY` | API | yes | authenticates to Resend |
| `ENQUIRY_TO_EMAIL` | API | private config | comma-separated recipients, maximum five |
| `ENQUIRY_FROM_EMAIL` | API | private config | verified sender address |
| `RATE_LIMIT_SALT` | API | yes | makes rate-limit hashes environment-specific |
| `ALLOWED_ORIGINS` | API | private config | extra comma-separated browser origins |

Anything prefixed with `NEXT_PUBLIC_` can be embedded in browser JavaScript and must be considered public. Changing a public value requires a rebuild. Never add the prefix to a secret.

`components/EnquiryForm.tsx` uses Cloudflare's documented public test key as its local fallback. Environment values take precedence. Server secrets have no production fallback; if they are missing, the enquiry route returns a generic `503`.

Do not commit `.env.local`. The repository's `.gitignore` excludes `.env*` except `.env.example`.

## 10. Running the application locally

From the repository root:

```powershell
# Use the exact dependency versions from package-lock.json
npm ci

# Start the development server with hot reload
npm run dev
```

Open the local URL printed by the command, normally `http://localhost:3000`.

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | local development server and hot reload |
| `npm run lint` | ESLint static checks |
| `npm run build` | production vinext/Cloudflare build |
| `npm run test:integration` | production build followed by Node render/API tests |
| `npm run test:browser` | Playwright interaction and responsive-layout tests |
| `npm test` | integration and browser test suites |
| `npm run db:generate` | generate migrations after an intentional schema change |

The Turnstile values in `.env.example` are Cloudflare test values suitable for local development only. Resend remains intentionally unconfigured until a real key, sender, and recipient are supplied, so a complete email delivery test needs provider configuration.

## 11. Tests

`tests/rendered-html.test.mjs` imports the built Worker and makes in-memory HTTP requests to it. The integration suites verify:

- the expected homepage, legal pages, metadata, and security headers render;
- the endpoint rejects unsupported methods, origins, content types, and large bodies;
- field, service, note-length, and consent validation;
- honeypot behaviour;
- safe failure when external providers are not configured;
- D1-backed rate limiting without storing the raw source IP;
- durable, idempotent storage when Resend is unavailable; and
- visual-language ownership, font licenses, section surfaces, and motion fallbacks.

The Worker integration suite does not launch a real browser, solve a Turnstile
challenge or send a real email. `tests/browser/` complements it with Playwright
coverage for navigation state, modality-card interactions and responsive layout.

Before handing off a code change, run:

```powershell
npm run lint
npm test
```

## 12. Common change recipes

### Change visible wording

Edit the focused component under `components/home/`. Repeated modality, process
and FAQ content lives in `components/home/content.ts`.

### Change colours or fonts

Start with the variables in the `:root` block of `app/styles/foundation.css`.
Keep section-specific rules in their owning stylesheet and check desktop and
mobile widths after the change.

### Add or rename a modality

Update both locations:

1. `MODALITIES` in `components/home/content.ts` and the `<select>` options in `components/EnquiryForm.tsx`.
2. The `SERVICES` set in `app/api/enquiries/route.ts`.

If only the UI is changed, the server will correctly reject the new value. This duplication behaves like keeping a frontend enum and backend validation enum in sync.

### Add an enquiry field

Update the full path, not just the form:

1. Add the labelled control in `components/EnquiryForm.tsx`.
2. Add it to the JSON object in `handleSubmit()`.
3. Extend the `Enquiry` type in the API route.
4. Normalize and validate it in `parseEnquiry()`.
5. Add the field to `StoredEnquiry`, `db/schema.ts`, and a reviewed migration.
6. Add escaped HTML and plain-text representations to the email notification.
7. Add tests for valid, missing, boundary, retry, and malicious values.
8. Revisit the privacy wording and confirm the field is genuinely necessary.

### Add a new page

Create a folder below `app/` containing `page.tsx`. For example, `app/privacy/page.tsx` maps to `/privacy`. Keep it a server component unless it truly needs browser state, hooks, or event handlers.

### Change database persistence

The enquiry flow already uses D1. Change it only when product and privacy requirements explicitly call for the additional data:

1. Declare tables in `db/schema.ts`.
2. Keep the D1 binding name as `DB` in `wrangler.jsonc`.
3. Run `npm run db:generate` and review the generated migration.
4. Import `getDb()` only from server code.
5. Add retention, deletion, authorization, migration, backup, and privacy handling.

Do not add new sensitive fields casually. Keep collection minimal, apply the existing retention window, and update the privacy notice with every schema change.

## 13. Common mistakes for Java developers new to React

- **Putting secrets in page code:** anything in a Client Component or named `NEXT_PUBLIC_*` is visible to visitors.
- **Expecting state setters to work like field assignment:** React batches state updates and renders from a state snapshot.
- **Mutating arrays or objects in state:** create a new array/object so React can detect the change.
- **Calling hooks conditionally:** `useState`, `useEffect`, and other hooks must remain at the top level of a component.
- **Running side effects while rendering:** network calls, subscriptions, and DOM integration belong in event handlers, server code, or effects.
- **Trusting browser validation:** repeat validation and authorization on the server.
- **Using browser-only globals on the server:** `window`, `document`, and `localStorage` exist only in the browser.
- **Forgetting cleanup:** observers, event listeners, timers, and third-party widgets should be removed by an effect cleanup function.
- **Changing generated output:** edit source files, then rebuild; never patch `dist/` or `.vinext/`.
- **Assuming email failure means the request was lost:** valid enquiries are saved to D1 before Resend is called; inspect `notification_status` when delivery fails.

## 14. Debugging guide

### The page does not build

Read the first TypeScript or ESLint error, including its source file and line. Later errors are often consequences of the first one. Common JSX failures are an unclosed tag or mismatched `{}`.

### A click or state change does nothing

Open browser developer tools and check the Console. Confirm that the component is a Client Component, the handler is passed as a function, and the button is not disabled.

### The enquiry fails

In browser developer tools, open **Network**, select `POST /api/enquiries`, and inspect:

- request JSON;
- response status;
- response JSON and request ID;
- whether Turnstile supplied a token.

Then use the request ID to correlate server/provider logs. Do not add names, email addresses, or notes to diagnostic logging.

Typical meanings:

- `400`: invalid JSON or Turnstile failure/expiry;
- `403`: `ALLOWED_ORIGINS` does not include the browser origin;
- `422`: browser and API DTO values are out of sync;
- `429`: too many attempts from the same local client identifier;
- `503`: missing secret/provider configuration, timeout, or provider rejection.

### Styling differs by screen size

Inspect the element's computed styles and find the winning rule. Then search `app/styles/` for the class and review `responsive.css`, which intentionally loads last.

## 15. Deployment model

`worker/index.ts` is the Cloudflare entry point. It handles the vinext image-optimization path and delegates all other requests to the generated App Router handler.

`vite.config.ts` combines:

- the vinext application plugin;
- the Cloudflare Vite plugin and local Worker bindings.

Create `wrangler.jsonc` from `wrangler.example.jsonc` for production. It declares
the Worker entry point, static assets, image binding, and the D1 `DB` binding.
Deploy it from your own Cloudflare account with `npm run deploy:selfhost`.

Deployment configuration and secrets belong in the hosting environment. For go-live requirements, security hardening, privacy operations, provider setup, and the launch checklist, read `PRODUCTION_READINESS.md`.

## 16. Recommended reading order for your first change

1. `package.json` — learn the available commands and dependencies.
2. `app/page.tsx` and `components/home/` — follow the homepage composition and focused sections.
3. `app/globals.css`, then `app/styles/foundation.css` and the relevant owner file — connect class names to base and responsive rules.
4. `app/api/enquiries/route.ts` — follow the server validation and provider calls.
5. `db/enquiries.ts` and `db/schema.ts` — understand durable storage and retry state.
6. `tests/rendered-html.test.mjs` and `tests/browser/homepage.spec.ts` — see the externally observable behavior.
7. `vite.config.ts` and `worker/index.ts` — understand build/runtime integration last.

For a safe first exercise, change one piece of page copy, run `npm run lint` and `npm test`, then inspect the result with `npm run dev` at desktop and mobile widths.
