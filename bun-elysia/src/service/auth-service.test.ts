import { describe, expect, it, mock } from "bun:test"

import { InvalidCredentialsError } from "@/error/invalid-credentials"
import type { User, UserRepository } from "@/repository/user/user-repository"
import { AuthService } from "@/service/auth-service"

const JWT_SECRET = "0123456789abcdef0123456789abcdef"
const FIXED_CREATED_AT = new Date("2024-01-01T00:00:00.000Z")

function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split(".")

  if (!payload) {
    throw new Error("token inválido no teste")
  }

  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
}

describe("AuthService - Login", () => {
  it("deve autenticar usuário válido e retornar jwt", async () => {
    const userPassword = "123456"
    const hashedPassword = await Bun.password.hash(userPassword)

    const existingUser: User = {
      id: 10,
      username: "matheus",
      email: "matheus@example.com",
      password: hashedPassword,
      createdAt: FIXED_CREATED_AT,
      updatedAt: null,
    }

    const findByEmailMock = mock(async (_email: string): Promise<User | null> => existingUser)

    const userRepository: UserRepository = {
      findByEmail: findByEmailMock,
      create: async () => 1,
      findById: async () => existingUser,
      update: async () => existingUser,
      remove: async () => {},
    }

    const sut = new AuthService(userRepository, JWT_SECRET)
    const response = await sut.login({ email: existingUser.email, password: userPassword })

    expect(findByEmailMock).toHaveBeenCalledWith(existingUser.email)
    expect(response.tokenType).toBe("Bearer")
    expect(response.expiresIn).toBe(3600)
    expect(response.accessToken.split(".")).toHaveLength(3)

    const payload = decodeJwtPayload(response.accessToken)
    expect(payload.sub).toBe(String(existingUser.id))
    expect(payload.email).toBe(existingUser.email)
    expect(payload.username).toBe(existingUser.username)
    expect(typeof payload.iat).toBe("number")
    expect(typeof payload.exp).toBe("number")
  })

  it("deve lançar erro quando usuário não existir", async () => {
    const findByEmailMock = mock(async (_email: string): Promise<User | null> => null)

    const userRepository: UserRepository = {
      findByEmail: findByEmailMock,
      create: async () => 1,
      findById: async () => null,
      update: async () => {
        throw new Error("não deveria chamar update")
      },
      remove: async () => {},
    }

    const sut = new AuthService(userRepository, JWT_SECRET)

    await expect(
      sut.login({ email: "nao-existe@example.com", password: "123456" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it("deve lançar erro quando senha estiver incorreta", async () => {
    const hashedPassword = await Bun.password.hash("123456")
    const existingUser: User = {
      id: 10,
      username: "matheus",
      email: "matheus@example.com",
      password: hashedPassword,
      createdAt: FIXED_CREATED_AT,
      updatedAt: null,
    }

    const findByEmailMock = mock(async (_email: string): Promise<User | null> => existingUser)

    const userRepository: UserRepository = {
      findByEmail: findByEmailMock,
      create: async () => 1,
      findById: async () => existingUser,
      update: async () => existingUser,
      remove: async () => {},
    }

    const sut = new AuthService(userRepository, JWT_SECRET)

    await expect(
      sut.login({ email: existingUser.email, password: "senha-errada" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
