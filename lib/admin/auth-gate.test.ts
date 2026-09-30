import { describe, expect, it } from "vitest";
import { isPublicAdminPath, safeNext } from "./auth-gate";

describe("safeNext", () => {
  it("keeps admin paths, with their filters", () => {
    expect(safeNext("/admin/orders?status=problems")).toBe("/admin/orders?status=problems");
  });
  it("sends anything else to the Overview", () => {
    for (const bad of [undefined, "", "https://evil.test/admin", "//evil.test/admin", "/reports", "/administrator"]) {
      expect(safeNext(bad), String(bad)).toBe("/admin");
    }
  });
  it("never returns to a sign-in screen, which would loop", () => {
    expect(safeNext("/admin/sign-in/verify")).toBe("/admin");
  });
});

describe("isPublicAdminPath", () => {
  it("lets the sign-in, invite and signed-out screens through", () => {
    expect(isPublicAdminPath("/admin/sign-in")).toBe(true);
    expect(isPublicAdminPath("/admin/sign-in/verify")).toBe(true);
    expect(isPublicAdminPath("/admin/invite/abc")).toBe(true);
    expect(isPublicAdminPath("/admin/signed-out")).toBe(true);
  });
  it("guards everything else, including look-alike paths", () => {
    expect(isPublicAdminPath("/admin")).toBe(false);
    expect(isPublicAdminPath("/admin/orders")).toBe(false);
    expect(isPublicAdminPath("/admin/sign-in-as-owner")).toBe(false);
  });
});
