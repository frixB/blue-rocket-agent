import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import PostgresAdapter from "@auth/pg-adapter";
import { db, findUserByEmail } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

/**
 * Customer sign-in (S-05, S-07, S-18, S-18b, S-19, S-20). architecture.md §9.
 *
 * - Email link first: Auth.js Resend provider, tokens in Postgres.
 * - Password second: Credentials provider, scrypt hashes, 5 attempts then a
 *   15-minute lock (the copy on S-18b promises this).
 * - JWT sessions, because the Credentials provider requires them.
 *
 * With no AUTH_RESEND_KEY, local development shows the sign-in link on
 * screen instead of emailing it (see devLinks). Production without a key
 * refuses to send rather than pretending it did.
 */

/** Sign-in is live only once the database and secret are configured. */
export const authEnabled = Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET);

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export class AccountLocked extends CredentialsSignin {
  code = "locked";
}

/** Dev only: the last sign-in link per email, shown on the "check your inbox" screen. */
const g = globalThis as unknown as { __braDevLinks?: Map<string, string> };
export const devLinks = (g.__braDevLinks ??= new Map<string, string>());
export const showDevLinks = process.env.NODE_ENV === "development" && !process.env.AUTH_RESEND_KEY;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: db ? PostgresAdapter(db) : undefined,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in", verifyRequest: "/sign-in", error: "/sign-in" },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM ?? "Blue Rocket Agents <hello@bluerocketagents.com>",
      maxAge: 60 * 60,
      async sendVerificationRequest({ identifier, url, provider }) {
        if (showDevLinks) {
          devLinks.set(identifier.toLowerCase(), url);
          return;
        }
        if (!provider.apiKey) throw new Error("AUTH_RESEND_KEY is not set, so sign-in emails can't be sent.");
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: "Your Blue Rocket Agents sign-in link",
            text: `Use this link to sign in. It works for 60 minutes and only once.\n\n${url}\n\nIf you didn't ask for this, you can ignore this email.`,
          }),
        });
        if (!res.ok) throw new Error(`Resend refused the email: ${res.status}`);
      },
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const email = String(raw?.email ?? "").trim();
        const password = String(raw?.password ?? "");
        const user = await findUserByEmail(email);
        if (!user || !db) return null;
        if (user.locked_until && user.locked_until.getTime() > Date.now()) throw new AccountLocked();
        if (!(await verifyPassword(password, user.password_hash))) {
          const failed = user.failed_logins + 1;
          const lock = failed >= MAX_ATTEMPTS;
          await db.query("UPDATE users SET failed_logins = $2, locked_until = $3 WHERE id = $1", [
            user.id,
            lock ? 0 : failed,
            lock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
          ]);
          if (failed >= MAX_ATTEMPTS) throw new AccountLocked();
          return null;
        }
        await db.query("UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = $1", [user.id]);
        return { id: String(user.id), name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = String(user.id);
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

/** The signed-in customer, or null. Never throws when auth isn't configured. */
export async function currentUser() {
  if (!authEnabled) return null;
  const session = await auth();
  return session?.user?.email ? { id: session.user.id ?? "", name: session.user.name ?? session.user.email, email: session.user.email } : null;
}
