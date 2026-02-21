import { describe, expect, it, mock } from "bun:test"

import type { userCreateRequestDTO } from "@/dto/users-dtos"
import { UserAlreadyExistError } from "@/error/user-already-exist"
import { UserNotFoundError } from "@/error/user-not-found"
import type { User, UserRepository } from "@/repository/user/user-repository"
import { UserService } from "@/service/user-service"

describe("UserService - Create User", () => {
  it("deve criar usuário com senha hasheada e retornar o id", async () => {
    const input = {
      username: "matheus",
      email: "matheus@example.com",
      password: "123456",
    }

    const findByEmailMock = mock(async (_email: string): Promise<User | null> => null)
    const createMock = mock(async (_data: userCreateRequestDTO): Promise<number> => {
      return 42
    })

    const userRepository: UserRepository = {
      findByEmail: findByEmailMock,
      create: createMock,
      findById: async () => null,
      update: async () => {
        throw new Error("não deveria chamar update")
      },
      remove: async () => {},
    }

    const sut = new UserService(userRepository)
    const createdUserId = await sut.createUser(input)

    expect(createdUserId).toBe(42)
    expect(findByEmailMock).toHaveBeenCalledWith(input.email)
    expect(createMock).toHaveBeenCalledTimes(1)

    const createdPayload = createMock.mock.calls[0]?.[0]
    if (createdPayload === undefined) {
      throw new Error("payload de criação não capturado no teste")
    }

    expect(createdPayload.username).toBe(input.username)
    expect(createdPayload.email).toBe(input.email)
    expect(createdPayload.createdAt).toBeInstanceOf(Date)
    expect(createdPayload.password).not.toBe(input.password)
    expect(await Bun.password.verify(input.password, createdPayload.password)).toBe(true)
  })

  it("deve lançar erro quando email já existir", async () => {
    const existingUser: User = {
      id: 1,
      username: "ja-existe",
      email: "ja-existe@example.com",
      password: "hash",
      createdAt: new Date(),
      updatedAt: null,
    }

    const findByEmailMock = mock(async (_email: string): Promise<User | null> => existingUser)
    const createMock = mock(async (_data: userCreateRequestDTO): Promise<number> => 1)

    const userRepository: UserRepository = {
      findByEmail: findByEmailMock,
      create: createMock,
      findById: async () => null,
      update: async () => {
        throw new Error("não deveria chamar update")
      },
      remove: async () => {},
    }

    const sut = new UserService(userRepository)

    await expect(
      sut.createUser({
        username: "novo",
        email: "ja-existe@example.com",
        password: "123456",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistError)

    expect(createMock).not.toHaveBeenCalled()
  })
})

describe("UserService - Get User", ()=> {
  it("deve retornar usuário quando encontrar pelo id", async () => {
    const existingUser: User = {
      id: 10,
      username: "matheus",
      email: "matheus@example.com",
      password: "hash",
      createdAt: new Date(),
      updatedAt: null,
    }

    const userRepository: UserRepository = {
      findByEmail: async () => null,
      create: async () => 1,
      findById: async (id: number) => (id === 10 ? existingUser : null),
      update: async () => existingUser,
      remove: async () => {},
    }

    const sut = new UserService(userRepository)

    const user = await sut.findUserById(10)

    expect(user).toEqual({
      id: 10,
      username: "matheus",
      email: "matheus@example.com",
    })
  })

  it("deve lançar erro quando não encontrar usuário pelo id", async () => {
    const userRepository: UserRepository = {
      findByEmail: async () => null,
      create: async () => 1,
      findById: async () => null,
      update: async () => {
        throw new Error("não deveria chamar update")
      },
      remove: async () => {},
    }

    const sut = new UserService(userRepository)

    await expect(sut.findUserById(999)).rejects.toBeInstanceOf(UserNotFoundError)
  })
})
