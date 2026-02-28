import { Elysia } from 'elysia';
import { AppError } from '@/error/app-error';

export const errorHandler = new Elysia()
  .onError({as: "global"},({ code, error, set }) => {
    

    if (error instanceof AppError) {

      set.status = error.status;
      return {
        status: error.status,
        code: error.code,
        message: error.message
      };
    }

    if (code === "VALIDATION"){
      
      set.status = 400
      return {
        status: error.status,
        code: error.code,
        message: "Dados inválidos",
        errors: error.all.map((item) => ({
          field: String(item.path ?? "body"),
          message: item.summary ?? item.message,
        })),
      }
    }
    
    console.error(error)
    set.status = 500;
    return {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro interno inesperado.'
    };
  });