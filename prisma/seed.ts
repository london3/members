/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "dev.db");
const db = new Database(dbPath);

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const id = "admin-" + Date.now();

  const existing = db.prepare("SELECT id FROM User WHERE email = ?").get("admin@example.com");

  if (!existing) {
    db.prepare(
      "INSERT INTO User (id, email, name, role, password, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
    ).run(id, "admin@example.com", "管理者", "admin", hashedPassword, 1);
    console.log("Seed completed: admin@example.com / admin123");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  db.close();
}

main().catch(console.error);
