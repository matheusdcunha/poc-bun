export interface userCreateRequestDTO{
  username: string,
  email: string,
  password: string,
  createdAt: Date
}

export interface userResponseDTO{
  id: number,
  username: string,
  email: string
}