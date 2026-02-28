import { AppError } from "./app-error"

export class InvalidCredentialsError extends AppError {
  status = 401

  constructor() {
    super("Credenciais inválidas", "INVALID_CREDENTIALS")
    this.name = "InvalidCredentialsError"
  }
}
