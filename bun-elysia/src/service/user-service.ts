import type { UserRepository } from "@/repository/user/user-repository";
import { userCreateRequestDTO, type userResponseDTO } from "@/dto/users-dtos";
import { UserAlreadyExistError } from "@/error/user-already-exist";
import { UserNotFoundError } from "@/error/user-not-found";

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

  async findUserById(id: number): Promise<userResponseDTO>{
    const user = await this.userRepository.findById(id)

    if(!user){
      throw new UserNotFoundError()
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }
}