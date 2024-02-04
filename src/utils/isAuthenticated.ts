import { Elysia } from "elysia";
import jwt from "@elysiajs/jwt";
import { userRepository } from "../data/user.repository";

export const isAuthenticated = (app: Elysia) =>
  app
    .use(
      jwt({
        name: 'jwt',
        secret: 'Fischl von Luftschloss Narfidort'
      })
    )
    .derive(async ({ cookie: { auth }, jwt, set }) => {
      const profile = await jwt.verify(auth.value)

      if (!profile) {
        set.status = 401;
        return { hello: "hello" };
      }
      const userId = profile.user_id;
      const user = await userRepository.getById(userId as number);

      if (!user) {
        set.status = 401;
        return { hello: "hello" };
      }
      return {
        user,
      };
    });
