import { previewEnabled } from "./preview";

/** Reads `?preview=sent|error` for review builds; always undefined in production. */
export function previewParam(value: string | string[] | undefined): "sent" | "error" | undefined {
  if (!previewEnabled) return undefined;
  return value === "sent" || value === "error" ? value : undefined;
}
