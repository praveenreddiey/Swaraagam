import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(testDirectory, "..");
const workerPath = resolve(projectDirectory, "dist/server/index.js");
const migrationDirectory = resolve(projectDirectory, "drizzle");
const migrationPaths = (await readdir(migrationDirectory))
  .filter((name) => /^\d+_.+\.sql$/u.test(name))
  .sort()
  .map((name) => resolve(migrationDirectory, name));
const resendRequests = [];

async function collectJavaScriptModules(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await collectJavaScriptModules(path)));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      paths.push(path);
    }
  }
  return paths;
}

const workerModules = await collectJavaScriptModules(dirname(workerPath));
workerModules.sort((left, right) => {
  if (left === workerPath) return -1;
  if (right === workerPath) return 1;
  return left.localeCompare(right);
});

const modulesRoot = dirname(workerPath);
const manifestModules = Object.fromEntries(
  await Promise.all(
    workerModules.map(async (path) => [
      relative(modulesRoot, path).replaceAll("\\", "/"),
      { type: "esm", contents: await readFile(path, "utf8") },
    ]),
  ),
);

const miniflare = new Miniflare({
  workers: [
    {
      config: {
        name: "swaraagam-test",
        type: "worker",
        compatibilityDate: "2026-05-22",
        compatibilityFlags: [
          "nodejs_compat",
          "nodejs_compat_populate_process_env",
        ],
        manifest: {
          mainModule: relative(modulesRoot, workerPath).replaceAll("\\", "/"),
          modulesRoot,
          modules: manifestModules,
        },
        env: {
          ALLOWED_ORIGINS: { type: "text", value: "http://localhost" },
          ASSETS: {
            type: "fetcher",
            handler: async (request) => {
              const pathname = new URL(request.url).pathname;
              if (pathname === "/favicon.ico") {
                return new Response(
                  await readFile(
                    resolve(projectDirectory, "public/favicon.ico"),
                  ),
                  { headers: { "Content-Type": "image/x-icon" } },
                );
              }
              return new Response("Not found", { status: 404 });
            },
          },
          DB: { type: "d1" },
          ENQUIRY_FROM_EMAIL: {
            type: "text",
            value: "Swaraagam Enquiries <onboarding@resend.dev>",
          },
          ENQUIRY_TO_EMAIL: { type: "text", value: "practice@example.com" },
          RATE_LIMIT_SALT: { type: "text", value: "test-rate-limit-salt" },
          RESEND_API_KEY: { type: "text", value: "re_test_key" },
          TURNSTILE_EXPECTED_HOSTNAMES: {
            type: "text",
            value: "localhost",
          },
          TURNSTILE_SECRET_KEY: {
            type: "text",
            value: "test-turnstile-secret",
          },
        },
      },
      dev: {
        outboundService: {
          type: "fetcher",
          handler: async (request) => {
            const url = new URL(request.url);
            if (url.hostname === "challenges.cloudflare.com") {
              const formData = await request.formData();
              return Response.json({
                success: formData.get("response") !== "bad-token",
                action: "enquiry",
                hostname: "localhost",
              });
            }
            if (url.hostname === "api.resend.com") {
              const body = await request.json();
              resendRequests.push({
                idempotencyKey: request.headers.get("Idempotency-Key"),
                body,
              });
              if (body.reply_to === "provider-failure@example.com") {
                return Response.json(
                  { message: "temporary failure" },
                  { status: 503 },
                );
              }
              return Response.json({ id: `email_${resendRequests.length}` });
            }
            return new Response("Unexpected outbound request", { status: 502 });
          },
        },
      },
    },
  ],
});

const database = await miniflare.getD1Database("DB");
for (const migrationPath of migrationPaths) {
  const migration = await readFile(migrationPath, "utf8");
  for (const statement of migration.split("--> statement-breakpoint")) {
    const sql = statement.trim();
    if (sql) await database.prepare(sql).run();
  }
}

after(async () => {
  await miniflare.dispose();
});

function fetchApp(pathname, init = {}) {
  return miniflare.dispatchFetch(`http://localhost${pathname}`, init);
}

function validEnquiry(overrides = {}) {
  const preferredDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000)
    .toISOString()
    .slice(0, 10);
  return {
    submissionId: crypto.randomUUID(),
    name: "Test Visitor",
    email: "visitor@example.com",
    preferredDate,
    preferredTime: "Morning (9 am–12 pm)",
    note: "A non-clinical test message.",
    website: "",
    consent: true,
    turnstileToken: "test-token",
    ...overrides,
  };
}

function postEnquiry(body, ip) {
  return fetchApp("/api/enquiries", {
    method: "POST",
    headers: {
      "CF-Connecting-IP": ip,
      "Content-Type": "application/json",
      Origin: "http://localhost",
    },
    body: JSON.stringify(body),
  });
}

test("renders the site, legal pages and production security headers", async () => {
  const home = await fetchApp("/", { headers: { Accept: "text/html" } });
  assert.equal(home.status, 200);
  assert.match(home.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(home.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.equal(home.headers.get("x-content-type-options"), "nosniff");
  assert.equal(home.headers.get("x-frame-options"), "DENY");
  assert.equal(home.headers.get("referrer-policy"), "strict-origin-when-cross-origin");

  const html = await home.text();
  assert.match(
    html,
    /src="\/swaraagam-guitar-waves-mark\.png"/,
    "the static brand mark must bypass the unsupported production image optimizer",
  );
  assert.match(html, /स्वरागम/);
  assert.match(html, /સ્વરાગમ/);
  assert.match(html, /స్వరాగం/);
  assert.match(html, /ஸ்வராகம்/);
  assert.doesNotMatch(html, /\/_vinext\/image\?/);
  assert.match(
    html,
    /<title>Swaraagam \| Counselling, Arts-Based &amp; Music-Informed Support<\/title>/i,
  );
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /"@type":"Organization"/i);
  assert.match(html, /How booking works/);
  assert.match(html, /Receive a personal reply/);
  assert.match(html, /Music Therapy Intern/);
  assert.match(html, /Your request is saved securely/);
  assert.match(html, /Request a session/);
  assert.match(html, /Add a brief note/);
  assert.match(html, /Preferred date/);
  assert.match(html, /Preferred time \(IST\)/);
  assert.doesNotMatch(
    html,
    /Who is the session for|Preferred session time|What are you looking for|Preferred session format|Add another preferred time/,
  );
  assert.doesNotMatch(html, /No redirect|Stay on this page|Native appointment request/);
  assert.match(html, /A little clarity before you begin/);
  assert.match(html, /What happens in the first session\?/);
  assert.match(html, /mobile-booking-bar/);
  assert.match(html, /Not a crisis service/);
  assert.match(html, /Portrait space for Pragati Bhatt/);
  assert.match(html, /property="og:image"/i);
  assert.doesNotMatch(html, /Calendly|calendly\.com/i);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /href="\/accessibility"/);
  assert.match(html, /href="\/service-information"/);
  assert.match(html, /Copy enquiries@swaraagam\.com to clipboard/);
  assert.doesNotMatch(html, /mailto:/i);
  assert.doesNotMatch(html, /not stored in this website/i);

  for (const path of ["/privacy", "/accessibility", "/service-information"]) {
    const response = await fetchApp(path, { headers: { Accept: "text/html" } });
    assert.equal(response.status, 200, path);
    const legalHtml = await response.text();
    assert.match(legalHtml, /Back to Swaraagam/);
    assert.match(legalHtml, /Copy enquiries@swaraagam\.com to clipboard/);
    assert.doesNotMatch(legalHtml, /mailto:/i);
  }
});

test("publishes crawler and icon resources", async () => {
  const robots = await fetchApp("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /sitemap\.xml/i);

  const sitemap = await fetchApp("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const sitemapBody = await sitemap.text();
  assert.match(sitemapBody, /<loc>.*\/privacy<\/loc>/i);
  assert.match(sitemapBody, /<loc>.*\/service-information<\/loc>/i);

  const favicon = await fetchApp("/favicon.ico");
  assert.equal(favicon.status, 200);
});

test("allows only POST for the enquiry endpoint", async () => {
  const response = await fetchApp("/api/enquiries");
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("rejects foreign origins, unsupported content and oversized bodies", async () => {
  const foreign = await fetchApp("/api/enquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://attacker.example",
      "CF-Connecting-IP": "192.0.2.10",
    },
    body: JSON.stringify(validEnquiry()),
  });
  assert.equal(foreign.status, 403);

  const wrongType = await fetchApp("/api/enquiries", {
    method: "POST",
    headers: { "CF-Connecting-IP": "192.0.2.11" },
    body: "name=Test",
  });
  assert.equal(wrongType.status, 415);

  const tooLarge = await fetchApp("/api/enquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CF-Connecting-IP": "192.0.2.12",
    },
    body: "x".repeat(12_001),
  });
  assert.equal(tooLarge.status, 413);
});

test("validates identifiers, consent, values and anti-spam checks", async () => {
  const invalidId = await postEnquiry(validEnquiry({ submissionId: "not-a-uuid" }), "192.0.2.13");
  assert.equal(invalidId.status, 422);

  const noConsent = await postEnquiry(validEnquiry({ consent: false }), "192.0.2.14");
  assert.equal(noConsent.status, 422);
  assert.match((await noConsent.json()).error, /confirm/i);

  const invalidService = await postEnquiry(validEnquiry({ service: "Unknown service" }), "192.0.2.15");
  assert.equal(invalidService.status, 422);

  const invalidMode = await postEnquiry(validEnquiry({ sessionMode: "Telephone" }), "192.0.2.24");
  assert.equal(invalidMode.status, 422);

  const pastDate = await postEnquiry(validEnquiry({ preferredDate: "2020-01-01" }), "192.0.2.26");
  assert.equal(pastDate.status, 422);

  const incompleteAlternate = await postEnquiry(
    validEnquiry({ alternateDate: validEnquiry().preferredDate }),
    "192.0.2.27",
  );
  assert.equal(incompleteAlternate.status, 422);

  const longNote = await postEnquiry(validEnquiry({ note: "x".repeat(601) }), "192.0.2.16");
  assert.equal(longNote.status, 422);

  const bot = await postEnquiry(validEnquiry({ turnstileToken: "bad-token" }), "192.0.2.17");
  assert.equal(bot.status, 400);
  assert.match((await bot.json()).error, /anti-spam/i);
});

test("silently accepts honeypot submissions without storing an enquiry", async () => {
  const before = await database.prepare("SELECT COUNT(*) AS count FROM enquiries").first();
  const response = await postEnquiry({ website: "https://spam.example" }, "192.0.2.18");
  assert.equal(response.status, 202);
  assert.equal((await response.json()).ok, true);
  const after = await database.prepare("SELECT COUNT(*) AS count FROM enquiries").first();
  assert.equal(after.count, before.count);
});

test("stores a valid enquiry before accepting the email notification", async () => {
  const enquiry = validEnquiry();
  const response = await postEnquiry(enquiry, "192.0.2.19");
  assert.equal(response.status, 202);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.safelyStored, true);

  const saved = await database
    .prepare("SELECT email, session_mode, client_group, preferred_date, preferred_time, notification_status, provider_message_id FROM enquiries WHERE id = ?")
    .bind(enquiry.submissionId)
    .first();
  assert.equal(saved.email, enquiry.email);
  assert.equal(saved.session_mode, "To be confirmed");
  assert.equal(saved.client_group, "");
  assert.equal(saved.preferred_date, enquiry.preferredDate);
  assert.equal(saved.preferred_time, enquiry.preferredTime);
  assert.equal(saved.notification_status, "accepted");
  assert.match(saved.provider_message_id, /^email_/);

  const notification = resendRequests.at(-1);
  assert.equal(notification.body.reply_to, enquiry.email);
  assert.match(notification.body.text, /Preferred date:/);
  assert.doesNotMatch(notification.body.text, /Session for:/);
  assert.match(notification.body.text, /saved in the protected website database/i);
  assert.doesNotMatch(notification.body.text, /not stored/i);
});

test("retains an enquiry when the email provider is unavailable", async () => {
  const enquiry = validEnquiry({ email: "provider-failure@example.com" });
  const response = await postEnquiry(enquiry, "192.0.2.20");
  assert.equal(response.status, 202);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.safelyStored, true);
  assert.equal(body.notificationPending, true);

  const saved = await database
    .prepare("SELECT notification_status, notification_attempts FROM enquiries WHERE id = ?")
    .bind(enquiry.submissionId)
    .first();
  assert.equal(saved.notification_status, "failed");
  assert.equal(saved.notification_attempts, 1);
});

test("deduplicates retries and does not resend an accepted email", async () => {
  const enquiry = validEnquiry();
  const before = resendRequests.length;
  const first = await postEnquiry(enquiry, "192.0.2.21");
  const second = await postEnquiry(enquiry, "192.0.2.22");
  assert.equal(first.status, 202);
  assert.equal(second.status, 202);
  assert.equal(resendRequests.length, before + 1);

  const result = await database
    .prepare("SELECT COUNT(*) AS count FROM enquiries WHERE id = ?")
    .bind(enquiry.submissionId)
    .first();
  assert.equal(result.count, 1);
});

test("applies a database-backed limit without storing the raw IP", async () => {
  let response;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    response = await postEnquiry({}, "192.0.2.23");
  }
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "900");
  assert.doesNotMatch(await response.text(), /192\.0\.2\.23/);

  const rawIdentifier = await database
    .prepare("SELECT key FROM enquiry_rate_limits WHERE key LIKE ?")
    .bind("%192.0.2.23%")
    .first();
  assert.equal(rawIdentifier, null);
});
