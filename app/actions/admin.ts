"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { previewEnabled } from "@/lib/preview";
import { ROLE_COOKIE } from "@/lib/admin/session";

/** Review builds only: preview the admin as an owner or as Ops. Auth replaces this. */
export async function previewAdminRole(formData: FormData) {
  if (!previewEnabled) return;
  const role = formData.get("role") === "ops" ? "ops" : "owner";
  (await cookies()).set(ROLE_COOKIE, role, { path: "/admin", sameSite: "lax", httpOnly: true });
  revalidatePath("/admin", "layout");
}
