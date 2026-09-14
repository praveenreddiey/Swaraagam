import { and, eq, ne, sql } from "drizzle-orm";
import { getDb } from "./index";
import { enquiries, enquiryRateLimits } from "./schema";

const ENQUIRY_RETENTION_MS = 180 * 24 * 60 * 60 * 1_000;

/** Validated visitor fields persisted for one appointment request. */
export type StoredEnquiry = {
  id: string;
  name: string;
  email: string;
  service: string;
  sessionMode: string;
  preferredDate: string;
  preferredTime: string;
  alternateDate: string;
  alternateTime: string;
  note: string;
};

/** Persist one validated enquiry and return the stored record for idempotency checks. */
export async function saveEnquiry(enquiry: StoredEnquiry) {
  const db = getDb();
  const now = Date.now();

  await db
    .insert(enquiries)
    .values({
      ...enquiry,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + ENQUIRY_RETENTION_MS,
      consentAt: now,
      notificationStatus: "pending",
    })
    .onConflictDoNothing({ target: enquiries.id });

  return db
    .select({
      id: enquiries.id,
      name: enquiries.name,
      email: enquiries.email,
      service: enquiries.service,
      sessionMode: enquiries.sessionMode,
      preferredDate: enquiries.preferredDate,
      preferredTime: enquiries.preferredTime,
      alternateDate: enquiries.alternateDate,
      alternateTime: enquiries.alternateTime,
      note: enquiries.note,
      notificationStatus: enquiries.notificationStatus,
      visitorConfirmationStatus: enquiries.visitorConfirmationStatus,
    })
    .from(enquiries)
    .where(eq(enquiries.id, enquiry.id))
    .get();
}

/** Atomically reserve a notification attempt unless the enquiry was already accepted. */
export async function beginNotificationAttempt(id: string) {
  const db = getDb();
  const now = Date.now();

  const result = await db
    .update(enquiries)
    .set({
      notificationStatus: "pending",
      notificationAttempts: sql`${enquiries.notificationAttempts} + 1`,
      lastNotificationAttemptAt: now,
      updatedAt: now,
      lastNotificationError: null,
    })
    .where(
      and(
        eq(enquiries.id, id),
        ne(enquiries.notificationStatus, "accepted"),
      ),
    )
    .returning({ id: enquiries.id })
    .get();

  return Boolean(result);
}

/** Record a successful notification and its optional provider identifier. */
export async function markNotificationAccepted(
  id: string,
  providerMessageId: string | null,
) {
  const now = Date.now();
  await getDb()
    .update(enquiries)
    .set({
      notificationStatus: "accepted",
      notificationAcceptedAt: now,
      providerMessageId,
      lastNotificationError: null,
      updatedAt: now,
    })
    .where(eq(enquiries.id, id));
}

/** Record a bounded provider failure reason while retaining the enquiry. */
export async function markNotificationFailed(id: string, reason: string) {
  await getDb()
    .update(enquiries)
    .set({
      notificationStatus: "failed",
      lastNotificationError: reason.slice(0, 80),
      updatedAt: Date.now(),
    })
    .where(eq(enquiries.id, id));
}

/** Reserve an acknowledgement attempt unless the visitor has already been notified. */
export async function beginVisitorConfirmationAttempt(id: string) {
  const db = getDb();
  const now = Date.now();

  const result = await db
    .update(enquiries)
    .set({
      visitorConfirmationStatus: "pending",
      visitorConfirmationAttempts: sql`${enquiries.visitorConfirmationAttempts} + 1`,
      lastVisitorConfirmationAttemptAt: now,
      updatedAt: now,
      lastVisitorConfirmationError: null,
    })
    .where(
      and(
        eq(enquiries.id, id),
        ne(enquiries.visitorConfirmationStatus, "accepted"),
      ),
    )
    .returning({ id: enquiries.id })
    .get();

  return Boolean(result);
}

/** Record the provider's acceptance of a visitor acknowledgement email. */
export async function markVisitorConfirmationAccepted(
  id: string,
  providerMessageId: string | null,
) {
  const now = Date.now();
  await getDb()
    .update(enquiries)
    .set({
      visitorConfirmationStatus: "accepted",
      visitorConfirmationAcceptedAt: now,
      visitorConfirmationMessageId: providerMessageId,
      lastVisitorConfirmationError: null,
      updatedAt: now,
    })
    .where(eq(enquiries.id, id));
}

/** Record a bounded acknowledgement failure while retaining the original enquiry. */
export async function markVisitorConfirmationFailed(id: string, reason: string) {
  await getDb()
    .update(enquiries)
    .set({
      visitorConfirmationStatus: "failed",
      lastVisitorConfirmationError: reason.slice(0, 80),
      updatedAt: Date.now(),
    })
    .where(eq(enquiries.id, id));
}

/** Increment a hashed-client rate-limit bucket and report whether it exceeded its limit. */
export async function consumeRateLimit(
  clientHash: string,
  windowMs: number,
  maximum: number,
) {
  const db = getDb();
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${clientHash}:${windowStart}`;

  const result = await db
    .insert(enquiryRateLimits)
    .values({ key, count: 1, expiresAt: windowStart + windowMs })
    .onConflictDoUpdate({
      target: enquiryRateLimits.key,
      set: { count: sql`${enquiryRateLimits.count} + 1` },
    })
    .returning({ count: enquiryRateLimits.count })
    .get();

  return (result?.count ?? maximum + 1) > maximum;
}
