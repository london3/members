import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  // Create tables
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      password TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Post (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      authorId TEXT NOT NULL REFERENCES User(id),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Comment (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      postId TEXT NOT NULL REFERENCES Post(id) ON DELETE CASCADE,
      authorId TEXT NOT NULL REFERENCES User(id),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Event (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER,
      createdById TEXT NOT NULL REFERENCES User(id),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS EventRsvp (
      id TEXT PRIMARY KEY,
      eventId TEXT NOT NULL REFERENCES Event(id) ON DELETE CASCADE,
      userId TEXT NOT NULL REFERENCES User(id),
      status TEXT NOT NULL DEFAULT 'attending',
      UNIQUE(eventId, userId)
    );

    CREATE TABLE IF NOT EXISTS LoginToken (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS EventInvite (
      id TEXT PRIMARY KEY,
      eventId TEXT NOT NULL REFERENCES Event(id) ON DELETE CASCADE,
      userId TEXT NOT NULL REFERENCES User(id),
      token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending',
      respondedAt TEXT,
      sentAt TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(eventId, userId)
    );
  `);

  console.log("Tables created.");

  // Seed admin user
  const existing = await client.execute({
    sql: "SELECT id FROM User WHERE email = ?",
    args: ["admin@example.com"],
  });

  if (existing.rows.length === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const id = "admin-" + Date.now();

    await client.execute({
      sql: "INSERT INTO User (id, email, name, role, password, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
      args: [id, "admin@example.com", "管理者", "admin", hashedPassword, 1],
    });
    console.log("Seed completed: admin@example.com / admin123");
  } else {
    console.log("Admin user already exists, skipping.");
  }
}

main().catch(console.error);
