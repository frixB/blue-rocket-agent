export type Strength = "Too short" | "Weak" | "Fair" | "Strong";

/** Rough, friendly guidance for S-07. The server still enforces length. */
export function passwordStrength(pw: string): Strength {
  if (pw.length < 8) return "Too short";
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (pw.length >= 14 || (pw.length >= 10 && classes >= 3)) return "Strong";
  return classes >= 2 ? "Fair" : "Weak";
}
