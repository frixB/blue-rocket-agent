/** Dark is where we sell. Every token flips via data-theme, no dark: variants. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="marketing" className="min-h-dvh bg-page text-ink">{children}</div>;
}
