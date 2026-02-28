import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core"
import { timestamps } from "@/db/utils/timestamps"

export const users = mysqlTable("tb_users", {
  id: int("user_id").autoincrement().primaryKey(),
  username: text("username").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  ...timestamps
})
