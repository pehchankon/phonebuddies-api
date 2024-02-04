import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite", { create: true });
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS links (
    link_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    link_url TEXT NOT NULL,
    description TEXT,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
  );`
);

db.run(`
  CREATE TABLE IF NOT EXISTS votes (
    vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    link_id INTEGER NOT NULL,
    vote_type INTEGER NOT NULL,
    UNIQUE(user_id, link_id), 
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (link_id) REFERENCES links(link_id)
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS blacklist (
    blacklist_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    link_id INTEGER NOT NULL,
    UNIQUE(user_id, link_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (link_id) REFERENCES links(link_id)
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS phone_points (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    phone_points INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
  );
`)

export { db };
