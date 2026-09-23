import { NextResponse } from "next/server";
import { verifyUrl } from "@/lib/verify-url";

/** S-01. POST { url, businessName } → VerifyResult. Called on blur in Form Step 1. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { url?: unknown; businessName?: unknown } | null;
  if (typeof body?.url !== "string" || body.url.length > 2_000) return NextResponse.json({ state: "unreachable", reason: "invalid" }, { status: 400 });
  const name = typeof body.businessName === "string" ? body.businessName.slice(0, 200) : "";
  return NextResponse.json(await verifyUrl(body.url, name));
}
