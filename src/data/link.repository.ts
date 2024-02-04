import { db } from "./base";
import Link from "../models/link";

class LinkRepository {

  private static _instance: LinkRepository;

  public async getAllLinks(sort?: string, user_id?: number): Promise<Link[]> {
    let sort_query: string;
    if (sort == "top")
      sort_query = "total_votes DESC, links.created_at DESC;";
    else
      sort_query = "links.created_at DESC;";

    const query_string = `
      SELECT
      links.link_id,
      links.user_id,
      users.username AS uploaded_by,
      links.link_url,
      links.description,
      links.title,
      links.created_at,
      COALESCE(SUM(votes.vote_type), 0) AS total_votes,
      COALESCE(up.phone_points, 0) AS user_phone_points
    FROM
      links
    JOIN
      users ON links.user_id = users.user_id
    LEFT JOIN
      votes ON links.link_id = votes.link_id
    LEFT JOIN
      blacklist ON links.link_id = blacklist.link_id
    LEFT JOIN
      phone_points up ON links.user_id = up.user_id
    WHERE
      blacklist.user_id IS NULL OR blacklist.user_id != $user_id
    GROUP BY
      links.link_id, links.user_id, users.username, links.link_url, links.description, links.title, links.created_at
    ORDER BY
    ` + sort_query;


    const query = db.prepare(query_string);


    const res = query.all(user_id ?? -1);
    if (res == null) return [];
    return res as Link[];
  }

  public async createLink(user_id: number, link: Link): Promise<Link> {
    const query = db.query(`
    INSERT INTO links(user_id, link_url, description, title)
    VALUES($p1, $p2, $p3, $p4);
    `);
    query.get(user_id, link.link_url, link.description, link.title);
    return link;
  }

  public async voteLink(user_id: number, link_id: number, vote_type: number) {
    const query = db.query(`
    INSERT INTO votes(user_id, link_id, vote_type)
    VALUES($user_id, $link_id, $vote_type)
    ON CONFLICT(user_id, link_id) DO UPDATE SET vote_type = $vote_type;
    `);
    const query2 = db.query(`
    UPDATE phone_points
    SET phone_points = (
      SELECT COALESCE(SUM(votes.vote_type), 0)
      FROM votes
      JOIN links ON votes.link_id = links.link_id
      WHERE links.user_id = (
        SELECT user_id
        FROM links
        WHERE link_id = $link_id
      )    
    ) WHERE phone_points.user_id = (
      SELECT user_id
      FROM links
      WHERE link_id = $link_id
    );
    `);
    query.run(user_id, link_id, vote_type);
    query2.run(link_id);
    console.log(query2.toString());
  }

  public async blacklistLink(user_id: number, link_id: number) {
    const query = db.query(`
    INSERT INTO blacklist(user_id, link_id)
    VALUES($user_id, $link_id);
    `);
    query.run(user_id, link_id);
  }

  public async favoriteLinks(user_id: number): Promise<Link[]> {
    const query = db.query(`
    SELECT
    links.link_id,
    links.user_id,
    users.username AS uploaded_by,
    links.link_url,
    links.description,
    links.title,
    links.created_at,
    COALESCE(up.phone_points, 0) AS user_phone_points
  FROM
    links
  JOIN
    users ON links.user_id = users.user_id
  LEFT JOIN
    votes ON links.link_id = votes.link_id
  LEFT JOIN
    blacklist ON links.link_id = blacklist.link_id
  LEFT JOIN
    phone_points up ON links.user_id = up.user_id
  WHERE
    (blacklist.user_id IS NULL OR blacklist.user_id != :userId)
    AND votes.user_id = :userId
    AND votes.vote_type = 1 -- Assuming 1 represents an upvote
  GROUP BY
    links.link_id, links.user_id, users.username, links.link_url, links.description, links.title, links.created_at
  HAVING
    COALESCE(SUM(votes.vote_type), 0) > 0
  ORDER BY
    links.created_at DESC;  
    `);
    const res = query.all(user_id);
    if (res == null) return [];
    return res as Link[];
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

}

export const linkRepository = LinkRepository.Instance;
