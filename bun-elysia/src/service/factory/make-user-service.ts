import { DrizzleUserRepository } from "@/repository/user/drizzle-user-repository"
import { UserService } from "@/service/user-service"

export function makeUserService() {
  const userRepository = new DrizzleUserRepository()
  const service = new UserService(userRepository)

  return service
}