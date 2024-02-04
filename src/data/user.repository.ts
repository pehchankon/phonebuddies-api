import User from "../models/user";
import { db } from "./base";
import { generateBcryptHash } from "../utils/passwordGeneration";

class UserRepository {

  private static _instance: UserRepository;

  public async getById(id: number): Promise<User | null> {
    const query = db.query(`SELECT * from users where user_id = $p1`);
    const res = query.get(id) as User;
    return res;
  }

  public async getByUsername(username: string): Promise<User | null> {
    const query = db.query(`SELECT * from users where username = $p1`);
    const res = query.get(username) as User;
    return res;
  }

  public async createUser(user: User): Promise<User> {
    const hashedPassword = await generateBcryptHash(user.password);
    const query = db.query(`INSERT INTO users (username, password)
    VALUES ($p1, $p2);`);
    const query2 = db.query(`INSERT INTO phone_points (user_id, username)
    VALUES ($userId, $username)`);
    query.run(user.username, hashedPassword);
    const fetchedUser = (await this.getByUsername(user.username)) as User;
    query2.run(fetchedUser.user_id, fetchedUser.username);
    return fetchedUser;
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

}

export const userRepository = UserRepository.Instance;
