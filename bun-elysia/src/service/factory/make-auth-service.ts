import { env } from "@/env"
import { DrizzleUserRepository } from "@/repository/user/drizzle-user-repository"
import { AuthService } from "@/service/auth-service"

export function makeAuthService() {
  const userRepository = new DrizzleUserRepository()
  const service = new AuthService(userRepository, env.JWT_SECRET)

  return service
}
