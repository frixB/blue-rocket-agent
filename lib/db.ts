import { Pool } from "pg";

/**
 * One Postgres pool per server process. Kept on globalThis so dev hot reload
 * doesn't open a new pool on every edit.
 */
const g = globalThis as unknown as { __braPool?: Pool };

export const db: Pool | null = process.env.DATABASE_URL
  ? (g.__braPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }))
  : null;

export type UserRow = {
  id: number;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  password_hash: string | null;
  failed_logins: number;
  locked_until: Date | null;
};

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  if (!db) return null;
  const { rows } = await db.query<UserRow>('SELECT id, name, email, "emailVerified", password_hash, failed_logins, locked_until FROM users WHERE lower(email) = lower($1)', [email]);
  return rows[0] ?? null;
}
