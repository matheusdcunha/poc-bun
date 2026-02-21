import { Elysia } from "elysia";
import { health } from "./health";
import { user } from "./user";

export const router = new Elysia().use(health).use(user)