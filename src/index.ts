import { Elysia } from "elysia";
import { controller } from "./controllers/iamalive";
import { authController } from "./controllers/auth";
import { db } from "./data/base";
import { isAuthenticated } from "./utils/isAuthenticated";
import User from "./models/user";
import { linkController } from "./controllers/link";
import { swagger } from '@elysiajs/swagger'
import cors from "@elysiajs/cors";

export const app = (new Elysia())
  .use(cors())
  .use(swagger())
  .decorate({ db })
  .use(authController)
  .use(isAuthenticated)
  .get('/', async ({ user }) => {
    const u = user as User;
    return `Hello ${u.username}`
  })
  .use(controller)
  .use(linkController)
  .listen(8080)