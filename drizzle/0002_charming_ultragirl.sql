ALTER TABLE `enquiries` ADD `visitor_confirmation_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `visitor_confirmation_attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `last_visitor_confirmation_attempt_at` integer;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `visitor_confirmation_accepted_at` integer;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `visitor_confirmation_message_id` text;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `last_visitor_confirmation_error` text;