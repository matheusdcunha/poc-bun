import type { loginRequestDTO, loginResponseDTO } from "@/dto/auth-dtos"
import { InvalidCredentialsError } from "@/error/invalid-credentials"
import type { UserRepository } from "@/repository/user/user-repository"
import { generateJwt } from "@/utils/jwt"

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 60

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtSecret: string,
  ) {}

  async login({ email, password }: loginRequestDTO): Promise<loginResponseDTO> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const isPasswordValid = await Bun.password.verify(password, user.password)

    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }

    const accessToken = generateJwt(
      {
        sub: String(user.id),
        email: user.email,
        username: user.username,
      },
      this.jwtSecret,
      ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    )

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    }
  }
}
