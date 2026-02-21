import { AppError } from "./app-error"

export class UserAlreadyExistError extends AppError{
   status = 409

   constructor (){
    super("Usuário já existe", "USER_ALREADY_EXISTS")
    this.name = "UserAlreadyExistError"
   }
}