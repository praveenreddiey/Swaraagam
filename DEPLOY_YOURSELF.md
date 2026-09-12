# Swaraagam — deploy it yourself

This folder is a self-contained copy of the Swaraagam source. The current app is a React/TypeScript Vinext app that runs as a Cloudflare Worker, serves static assets, stores appointment requests in Cloudflare D1, verifies Turnstile, and sends notifications through Resend. Its current booking path is the native enquiry form; a Calendly link is optional and does not require backend code if you add one later.

The copy deliberately excludes generated output (`dist`, `.wrangler`, `.vinext`, `node_modules`) and secrets. Those are recreated locally or configured in your own Cloudflare account.

## 1. Install and run locally

Prerequisites:

- Node.js 22.13 or newer
- A Cloudflare account (needed for the Worker/D1 deployment)
- A Resend account and Turnstile widget for production
- A Calendly account only if you later add an external scheduling link

From this folder:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The checked-in `.env.example` contains Cloudflare's always-pass Turnstile test pair; use those only for local development. Local D1 bindings are supplied by the Vite/Cloudflare development setup.

If `npm ci` reports Windows `EPERM` errors while this folder is inside a OneDrive-synchronised directory, move the `Swaraagam` folder to a normal local folder (for example `C:\Projects\Swaraagam`) and run the same commands there.

## 2. Create your own Cloudflare Worker and D1 database

Log in with your own Cloudflare account:

```powershell
npx wrangler login
npx wrangler d1 create swaraagam-enquiries
```

Wrangler prints a database ID. Copy `wrangler.example.jsonc` to `wrangler.jsonc` and replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` with that ID. Keep the binding name exactly `DB`; the application code uses `env.DB`.

Apply the checked-in Drizzle migrations to the remote database:

```powershell
npx wrangler d1 migrations apply swaraagam-enquiries --remote
```

The `images` binding in `wrangler.jsonc` is used by the Worker for `next/image` optimization. Enable the Cloudflare Images binding for this Worker, or replace the two small logo uses with plain images before deploying if you do not want image transformations.

## 3. Configure production values

### Build-time public values

These values are embedded into the browser bundle. Set them in the shell before `npm run build` (or put them in an ignored `.env.local` file):

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://your-hostname.example"
$env:NEXT_PUBLIC_TURNSTILE_SITE_KEY = "your-turnstile-site-key"
```

Create the Turnstile widget for every hostname that will serve the site. The current source does not read a Calendly environment variable; if you add a Calendly CTA, use its public URL directly in that link (no backend integration is needed).

### Worker secrets

Set these values in your own Worker. Wrangler prompts for each value without echoing it:

```powershell
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put TURNSTILE_EXPECTED_HOSTNAMES
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ENQUIRY_TO_EMAIL
npx wrangler secret put ENQUIRY_FROM_EMAIL
npx wrangler secret put RATE_LIMIT_SALT
npx wrangler secret put ALLOWED_ORIGINS
```

Recommended values:

- `TURNSTILE_EXPECTED_HOSTNAMES`: comma-separated production hostnames, for example `your-hostname.example,www.your-hostname.example`.
- `ENQUIRY_TO_EMAIL`: the inbox where requests should arrive (your `swaraaagam@gmail.com` can be used).
- `ENQUIRY_FROM_EMAIL`: a sender accepted by Resend. `onboarding@resend.dev` is suitable only for Resend's restricted testing flow; verify a domain before sending to real clients.
- `RATE_LIMIT_SALT`: a new long random value that is never committed.
- `ALLOWED_ORIGINS`: the exact browser origins, comma-separated, such as `https://your-hostname.example,https://www.your-hostname.example`.

Never put API keys or the Turnstile secret in `NEXT_PUBLIC_*` variables, source files, Git, or the browser.

## 4. Build and deploy

After `wrangler.jsonc` and the production values are ready:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://your-hostname.example"
$env:NEXT_PUBLIC_TURNSTILE_SITE_KEY = "your-turnstile-site-key"
npm run deploy:selfhost
```

`deploy:selfhost` builds `dist/server` and `dist/client`, then deploys them with `wrangler.jsonc`. It uses the prebuilt Worker output, so the command includes `--no-bundle`.

If Wrangler reports that it is using a generated `.wrangler/deploy/config.json`, remove only that generated folder and rerun the command:

```powershell
Remove-Item -LiteralPath .wrangler\deploy -Recurse -Force
npm run deploy:selfhost
```

## 5. Verify the live site

1. Open the deployed URL and submit a harmless test request.
2. Confirm Turnstile accepts it and the message arrives at `ENQUIRY_TO_EMAIL`.
3. Check notification state without selecting private notes:

```powershell
npx wrangler d1 execute swaraagam-enquiries --remote --command "SELECT notification_status, COUNT(*) AS total FROM enquiries GROUP BY notification_status"
```

4. Watch Worker errors while testing:

```powershell
npx wrangler tail --config wrangler.jsonc
```

`GET /api/enquiries` intentionally returns `405`; enquiries are accepted only with the validated `POST` flow.

## Optional: put the copy in your own Git repository

The handoff folder is intentionally not a Git repository. After reviewing the files and confirming no real secrets are present:

```powershell
git init
git add .
git commit -m "Initial Swaraagam self-hosting source"
```

Create a private repository on your Git provider and push this commit. Keep `.env.local` and any `.dev.vars` files out of the repository; the included `.gitignore` already ignores environment files. `wrangler.jsonc` contains your Worker and D1 identifiers, not API secrets, so commit it only if you are comfortable keeping that configuration in the repository.

## 6. Add a custom domain later

You can first deploy on the `*.workers.dev` hostname. When you own a domain, add it to the Worker in Cloudflare, then:

- add the new hostname to Turnstile;
- update `TURNSTILE_EXPECTED_HOSTNAMES` and `ALLOWED_ORIGINS`;
- rebuild with the new `NEXT_PUBLIC_SITE_URL`;
- redeploy and repeat the test enquiry.

Do not deploy only `dist/client` to a static host: the form's `/api/enquiries` route needs the Worker, D1, Turnstile, and Resend configuration.

## Privacy and operations notes

- Enquiries are retained for up to six months by the current Worker cleanup job; they are not exposed through a public admin page.
- Ask clients to share only a brief practical note. The form warns them not to submit urgent or highly sensitive clinical information.
- Restrict Cloudflare and Resend dashboard access to trusted operators, enable MFA, and rotate secrets if an account or repository is exposed.
- This website is not a crisis service. Keep the emergency-resource disclaimer visible and maintain an offline process for urgent safeguarding concerns.

## Files added for independent deployment

- `wrangler.example.jsonc` — safe template; copy it to `wrangler.jsonc` and add your D1 ID.
- `.openai/hosting.json` — sanitized local build metadata with no internal project ID.
- `.env.example` — non-secret local configuration template.
- `package.json` — includes the `deploy:selfhost` command.
