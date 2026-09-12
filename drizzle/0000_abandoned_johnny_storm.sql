CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`service` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`consent_at` integer NOT NULL,
	`notification_status` text DEFAULT 'pending' NOT NULL,
	`notification_attempts` integer DEFAULT 0 NOT NULL,
	`last_notification_attempt_at` integer,
	`notification_accepted_at` integer,
	`provider_message_id` text,
	`last_notification_error` text
);
--> statement-breakpoint
CREATE INDEX `idx_enquiries_notification_status_created_at` ON `enquiries` (`notification_status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_enquiries_expires_at` ON `enquiries` (`expires_at`);--> statement-breakpoint
CREATE TABLE `enquiry_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_enquiry_rate_limits_expires_at` ON `enquiry_rate_limits` (`expires_at`);
--> statement-breakpoint
PRAGMA optimize;
