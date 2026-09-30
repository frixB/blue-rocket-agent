// npm run db:setup — create the auth tables and the demo customer.
// Reads DATABASE_URL from .env.local. Safe to run again: it resets the demo
// user's password and lockout, and leaves every other user alone.
import { readFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

/**
 * The demo customer. Owns every sample order in lib/orders/fixtures.ts, so
 * My Reports and Billing fill up after signing in. Local and preview only.
 */
export const DEMO_USER = { name: "Bob Johnson", email: "bob@johnsonplumbing.com", password: "BlueRocket-Demo-2026" };

for (const f of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in .env.local first (see .env.example).");

const salt = randomBytes(16);
const hash = `scrypt$${salt.toString("hex")}$${scryptSync(DEMO_USER.password, salt, 64).toString("hex")}`;

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
await client.query(
  `INSERT INTO users (name, email, "emailVerified", password_hash)
   VALUES ($1, $2, now(), $3)
   ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, failed_logins = 0, locked_until = NULL`,
  [DEMO_USER.name, DEMO_USER.email, hash],
);
await client.end();
console.log(`Database ready. Demo sign-in: ${DEMO_USER.email} / ${DEMO_USER.password}`);
