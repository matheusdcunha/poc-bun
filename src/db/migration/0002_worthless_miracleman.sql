ALTER TABLE `tb_users`
MODIFY COLUMN `email` varchar(255) NOT NULL,
ADD CONSTRAINT `tb_users_email_unique` UNIQUE(`email`);
