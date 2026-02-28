export interface loginRequestDTO {
  email: string
  password: string
}

export interface loginResponseDTO {
  accessToken: string
  tokenType: "Bearer"
  expiresIn: number
}
