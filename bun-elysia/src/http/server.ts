import { app } from "@/app";
import { env } from "@/env";
import { router } from "@/http/router";

const PORT = env.PORT

app.use(router).listen(PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
