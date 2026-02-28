import { app } from "@/app";
import { env } from "@/env";
import { router } from "@/http/router";
import { errorHandler } from "./plugins/error-handler";

const PORT = env.PORT

app.use(errorHandler).use(router).listen(PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
