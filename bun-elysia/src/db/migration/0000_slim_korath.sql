CREATE TABLE `tb_users` (
	`user_id` int NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`updated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tb_users_user_id` PRIMARY KEY(`user_id`)
);
