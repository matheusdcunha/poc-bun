import type { User, UserRepository } from "./user-repository";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { userCreateRequestDTO } from "@/dto/users-dtos";
import { eq } from "drizzle-orm";

export class DrizzleUserRepository implements UserRepository{
  async create(data: userCreateRequestDTO){
    const [ inserted ] = await db.insert(users).values(data).$returningId()

    return inserted.id
  }

  async findById(id: number): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    return user ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    return user ?? null
  }

  async update(userId: number, data: Partial<userCreateRequestDTO>): Promise<User> {
    const { username, email, password } = data

    const valuesToUpdate: Partial<User> = {}

    if (username !== undefined) valuesToUpdate.username = username
    if (email !== undefined) valuesToUpdate.email = email
    if (password !== undefined) valuesToUpdate.password = password

    valuesToUpdate.updatedAt = new Date()

    await db
      .update(users)
      .set(valuesToUpdate)
      .where(eq(users.id, userId))

    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!updatedUser) {
      throw new Error("Falha ao atualizar usuário")
    }

    return updatedUser
  }

  async remove(userId: number): Promise<void>{
    await db.delete(users).where(eq(users.id, userId))
  }
}
