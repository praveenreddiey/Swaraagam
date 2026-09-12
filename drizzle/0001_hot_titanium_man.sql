ALTER TABLE `enquiries` ADD `session_mode` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `client_group` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `preferred_date` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `preferred_time` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `alternate_date` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `alternate_time` text DEFAULT '' NOT NULL;--> statement-breakpoint
PRAGMA optimize;
