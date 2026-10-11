// Run: node --env-file=.env.local scripts/setup-login-demo.cjs
import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Login demo setup is local-only.");
  }
  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");
  const target = new URL(process.env.DATABASE_URL);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)) {
    throw new Error("Demo setup requires a local database.");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`CREATE TABLE IF NOT EXISTS demo_login_users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_plain TEXT NOT NULL
    )`);
    const accounts = [
      {
        email: "demo_a@example.com",
        username: "sql_demo_a",
        password: "DemoA@123",
      },
      {
        email: "demo_b@example.com",
        username: "sql_demo_b",
        password: "DemoB@456",
      },
    ];
    for (const account of accounts) {
      const existing = await client.query(
        "SELECT username FROM users WHERE email = $1",
        [account.email],
      );
      if (existing.rows[0] && existing.rows[0].username !== account.username) {
        throw new Error(
          "Demo email belongs to another profile: " + account.email,
        );
      }
      await client.query(
        `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING`,
        [
          account.username,
          account.email,
          await bcrypt.hash(account.password, 12),
        ],
      );
      await client.query(
        `INSERT INTO demo_login_users (email, password_plain) VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET password_plain = EXCLUDED.password_plain`,
        [account.email, account.password],
      );
    }
    await client.query("COMMIT");
    console.log("Ready: sql_demo_a / sql_demo_b have Feed profiles.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
