CREATE TABLE `login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`method` text NOT NULL,
	`total` integer NOT NULL,
	`lines` text NOT NULL,
	`voided` integer DEFAULT 0 NOT NULL
);
