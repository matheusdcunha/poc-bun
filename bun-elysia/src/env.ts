import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith("mysql://"),
  PORT: z.coerce.number(),
})

export const env = envSchema.parse(process.env)