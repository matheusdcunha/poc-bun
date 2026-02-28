import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith("mysql://"),
  PORT: z.coerce.number(),
  JWT_SECRET: z.string().min(16),
})

export const env = envSchema.parse(process.env)
