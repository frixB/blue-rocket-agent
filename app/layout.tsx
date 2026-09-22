import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/instrument-serif/400.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Blue Rocket Agents: SEO reports in one business day",
  description: "A full SEO audit of your website, $1,500 flat, delivered within one business day.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
