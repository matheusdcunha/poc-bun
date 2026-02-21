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
}
