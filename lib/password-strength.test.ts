import { describe, expect, it } from "vitest";
import { passwordStrength } from "./password-strength";

describe("passwordStrength", () => {
  it("flags short passwords", () => expect(passwordStrength("abc123")).toBe("Too short"));
  it("one character class is weak", () => expect(passwordStrength("plumbingco")).toBe("Weak"));
  it("two classes is fair", () => expect(passwordStrength("plumbing12")).toBe("Fair"));
  it("long or varied is strong", () => expect(passwordStrength("Plumbing-2026!")).toBe("Strong"));
});
