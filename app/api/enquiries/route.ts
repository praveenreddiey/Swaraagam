import {
  beginNotificationAttempt,
  consumeRateLimit,
  markNotificationAccepted,
  markNotificationFailed,
  saveEnquiry,
} from "@/db/enquiries";

const MAX_BODY_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const SERVICES = new Set([
  "Counselling",
  "Arts-Based Therapy",
  "Music Therapy",
  "I'm not sure yet",
  "To be discussed",
]);
const SESSION_MODES = new Set([
  "Online",
  "In person — Mumbai",
  "Either is suitable",
  "To be confirmed",
]);
const TIME_WINDOWS = new Set([
  "Morning (9 am–12 pm)",
  "Afternoon (12–4 pm)",
  "Evening (4–7 pm)",
  "Flexible",
]);

type Enquiry = {
  submissionId: string;
  name: string;
  email: string;
  service: string;
  sessionMode: string;
  preferredDate: string;
  preferredTime: string;
  alternateDate: string;
  alternateTime: string;
  note: string;
  turnstileToken: string;
};

function runtimeValue(key: string) {
  return typeof process !== "undefined" ? process.env[key] : undefined;
}

function json(body: Record<string, unknown>, status: number, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function normalizeSingleLine(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength + 1);
}

function normalizeNote(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 601);
}

function indiaDateRange() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  const today = `${values.year}-${values.month}-${values.day}`;
  const maximum = new Date(
    Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day) + 180),
  )
    .toISOString()
    .slice(0, 10);
  return { today, maximum };
}

function isValidAppointmentDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const normalized = new Date(Date.UTC(year, month - 1, day))
    .toISOString()
    .slice(0, 10);
  if (normalized !== value) return false;
  const { today, maximum } = indiaDateRange();
  return value >= today && value <= maximum;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEnquiry(input: unknown): { enquiry?: Enquiry; honeypot?: boolean; error?: string } {
  if (!isPlainObject(input)) return { error: "Please check the form and try again." };

  const website = normalizeSingleLine(input.website, 200);
  if (website) return { honeypot: true };

  const submissionId = normalizeSingleLine(input.submissionId, 36).toLowerCase();
  const name = normalizeSingleLine(input.name, 80);
  const email = normalizeSingleLine(input.email, 254).toLowerCase();
  const service = normalizeSingleLine(input.service, 40) || "To be discussed";
  const sessionMode =
    normalizeSingleLine(input.sessionMode, 30) || "To be confirmed";
  const preferredDate = normalizeSingleLine(input.preferredDate, 10);
  const preferredTime = normalizeSingleLine(input.preferredTime, 30);
  const alternateDate = normalizeSingleLine(input.alternateDate, 10);
  const alternateTime = normalizeSingleLine(input.alternateTime, 30);
  const note = normalizeNote(input.note);
  const turnstileToken =
    typeof input.turnstileToken === "string" ? input.turnstileToken.trim() : "";

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(submissionId)) {
    return { error: "Please refresh the page and try again." };
  }
  if (name.length < 2 || name.length > 80) {
    return { error: "Please enter a name between 2 and 80 characters." };
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!SERVICES.has(service)) return { error: "Please choose a valid service." };
  if (!SESSION_MODES.has(sessionMode)) {
    return { error: "Please choose a valid session format." };
  }
  if (!isValidAppointmentDate(preferredDate)) {
    return { error: "Please choose a preferred date within the next six months." };
  }
  if (!TIME_WINDOWS.has(preferredTime)) {
    return { error: "Please choose a preferred time window." };
  }
  if (Boolean(alternateDate) !== Boolean(alternateTime)) {
    return { error: "Please provide both an alternate date and time window." };
  }
  if (alternateDate && !isValidAppointmentDate(alternateDate)) {
    return { error: "Please choose an alternate date within the next six months." };
  }
  if (alternateTime && !TIME_WINDOWS.has(alternateTime)) {
    return { error: "Please choose a valid alternate time window." };
  }
  if (
    alternateDate === preferredDate &&
    alternateTime === preferredTime
  ) {
    return { error: "Please choose a different alternate date or time window." };
  }
  if (note.length > 600) {
    return { error: "Please keep your note to 600 characters or fewer." };
  }
  if (input.consent !== true) {
    return { error: "Please confirm that we may use these details to reply." };
  }
  if (!turnstileToken || turnstileToken.length > 2_048) {
    return { error: "Please complete the anti-spam check." };
  }

  return {
    enquiry: {
      submissionId,
      name,
      email,
      service,
      sessionMode,
      preferredDate,
      preferredTime,
      alternateDate,
      alternateTime,
      note,
      turnstileToken,
    },
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function allowedOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  const configuredOrigins = (runtimeValue("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set([new URL(request.url).origin, ...configuredOrigins]).has(origin);
}

async function rateLimitKey(request: Request) {
  const forwardedFor = request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim();
  const clientIdentifier =
    request.headers.get("CF-Connecting-IP") ?? forwardedFor ?? "unknown-client";
  const salt = runtimeValue("RATE_LIMIT_SALT") ?? "swaraagam-enquiries";
  const bytes = new TextEncoder().encode(`${salt}:${clientIdentifier}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function isRateLimited(request: Request) {
  const key = await rateLimitKey(request);
  return consumeRateLimit(
    key,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS,
  );
}

async function verifyTurnstile(token: string, request: Request, requestId: string) {
  const secret = runtimeValue("TURNSTILE_SECRET_KEY");
  if (!secret) throw new Error("TURNSTILE_NOT_CONFIGURED");

  const formData = new FormData();
  formData.set("secret", secret);
  formData.set("response", token);
  formData.set("idempotency_key", requestId);
  const clientIp = request.headers.get("CF-Connecting-IP");
  if (clientIp) formData.set("remoteip", clientIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return false;

  const result = (await response.json()) as {
    success?: boolean;
    action?: string;
    hostname?: string;
  };
  if (!result.success || result.action !== "enquiry") return false;

  const expectedHostnames = (runtimeValue("TURNSTILE_EXPECTED_HOSTNAMES") ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return (
    expectedHostnames.length === 0 ||
    (typeof result.hostname === "string" &&
      expectedHostnames.includes(result.hostname.toLowerCase()))
  );
}

async function sendEnquiryEmail(enquiry: Enquiry, requestId: string) {
  const apiKey = runtimeValue("RESEND_API_KEY");
  const from = runtimeValue("ENQUIRY_FROM_EMAIL");
  const recipients = (runtimeValue("ENQUIRY_TO_EMAIL") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (!apiKey || !from || recipients.length === 0) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }

  const safeName = escapeHtml(enquiry.name);
  const safeEmail = escapeHtml(enquiry.email);
  const safeService = escapeHtml(enquiry.service);
  const safeSessionMode = escapeHtml(enquiry.sessionMode);
  const safePreferredDate = escapeHtml(enquiry.preferredDate);
  const safePreferredTime = escapeHtml(enquiry.preferredTime);
  const safeAlternate = enquiry.alternateDate
    ? `${escapeHtml(enquiry.alternateDate)}, ${escapeHtml(enquiry.alternateTime)}`
    : "Not provided";
  const safeNote = enquiry.note ? escapeHtml(enquiry.note).replace(/\n/g, "<br>") : "Not provided";
  const plainNote = enquiry.note || "Not provided";
  const plainAlternate = enquiry.alternateDate
    ? `${enquiry.alternateDate}, ${enquiry.alternateTime}`
    : "Not provided";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": requestId,
    },
    body: JSON.stringify({
      from,
      to: recipients,
      reply_to: enquiry.email,
      subject: `New Swaraagam appointment request — ${enquiry.service}`,
      text: [
        "A new appointment request was submitted through the Swaraagam website.",
        "",
        `Name: ${enquiry.name}`,
        `Email: ${enquiry.email}`,
        `Service: ${enquiry.service}`,
        `Session format: ${enquiry.sessionMode}`,
        `Preferred date: ${enquiry.preferredDate}`,
        `Preferred time: ${enquiry.preferredTime} IST`,
        `Alternate preference: ${plainAlternate}`,
        `Brief note: ${plainNote}`,
        "",
        `Request ID: ${requestId}`,
        "The request was saved in the protected website database before this notification was sent.",
      ].join("\n"),
      html: `
        <h2>New Swaraagam appointment request</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Service:</strong> ${safeService}</p>
        <p><strong>Session format:</strong> ${safeSessionMode}</p>
        <p><strong>Preferred date:</strong> ${safePreferredDate}</p>
        <p><strong>Preferred time:</strong> ${safePreferredTime} IST</p>
        <p><strong>Alternate preference:</strong> ${safeAlternate}</p>
        <p><strong>Brief note:</strong><br>${safeNote}</p>
        <hr>
        <p><small>Request ID: ${requestId}. The request was saved in the protected website database before this notification was sent.</small></p>
      `,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    console.error("Enquiry email provider rejected the request", {
      requestId,
      status: response.status,
    });
    throw new Error("EMAIL_PROVIDER_ERROR");
  }

  const result = (await response.json().catch(() => null)) as {
    id?: unknown;
  } | null;
  return typeof result?.id === "string" ? result.id : null;
}

async function sendEnquiryEmailWithRetry(
  enquiry: Enquiry,
  idempotencyKey: string,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await sendEnquiryEmail(enquiry, idempotencyKey);
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  }
  throw lastError;
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  if (!allowedOrigin(request)) {
    return json({ error: "This request was not accepted.", requestId }, 403);
  }
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "This request must use JSON.", requestId }, 415);
  }

  const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ error: "This enquiry is too large.", requestId }, 413);
  }
  try {
    if (await isRateLimited(request)) {
      return json(
        {
          error: "Too many attempts. Please wait before trying again.",
          requestId,
        },
        429,
        { "Retry-After": "900" },
      );
    }
  } catch {
    console.error("Enquiry database is unavailable", { requestId });
    return json(
      {
        error: "The enquiry service is temporarily unavailable. Please try again later.",
        requestId,
      },
      503,
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: "The form could not be read. Please try again.", requestId }, 400);
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ error: "This enquiry is too large.", requestId }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "The form could not be read. Please try again.", requestId }, 400);
  }

  const parsed = parseEnquiry(body);
  if (parsed.honeypot) return json({ ok: true, requestId }, 202);
  if (!parsed.enquiry) {
    return json({ error: parsed.error ?? "Please check the form and try again.", requestId }, 422);
  }

  try {
    const isHuman = await verifyTurnstile(
      parsed.enquiry.turnstileToken,
      request,
      requestId,
    );
    if (!isHuman) {
      return json({ error: "The anti-spam check expired or failed. Please try again.", requestId }, 400);
    }

    const saved = await saveEnquiry({
      id: parsed.enquiry.submissionId,
      name: parsed.enquiry.name,
      email: parsed.enquiry.email,
      service: parsed.enquiry.service,
      sessionMode: parsed.enquiry.sessionMode,
      preferredDate: parsed.enquiry.preferredDate,
      preferredTime: parsed.enquiry.preferredTime,
      alternateDate: parsed.enquiry.alternateDate,
      alternateTime: parsed.enquiry.alternateTime,
      note: parsed.enquiry.note,
    });

    if (!saved) throw new Error("ENQUIRY_NOT_SAVED");
    const matchesExistingSubmission =
      saved.name === parsed.enquiry.name &&
      saved.email === parsed.enquiry.email &&
      saved.service === parsed.enquiry.service &&
      saved.sessionMode === parsed.enquiry.sessionMode &&
      saved.preferredDate === parsed.enquiry.preferredDate &&
      saved.preferredTime === parsed.enquiry.preferredTime &&
      saved.alternateDate === parsed.enquiry.alternateDate &&
      saved.alternateTime === parsed.enquiry.alternateTime &&
      saved.note === parsed.enquiry.note;
    if (!matchesExistingSubmission) {
      return json(
        { error: "Please refresh the page and submit the form again.", requestId },
        409,
      );
    }

    if (saved.notificationStatus === "accepted") {
      return json({ ok: true, safelyStored: true, requestId }, 202);
    }

    const shouldNotify = await beginNotificationAttempt(saved.id);
    if (!shouldNotify) {
      return json({ ok: true, safelyStored: true, requestId }, 202);
    }

    try {
      const providerMessageId = await sendEnquiryEmailWithRetry(
        parsed.enquiry,
        parsed.enquiry.submissionId,
      );
      await markNotificationAccepted(saved.id, providerMessageId);
      return json({ ok: true, safelyStored: true, requestId }, 202);
    } catch (notificationError) {
      const reason =
        notificationError instanceof Error
          ? notificationError.message
          : "NOTIFICATION_FAILED";
      await markNotificationFailed(saved.id, reason).catch(() => undefined);
      console.error("Enquiry saved but notification is pending", {
        requestId,
        reason,
      });
      return json(
        { ok: true, safelyStored: true, notificationPending: true, requestId },
        202,
      );
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "UNKNOWN";
    console.error("Enquiry processing failed", { requestId, reason });
    return json(
      {
        error: "The enquiry could not be safely saved right now. Please try again a little later.",
        requestId,
      },
      503,
    );
  }
}

export async function GET() {
  return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
}
