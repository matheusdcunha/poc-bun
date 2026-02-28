import { FileService } from "../file-service"

export function makeFileService(){

  const service = new FileService()

  return service
}