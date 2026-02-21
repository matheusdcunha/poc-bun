import { int, mysqlTable, text } from "drizzle-orm/mysql-core"
import { timestamps } from "@/db/utils/timestamps"

export const users = mysqlTable("tb_users", {
  id: int("user_id").autoincrement().primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  ...timestamps
})
