import { userCreateRequestDTO } from "@/dto/users-dtos"

export interface UserRepository{
  create(data: userCreateRequestDTO):Promise<number>
}