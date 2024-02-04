import { Elysia } from "elysia";
import User from "../models/user";
import { jwt } from '@elysiajs/jwt'
import { userRepository } from "../data/user.repository";
import { comparePassword } from "../utils/passwordGeneration";


export const authController = (app: Elysia) =>
  app.group("/auth", (app) =>
    app
      .use(
        jwt({
          name: 'jwt',
          secret: 'Fischl von Luftschloss Narfidort'
        })
      )
      .post("/register", async ({ body }) => {
        const user = body as User
        const userExists = await userRepository.getByUsername(user.username) != null;
        if (userExists) {
          return {
            success: false,
            data: null,
            message: "User already exists.",
          };
        }
        return userRepository.createUser(user);
      })
      .post("/login", async ({ jwt, cookie: { auth }, body }) => {
        const { username: user, password: password } = body as User;
        const fetchUser = await userRepository.getByUsername(user);
        if (fetchUser == null) {
          return {
            success: false,
            data: null,
            message: "Username not found.",
          };
        }
        if (!(await comparePassword(password, fetchUser.password))) {
          return { success: false, message: "login failure" };
        }
        auth.set({
          value: await jwt.sign({ user_id: fetchUser.user_id }),
          httpOnly: true,
          maxAge: 7 * 86400,
          path: '/',
        })
        return { success: true, message: "login success", body: { auth: auth.value } }
      })
  )