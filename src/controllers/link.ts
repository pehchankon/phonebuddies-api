import { Elysia } from "elysia";
import User from "../models/user";
import { linkRepository } from "../data/link.repository";
import { comparePassword } from "../utils/passwordGeneration";
import { isAuthenticated } from "../utils/isAuthenticated";
import Link from "../models/link";


function reduceToNegOneZeroOne(num: number): -1 | 0 | 1 {
  if (num > 0) {
    return 1;
  } else if (num < 0) {
    return -1;
  } else {
    return 0;
  }
}


export const linkController = (app: Elysia) =>
  app
    .use(isAuthenticated)
    .get("/links", async ({ user, query, set }) => {
      set.status = 200;
      const { sort } = query; //USE TO SORT LIST
      const isAuthenticated = (user != null);
      let links: Link[] = [];
      if (!isAuthenticated)
        links = await linkRepository.getAllLinks(sort);
      else
        links = await linkRepository.getAllLinks(sort, user.user_id);
      // console.log(links);

      return { count: links.length, links: links }
    })
    .post("/links", async ({ body, user }) => {
      const link = body as Link;
      const isAuthenticated = (user != null);
      if (!isAuthenticated)
        throw new Error("Not authenticated.");
      const res = await linkRepository.createLink(user.user_id, link);
      return res;
    })
    .get("/links/favorite", async ({ user }) => {
      const isAuthenticated = (user != null);
      if (!isAuthenticated)
        throw new Error("Not authenticated.");
      return await linkRepository.favoriteLinks(user.user_id);
    })
    .post("/links/:link_id/rating", async ({ user, params: { link_id }, body }) => {
      const { vote_type } = body as { vote_type: number };
      const isAuthenticated = (user != null);
      if (!isAuthenticated)
        throw new Error("Not authenticated.");
      return await linkRepository.voteLink(user.user_id, Number(link_id), reduceToNegOneZeroOne(vote_type));
    })
    .post("/links/:link_id/blacklist", async ({ user, params: { link_id } }) => {
      const isAuthenticated = (user != null);
      if (!isAuthenticated)
        throw new Error("Not authenticated.");
      await linkRepository.blacklistLink(user.user_id, Number(link_id));
    })
    .get("links/:link_id", async ({ params: { link_id } }) => {
      const link = await linkRepository.getSingleLink(Number(link_id));
      return link;
    })

