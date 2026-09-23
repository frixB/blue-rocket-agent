import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * S-01. Checks, before payment, that we can reach the site the customer typed
 * and that it looks like their business. Runs server-side from
 * app/api/verify-url. The URL is user input, so every hop is checked against
 * private and internal address ranges before we connect (no SSRF).
 */

export type VerifyResult =
  | { state: "verified"; url: string; title: string; ms: number }
  | { state: "mismatch"; url: string; title: string; ms: number }
  | { state: "unreachable"; reason: "invalid" | "blocked" | "timeout" | "error" };

const TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 3;
const MAX_BYTES = 256_000;

/** Adds https:// when missing and rejects anything that is not a public web URL. */
export function normaliseUrl(input: string): URL | null {
  const raw = input.trim();
  if (!raw || /\s/.test(raw)) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    if (!url.hostname.includes(".") && isIP(url.hostname) === 0) return null;
    return url;
  } catch {
    return null;
  }
}

export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number) as [number, number];
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe8") || v6.startsWith("fe9") ||
    v6.startsWith("fea") || v6.startsWith("feb") || v6.startsWith("ff");
}

async function assertPublicHost(host: string) {
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
  if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) throw new Error("blocked");
}

async function readTitle(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    size += value.length;
    if (/<\/title>/i.test(new TextDecoder().decode(value))) break;
  }
  await reader.cancel().catch(() => {});
  const html = new TextDecoder().decode(Buffer.concat(chunks));
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return (m?.[1] ?? "").replace(/\s+/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim().slice(0, 140);
}

/** "Johnson & Sons Plumbing" matches a title containing "johnson" or "johnson sons". */
export function titleMentions(title: string, businessName: string): boolean {
  const words = businessName.toLowerCase().replace(/&/g, " ").split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !["the", "and", "llc", "inc", "ltd", "co"].includes(w));
  if (!words.length) return true;
  const t = title.toLowerCase();
  return words.some((w) => t.includes(w));
}

export async function verifyUrl(input: string, businessName: string): Promise<VerifyResult> {
  let url = normaliseUrl(input);
  if (!url) return { state: "unreachable", reason: "invalid" };
  const started = Date.now();
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublicHost(url.hostname);
      const res = await fetch(url, { redirect: "manual", signal, headers: { "user-agent": "BlueRocketBot/1.0 (+https://bluerocketagents.com)", accept: "text/html" } });
      const next = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
      if (next) {
        await res.body?.cancel().catch(() => {});
        url = normaliseUrl(new URL(next, url).toString());
        if (!url) return { state: "unreachable", reason: "invalid" };
        continue;
      }
      if (!res.ok) return { state: "unreachable", reason: "error" };
      const title = await readTitle(res);
      const ms = Date.now() - started;
      return { state: titleMentions(title, businessName) ? "verified" : "mismatch", url: url.toString(), title, ms };
    }
    return { state: "unreachable", reason: "error" };
  } catch (e) {
    if (e instanceof Error && e.message === "blocked") return { state: "unreachable", reason: "blocked" };
    if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) return { state: "unreachable", reason: "timeout" };
    return { state: "unreachable", reason: "error" };
  }
}
