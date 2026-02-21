import { makeUserService } from "@/service/factory/make-user-service"
import { Elysia } from "elysia"
import { z } from "zod"

export const userCreateBodySchema = z.object({
  username: z.string("Username deve ser uma string"),
  email: z.email("Email inválido"),
  password: z.string("Senha muito curta, deve ter >= 3 caracteres").min(3)
})

const userParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "Id deve ser um valor numérico")
})


export const user = new Elysia({ prefix: "/user"}).post("/",
  async ({ body, status, set })=>{
    
    const service = makeUserService()

    const userId = await service.createUser(body)

    set.headers["location"] = `/user/${userId}`

    return status(201)
  },
  {
    body: userCreateBodySchema
  }
).get("/:id",
  async ({ params, status })=>{
   
    const service = makeUserService()

    const user = await service.findUserById(Number(params.id))

    return status(200, user)
  },
  {
    params: userParamsSchema
  }
)