import type { UserRepository } from "./user-repository";
import { db } from "@/db/client";
import { users } from "@/db/schema";

import { userCreateRequestDTO } from "@/dto/users-dtos";

export class DrizzleUserRepository implements UserRepository{
  async create(data: userCreateRequestDTO){
    const [ inserted ] = await db.insert(users).values(data).$returningId()

    return inserted.id
  }
}