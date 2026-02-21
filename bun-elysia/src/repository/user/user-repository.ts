import { users } from "@/db/schema"
import { userCreateRequestDTO } from "@/dto/users-dtos"

export type User = typeof users.$inferSelect

export interface UserRepository{
  create(data: userCreateRequestDTO):Promise<number>
  findById(id: number): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(userId: number, data: Partial<userCreateRequestDTO>): Promise<User>
  remove(userId: number): Promise<void>
}
