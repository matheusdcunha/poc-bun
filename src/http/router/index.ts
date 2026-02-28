import { Elysia } from "elysia";
import { auth } from "./auth";
import { health } from "./health";
import { user } from "./user";
import { file } from "./file";

export const router = new Elysia().use(health).use(auth).use(user).use(file)
