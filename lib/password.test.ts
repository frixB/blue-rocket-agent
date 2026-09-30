import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the right password", async () => expect(await verifyPassword("Blue-Rocket-2026", await hashPassword("Blue-Rocket-2026"))).toBe(true));
  it("rejects the wrong password", async () => expect(await verifyPassword("wrong", await hashPassword("Blue-Rocket-2026"))).toBe(false));
  it("salts every hash", async () => expect(await hashPassword("same")).not.toBe(await hashPassword("same")));
  it("rejects a missing or malformed hash", async () => {
    expect(await verifyPassword("x", null)).toBe(false);
    expect(await verifyPassword("x", "md5$abc")).toBe(false);
  });
});
