import { makeUserService } from "@/service/factory/make-user-service"
import { Elysia } from "elysia"
import { z } from "zod"

const userCreateBodySchema = z.object({
  username: z.string("Username deve ser uma string"),
  email: z.email("Email inválido"),
  password: z.string("Senha muito curta, deve ter >= 3 caracteres").min(3)
})

const userUpdateBodySchema = z.object({
  username: z.string("Username deve ser uma string").optional(),
  email: z.email("Email inválido").optional(),
  password: z.string("Senha muito curta, deve ter >= 3 caracteres").min(3).optional()
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
).put("/:id", async ({ body, params, status, set})=>{

  const service = makeUserService()

  const userId = await service.updateUser(Number(params.id), body)

  set.headers["location"] = `/user/${userId}`

  return status(200)
},
{
  body: userUpdateBodySchema,
  params: userParamsSchema
}
)