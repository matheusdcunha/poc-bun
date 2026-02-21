import { app } from "@/app";
import { env } from "@/env";
import { router } from "@/http/router";

const PORT = env.PORT

app.onError(({ code, error, set }) => {
  if (code !== "VALIDATION") return

  set.status = 400

  return {
    message: "Dados inválidos",
    errors: error.all.map((item) => ({
      field: String(item.path ?? "body"),
      message: item.summary ?? item.message,
    })),
  }
}).use(router).listen(PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
