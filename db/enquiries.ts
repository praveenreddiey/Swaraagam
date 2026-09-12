import { and, eq, ne, sql } from "drizzle-orm";
import { getDb } from "./index";
import { enquiries, enquiryRateLimits } from "./schema";

const ENQUIRY_RETENTION_MS = 180 * 24 * 60 * 60 * 1_000;

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
    })
    .from(enquiries)
    .where(eq(enquiries.id, enquiry.id))
    .get();
}

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
