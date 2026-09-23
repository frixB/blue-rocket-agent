import Link from "next/link";
import { Check, FlaskConical, Rocket } from "lucide-react";
import { Card, Chip, Heading, Icon, IconTile, buttonStyles } from "@/components/ui";
import { SLA, formatPrice } from "@/lib/orders/sla";
import { MarketingSection } from "./marketing-section";
import { REPORT_SECTIONS, SECTION_ORDER } from "./report-sections";

/*
 * The landing page bands, top to bottom, mirroring Figma node 7203:2155
 * "Blue Rocket Agents — SEO Report Site". Copy about timing comes from SLA,
 * never from the design file.
 */

const price = formatPrice(SLA.priceCents);
const CONTACT = "hello@bluerocketagents.com";

export function Brand() {
  return (
    <span className="flex items-center gap-3 type-body-lg font-bold text-ink">
      <IconTile icon={Rocket} tone="action" size="xs" className="rounded-2xl" />
      Blue Rocket Agents
    </span>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 type-body-sm text-ink-2">
      <Icon icon={Check} size="sm" className="mt-0.5 text-success-accent" />
      <span>{children}</span>
    </li>
  );
}

export function LandingHero() {
  return (
    <header className="px-5 pb-24 pt-10">
      <div className="mx-auto flex w-full max-w-report flex-col gap-16">
        <Link href="/" aria-label="Blue Rocket Agents home" className="self-start"><Brand /></Link>
        <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-2xl flex-col items-start gap-6">
            <Chip tone="info">SEO clarity for local businesses</Chip>
            <Heading variant="display">
              Know exactly why your business isn&apos;t showing up <span className="text-info-ink">on Google</span>
            </Heading>
            <p className="type-lead text-ink-2">
              Understand what is holding your website back with a focused SEO report for a flat {price}. Clear priorities. Practical next steps. No subscription.
            </p>
            <Link href="/order" className={buttonStyles({ size: "lg" })}>Get started, {price}</Link>
            <ul className="flex flex-wrap gap-2" aria-label="What you can count on">
              <li><Chip>✓ Flat fee, no surprises</Chip></li>
              <li><Chip>⏱ Delivered within {SLA.businessDays} business day</Chip></li>
              <li><Chip>PDF report</Chip></li>
            </ul>
          </div>
          <Card className="w-full shrink-0 lg:max-w-rail">
            <p className="type-overline uppercase text-muted">What&apos;s in your report</p>
            <ol className="flex flex-col gap-4">
              {SECTION_ORDER.map((key, i) => {
                const s = REPORT_SECTIONS[key];
                return (
                  <li key={key} className="flex items-center gap-3.5">
                    <IconTile icon={s.icon} tone="info" size="sm" />
                    <span className="flex flex-col">
                      <span className="type-caption text-muted">Section {String(i + 1).padStart(2, "0")}</span>
                      <span className="type-body-strong text-ink">{s.name}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
      </div>
    </header>
  );
}

export function LandingIncluded() {
  return (
    <MarketingSection id="included" eyebrow="Explore the report" title="Everything you need to know"
      intro="A full picture of your SEO health, delivered as a clear, actionable PDF.">
      <nav aria-label="On this page" className="flex flex-wrap justify-center gap-2">
        <a href="#included" className={buttonStyles({ variant: "ghost", size: "sm" })}>What do I get?</a>
        <a href="#sample" className={buttonStyles({ variant: "ghost", size: "sm" })}>Show me an example</a>
        <a href="#faq" className={buttonStyles({ variant: "ghost", size: "sm" })}>FAQ</a>
      </nav>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SECTION_ORDER.map((key) => {
          const s = REPORT_SECTIONS[key];
          return (
            <li key={key}>
              <Card className="h-full bg-sunken">
                <IconTile icon={s.icon} tone="info" />
                <h3 className="type-heading-h4 text-ink">{s.name}</h3>
                <ul className="flex flex-col gap-1.5">{s.includes.map((x) => <CheckItem key={x}>{x}</CheckItem>)}</ul>
              </Card>
            </li>
          );
        })}
      </ul>
    </MarketingSection>
  );
}

const SAMPLE = [
  { priority: "Fix first", area: "Technical SEO", issue: "Some important pages cannot be indexed.", next: "Check indexing rules and submit the corrected sitemap." },
  { priority: "Improve next", area: "On-page SEO", issue: "Service pages need clearer titles and headings.", next: "Describe each service and location in a unique page title." },
];

export function LandingSample() {
  return (
    <MarketingSection id="sample" tint title="See what an actionable report looks like"
      intro="Illustrative preview. Sample findings, not results from a customer audit.">
      <ol className="mx-auto flex w-full max-w-main flex-col gap-3">
        {SAMPLE.map((f, i) => (
          <li key={f.issue}>
            <Card compact className="gap-2">
              <p className="type-overline uppercase text-action">{String(i + 1).padStart(2, "0")} · {f.priority} · {f.area}</p>
              <p className="type-body-strong text-ink">{f.issue}</p>
              <p className="type-body-sm text-ink-2">Next step: {f.next}</p>
            </Card>
          </li>
        ))}
      </ol>
      <p className="mx-auto max-w-main text-center type-body text-ink-2">
        Every finding connects the issue, its impact and a practical next step. Your report covers technical, on-page, backlink and competitor analysis.
      </p>
    </MarketingSection>
  );
}

const STEPS = [
  { title: "Tell us about your business", body: "Share your website, industry and location so the report is relevant to your market." },
  { title: "Pay once, then follow the analysis", body: `Review your details and pay ${price}. Your order page shows progress after payment.` },
  { title: "Receive your report", body: "We email you when it's ready. Review the priorities and download a PDF to share." },
];

const FAQ = [
  { q: "When does analysis run?", a: "Our agents work Monday to Friday. Order any time: weekend orders start first thing Monday. Track progress on your order page, and we email you when the report is ready." },
  { q: "What does the price include?", a: "One SEO audit report covering four areas of search performance, with prioritised recommendations. There is no subscription. Implementing the recommendations is separate." },
  { q: "What if the site can't be audited?", a: "You'll see the issue and any action needed on your order page. If we can't complete the audit, you get a full refund." },
];

export function LandingHowItWorks() {
  return (
    <MarketingSection id="faq" title="From your website to your next move">
      <ol className="grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-2">
            <span className="type-overline text-action">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="type-heading-h4 text-ink">{s.title}</h3>
            <p className="type-body text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-5">
        <Heading as="h3" variant="h2">Before you get started</Heading>
        <dl className="grid gap-5 md:grid-cols-3">
          {FAQ.map((f) => (
            <div key={f.q} className="flex flex-col gap-1.5">
              <dt className="type-body-strong text-ink">{f.q}</dt>
              <dd className="type-body text-ink-2">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </MarketingSection>
  );
}

export function LandingPricing() {
  return (
    <MarketingSection id="pricing" tint eyebrow="Available now" title="Choose your report"
      intro="Start with our flagship SEO audit. More specialised reports are coming soon.">
      <div className="mx-auto grid w-full max-w-wide gap-5 md:grid-cols-2">
        <Card className="shadow-raised">
          <Chip tone="success" className="self-start">✓ Available now</Chip>
          <Heading as="h3" variant="h2">{SLA.productName}</Heading>
          <p className="type-body text-ink-2">A four-section audit covering every aspect of your site&apos;s search performance, with prioritised action items.</p>
          <p className="flex items-baseline gap-2"><span className="type-display text-ink">{price}</span><span className="type-body-lg text-muted">flat fee</span></p>
          <ul className="flex flex-col gap-2">
            {SECTION_ORDER.map((k) => <CheckItem key={k}>{REPORT_SECTIONS[k].name}</CheckItem>)}
            <CheckItem>Email when your report is ready</CheckItem>
            <CheckItem>PDF, ready to share</CheckItem>
          </ul>
          <Link href="/order" className={buttonStyles({ full: true, size: "lg" })}>Get started, {price}</Link>
        </Card>
        <Card className="bg-sunken">
          <Chip className="self-start">Coming soon</Chip>
          <IconTile icon={FlaskConical} tone="neutral" />
          <Heading as="h3" variant="h2">More reports</Heading>
          <p className="type-body text-ink-2">
            We&apos;re building more specialised reports: Local SEO, Google Ads audit, content strategy and more. Ask to join the waitlist and you&apos;ll be first to know when they launch.
          </p>
          <a href={`mailto:${CONTACT}?subject=${encodeURIComponent("Waitlist: more reports")}`} className={buttonStyles({ variant: "ghost", full: true })}>Notify me when available</a>
        </Card>
      </div>
    </MarketingSection>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline px-5 py-16">
      <div className="mx-auto flex w-full max-w-report flex-col gap-10">
        <div className="flex max-w-md flex-col gap-3">
          <Brand />
          <p className="type-body-sm text-ink-2">AI-powered SEO audits for local businesses. Understand what is holding your site back and what to improve next.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6 type-caption text-muted">
          <p>© 2026 Blue Rocket Agents. All rights reserved.</p>
          <a href={`mailto:${CONTACT}`} className="hover:text-ink">Contact</a>
        </div>
      </div>
    </footer>
  );
}
