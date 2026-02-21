import type { UserRepository } from "@/repository/user/user-repository";
import { userCreateRequestDTO } from "@/dto/users-dtos";
import { UserAlreadyExistError } from "@/error/user-already-exist";

export class UserService{
  constructor( private userRepository: UserRepository){}

  async createUser({email, username, password}: Omit<userCreateRequestDTO, "createdAt">): Promise<number>{
    const password_hash= await Bun.password.hash(password)

    const userWithSameEmail = await this.userRepository.findByEmail(email)

    if(userWithSameEmail){
      throw new UserAlreadyExistError()
    }

    const userId = await this.userRepository.create(
      {
        email,
        username,
        password: password_hash,
        createdAt: new Date()
      }
    )

    return userId
  }
}