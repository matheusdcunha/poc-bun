import { AppError } from "./app-error"

export class UserNotFoundError extends AppError{
   status = 404

   constructor (){
    super("Usuário não encontrado", "USER_NOT_FOUND")
    this.name = "UserNotFoundError"
   }
}