import { describe, expect, it } from "vitest";
import { isPrivateAddress, normaliseUrl, titleMentions } from "./verify-url";

describe("normaliseUrl", () => {
  it("adds https:// when missing", () => expect(normaliseUrl("johnsonplumbing.com")?.toString()).toBe("https://johnsonplumbing.com/"));
  it("rejects a bare word", () => expect(normaliseUrl("johnsonplumbing")).toBeNull());
  it("rejects other protocols", () => expect(normaliseUrl("file:///etc/passwd")).toBeNull());
  it("rejects credentials in the URL", () => expect(normaliseUrl("https://a:b@example.com")).toBeNull());
});

describe("isPrivateAddress", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "::1", "fd00::1", "::ffff:127.0.0.1"])("blocks %s", (ip) =>
    expect(isPrivateAddress(ip)).toBe(true));
  it.each(["93.184.216.34", "8.8.8.8", "2606:4700::1111"])("allows %s", (ip) => expect(isPrivateAddress(ip)).toBe(false));
});

describe("titleMentions", () => {
  it("matches a distinctive word", () => expect(titleMentions("Johnson & Sons Plumbing | Emergency Plumbers Austin", "Johnson & Sons Plumbing")).toBe(true));
  it("flags a directory site", () => expect(titleMentions("Austin Plumbers Network | Directory", "Johnson & Sons")).toBe(false));
});
