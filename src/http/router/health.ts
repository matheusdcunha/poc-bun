import { Elysia } from "elysia"

export const health = new Elysia({ prefix: "/health" }).get("", () => {
  return {
    message: "ok",
    timestamp: new Date(),
  }
})