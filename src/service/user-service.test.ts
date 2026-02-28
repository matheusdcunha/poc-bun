import { describe, expect, it, mock } from "bun:test"

import type { userCreateRequestDTO } from "@/dto/users-dtos"
import { UserAlreadyExistError } from "@/error/user-already-exist"
import { UserNotFoundError } from "@/error/user-not-found"
import type { User, UserRepository } from "@/repository/user/user-repository"
import { UserService } from "@/service/user-service"

const FIXED_CREATED_AT = new Date("2024-01-01T00:00:00.000Z")
const FIXED_UPDATED_AT = new Date("2024-01-02T00:00:00.000Z")

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
      createdAt: FIXED_CREATED_AT,
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
      createdAt: FIXED_CREATED_AT,
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

describe("UserService - Update User", () => {
  it("deve atualizar usuário com senha hasheada e retornar o id", async () => {
    const existingUser: User = {
      id: 10,
      username: "matheus",
      email: "matheus@example.com",
      password: "hash-antiga",
      createdAt: FIXED_CREATED_AT,
      updatedAt: null,
    }

    const input = {
      username: "matheus-novo",
      email: "matheus-novo@example.com",
      password: "654321",
    }

    const findByIdMock = mock(async (id: number): Promise<User | null> =>
      id === 10 ? existingUser : null,
    )
    const findByEmailMock = mock(async (_email: string): Promise<User | null> => null)
    const updateMock = mock(async (_id: number, data: Partial<userCreateRequestDTO>): Promise<User> => {
      return {
        ...existingUser,
        username: data.username ?? existingUser.username,
        email: data.email ?? existingUser.email,
        password: data.password ?? existingUser.password,
        updatedAt: FIXED_UPDATED_AT,
      }
    })

    const userRepository: UserRepository = {
      findByEmail: findByEmailMock,
      create: async () => 1,
      findById: findByIdMock,
      update: updateMock,
      remove: async () => {},
    }

    const sut = new UserService(userRepository)
    const updatedUserId = await sut.updateUser(10, input)

    expect(updatedUserId).toBe(10)
    expect(findByIdMock).toHaveBeenCalledWith(10)
    expect(findByEmailMock).toHaveBeenCalledWith(input.email)
    expect(updateMock).toHaveBeenCalledTimes(1)

    const updatedPayload = updateMock.mock.calls[0]?.[1]
    if (updatedPayload === undefined) {
      throw new Error("payload de atualização não capturado no teste")
    }

    expect(updatedPayload.username).toBe(input.username)
    expect(updatedPayload.email).toBe(input.email)
    expect(updatedPayload.password).not.toBe(input.password)

    if (updatedPayload.password === undefined) {
      throw new Error("senha hasheada não enviada para update")
    }

    expect(await Bun.password.verify(input.password, updatedPayload.password)).toBe(true)
  })

  it("deve lançar erro quando tentar atualizar com email já existente", async () => {
    const existingUser: User = {
      id: 10,
      username: "matheus",
      email: "matheus@example.com",
      password: "hash",
      createdAt: FIXED_CREATED_AT,
      updatedAt: null,
    }

    const userWithSameEmail: User = {
      id: 20,
      username: "outro",
      email: "ja-existe@example.com",
      password: "hash",
      createdAt: FIXED_CREATED_AT,
      updatedAt: null,
    }

    const findByIdMock = mock(async (): Promise<User | null> => existingUser)
    const findByEmailMock = mock(async (_email: string): Promise<User | null> => userWithSameEmail)
    const updateMock = mock(async (): Promise<User> => existingUser)

    const userRepository: UserRepository = {
      findByEmail: findByEmailMock,
      create: async () => 1,
      findById: findByIdMock,
      update: updateMock,
      remove: async () => {},
    }

    const sut = new UserService(userRepository)

    await expect(
      sut.updateUser(10, {
        email: "ja-existe@example.com",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistError)

    expect(updateMock).not.toHaveBeenCalled()
  })
})

describe("UserService - Remove User", () => {
  it("deve remover usuário quando ele existir", async () => {
    const existingUser: User = {
      id: 10,
      username: "matheus",
      email: "matheus@example.com",
      password: "hash",
      createdAt: FIXED_CREATED_AT,
      updatedAt: null,
    }

    const findByIdMock = mock(async (id: number): Promise<User | null> =>
      id === 10 ? existingUser : null,
    )
    const removeMock = mock(async (_id: number): Promise<void> => {})

    const userRepository: UserRepository = {
      findByEmail: async () => null,
      create: async () => 1,
      findById: findByIdMock,
      update: async () => existingUser,
      remove: removeMock,
    }

    const sut = new UserService(userRepository)

    await sut.removeUser(10)

    expect(findByIdMock).toHaveBeenCalledWith(10)
    expect(removeMock).toHaveBeenCalledWith(10)
    expect(removeMock).toHaveBeenCalledTimes(1)
  })

  it("deve lançar erro quando tentar remover usuário inexistente", async () => {
    const findByIdMock = mock(async (): Promise<User | null> => null)
    const removeMock = mock(async (_id: number): Promise<void> => {})

    const userRepository: UserRepository = {
      findByEmail: async () => null,
      create: async () => 1,
      findById: findByIdMock,
      update: async () => {
        throw new Error("não deveria chamar update")
      },
      remove: removeMock,
    }

    const sut = new UserService(userRepository)

    await expect(sut.removeUser(999)).rejects.toBeInstanceOf(UserNotFoundError)

    expect(removeMock).not.toHaveBeenCalled()
  })
})
