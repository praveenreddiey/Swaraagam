import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const enquiries = sqliteTable(
  "enquiries",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    service: text("service").notNull(),
    sessionMode: text("session_mode").notNull().default(""),
    clientGroup: text("client_group").notNull().default(""),
    preferredDate: text("preferred_date").notNull().default(""),
    preferredTime: text("preferred_time").notNull().default(""),
    alternateDate: text("alternate_date").notNull().default(""),
    alternateTime: text("alternate_time").notNull().default(""),
    note: text("note").notNull().default(""),
    consentAt: integer("consent_at").notNull(),
    notificationStatus: text("notification_status", {
      enum: ["pending", "accepted", "failed"],
    })
      .notNull()
      .default("pending"),
    notificationAttempts: integer("notification_attempts").notNull().default(0),
    lastNotificationAttemptAt: integer("last_notification_attempt_at"),
    notificationAcceptedAt: integer("notification_accepted_at"),
    providerMessageId: text("provider_message_id"),
    lastNotificationError: text("last_notification_error"),
  },
  (table) => [
    index("idx_enquiries_notification_status_created_at").on(
      table.notificationStatus,
      table.createdAt,
    ),
    index("idx_enquiries_expires_at").on(table.expiresAt),
  ],
);

export const enquiryRateLimits = sqliteTable(
  "enquiry_rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull().default(1),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => [index("idx_enquiry_rate_limits_expires_at").on(table.expiresAt)],
);
