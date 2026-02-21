import type { UserRepository } from "@/repository/user/user-repository";
import { userCreateRequestDTO } from "@/dto/users-dtos";

export class UserService{
  constructor( private userRepository: UserRepository){}

  async createUser({email, username, password}: Omit<userCreateRequestDTO, "createdAt">): Promise<number>{
    const password_hash= await Bun.password.hash(password)

    // TODO Adicionar validação de usuário existente
    // const userWithSameEmail = await this.userRepository.findByEmail(email)

    // if(userWithSameEmail){
    //   throw new Error("Email já cadastrado")
    // }

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