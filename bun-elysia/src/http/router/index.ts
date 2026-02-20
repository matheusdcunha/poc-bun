import { Elysia } from "elysia";
import { health } from "./health";

export const router = new Elysia().use(health)