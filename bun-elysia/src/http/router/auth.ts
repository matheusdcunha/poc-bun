import { makeAuthService } from "@/service/factory/make-auth-service"
import { Elysia } from "elysia"
import { z } from "zod"

const loginBodySchema = z.object({
  email: z.email("Email inválido"),
  password: z.string("Senha muito curta, deve ter >= 3 caracteres").min(3),
})

export const auth = new Elysia({ prefix: "/auth" }).post(
  "/login",
  async ({ body, status }) => {
    const service = makeAuthService()
    const response = await service.login(body)

    return status(200, response)
  },
  {
    detail: {
      operationId: "login",
      summary: "Autentica usuário e retorna token JWT",
      tags: ["Auth"],
    },
    body: loginBodySchema,
  },
)
