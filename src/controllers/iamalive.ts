import { Elysia } from "elysia";
import { isAuthenticated } from "../utils/isAuthenticated";

export const controller = (app: Elysia) =>
  app
    .use(isAuthenticated)
    .get("/iamalive", ({ user }) => {
      const isAuthenticated = user != null;
      if (!isAuthenticated)
        throw new Error("Auth error");
      return user;
    })