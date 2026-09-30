import Link from "next/link";
import { ArrowRight, Check, FileText, FlaskConical, Timer } from "lucide-react";
import { Card, Chip, Heading, Icon, IconTile, buttonStyles } from "@/components/ui";
import { SLA, formatPriceShort } from "@/lib/orders/sla";
import { Brand } from "./brand";
import { MarketingSection } from "./marketing-section";
import { REPORT_SECTIONS, SECTION_ORDER } from "./report-sections";
import { WaitlistDialog } from "./waitlist-dialog";

/*
 * The landing page bands, top to bottom, mirroring Figma node 7203:2155
 * "Blue Rocket Agents — SEO Report Site". Copy about timing comes from SLA,
 * never from the design file.
 */

const price = formatPriceShort(SLA.priceCents);
const CONTACT = "hello@bluerocketagents.com";

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
    <section aria-label="Introduction" className="relative isolate overflow-hidden px-5 pb-0 pt-14 sm:pt-18 lg:pt-20">
      <div className="hero-starfield pointer-events-none absolute inset-0 -z-20" aria-hidden />
      <div className="mx-auto flex w-full max-w-report flex-col items-center text-center">
        <div className="flex max-w-[56rem] flex-col items-center gap-6">
          <Heading variant="display" className="type-bra-display-responsive max-w-[54rem] text-balance">
            See what&apos;s keeping your business <span className="text-info-ink">out of orbit on Google</span>
          </Heading>
          <p className="max-w-[42rem] type-lead text-ink-2">
            A focused SEO report that turns hidden problems into a clear plan—for a flat {price}, with no subscription.
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/order" className={`${buttonStyles({ size: "lg" })} landing-primary`}>Get my SEO report <Icon icon={ArrowRight} size="sm" /></Link>
            <a href="#sample" className={buttonStyles({ variant: "darkghost", size: "lg" })}>See a sample finding</a>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 type-caption text-ink-2" aria-label="What you can count on">
            <li className="flex items-center gap-1.5"><Icon icon={Check} size="sm" className="text-success-accent" /> Flat {price} fee</li>
            <li className="flex items-center gap-1.5"><Icon icon={Timer} size="sm" className="text-success-accent" /> Within {SLA.businessDays} business day</li>
            <li className="flex items-center gap-1.5"><Icon icon={FileText} size="sm" className="text-success-accent" /> Prioritised next steps</li>
          </ul>
        </div>

        <div className="relative mt-8 h-[25rem] w-full max-w-[64rem] overflow-hidden sm:mt-10 sm:h-[32rem]" aria-label="The four areas covered by the SEO report">
          <div className="hero-orbit hero-orbit-far" aria-hidden />
          <div className="hero-orbit hero-orbit-near" aria-hidden />
          <div className="hero-planet" aria-hidden>
            <div className="hero-planet-grid" />
          </div>
          <ol className="absolute inset-0">
            {SECTION_ORDER.map((key, i) => {
              const s = REPORT_SECTIONS[key];
              return (
                <li key={key} className={`hero-signal hero-signal-${i + 1}`}>
                  <IconTile icon={s.icon} tone="info" size="sm" />
                  <span className="min-w-0 text-left">
                    <span className="block type-caption text-muted">0{i + 1}</span>
                    <span className="block whitespace-nowrap type-body-strong text-ink">{s.name}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function LandingIncluded() {
  return (
    <MarketingSection id="included" title="Four parts. One clear plan."
      intro="We examine the foundations, the pages, the signals beyond your site and the competitors around you.">
      <div className="report-scope-grid mx-auto grid w-full max-w-wide md:grid-cols-2">
        {SECTION_ORDER.map((key) => {
          const s = REPORT_SECTIONS[key];
          return (
            <details key={key} className="report-scope-item group">
              <summary className="flex min-h-control-md cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-5 transition-colors hover:bg-sunken">
                <IconTile icon={s.icon} tone="info" size="sm" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="type-heading-h4 text-ink">{s.name}</span>
                  <span className="type-caption text-muted">{s.includes.length} focused checks · View details</span>
                </span>
                <span aria-hidden className="type-heading-h4 text-action transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <ul className="report-scope-content mx-4 mb-5 flex flex-col gap-1.5 border-t border-hairline pb-1 pt-4 sm:pl-11">{s.includes.map((x) => <CheckItem key={x}>{x}</CheckItem>)}</ul>
            </details>
          );
        })}
      </div>
      <div className="flex justify-center">
        <a href="#sample" className={buttonStyles({ variant: "ghost", size: "sm" })}>See how findings become next steps</a>
      </div>
    </MarketingSection>
  );
}

const SAMPLE = [
  { priority: "Fix first", area: "Technical SEO", issue: "Some important pages cannot be indexed.", next: "Check indexing rules and submit the corrected sitemap." },
  { priority: "Improve next", area: "On-page SEO", issue: "Service pages need clearer titles and headings.", next: "Describe each service and location in a unique page title." },
];

export function LandingSample() {
  return (
    <MarketingSection id="sample" theme="marketing" className="sample-section relative overflow-hidden" title="From finding to next step"
      intro="Illustrative preview. Sample findings, not results from a customer audit.">
      <ol className="sample-findings mx-auto w-full max-w-wide border-y border-hairline">
        {SAMPLE.map((f, i) => (
          <li key={f.issue} className="sample-finding grid gap-4 border-b border-hairline px-3 py-7 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-8 md:px-5">
            <div className="flex min-w-0 gap-4">
              <span className="type-bra-heading-2 text-action">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="type-overline uppercase text-action">{f.priority} · {f.area}</p>
                <p className="type-body-strong text-ink">{f.issue}</p>
              </div>
            </div>
            <Icon icon={ArrowRight} className="sample-finding-arrow hidden text-muted md:block" />
            <div className="flex flex-col gap-1 pl-12 md:pl-0">
              <p className="type-caption-strong text-muted">Recommended next step</p>
              <p className="type-body-sm text-ink-2">{f.next}</p>
            </div>
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
      <ol className="process-path grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="process-step relative flex flex-col gap-2 rounded-card px-5 py-6">
            <span className="process-marker flex size-10 items-center justify-center rounded-full border border-hairline bg-raised type-caption-strong text-action">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="type-heading-h4 text-ink">{s.title}</h3>
            <p className="type-body text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-6 border-t border-hairline pt-10">
        <Heading as="h3" variant="h2">Before you get started</Heading>
        <dl className="faq-grid grid gap-x-8 gap-y-7 md:grid-cols-3">
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
    <MarketingSection id="pricing" tint title="Get your SEO report"
      intro="One focused audit for a flat fee. More specialised reports are coming soon.">
      <div className="mx-auto grid w-full max-w-wide gap-5 md:grid-cols-[1.08fr_0.92fr]">
        <Card className="pricing-featured relative overflow-hidden shadow-raised">
          <Chip tone="success" icon={Check} className="self-start">Available now</Chip>
          <Heading as="h3" variant="h2">{SLA.productName}</Heading>
          <p className="type-body text-ink-2">A four-section audit covering every aspect of your site&apos;s search performance, with prioritised action items.</p>
          <p className="flex items-baseline gap-2"><span className="type-display text-ink">{price}</span><span className="type-body-lg text-muted">flat fee</span></p>
          <ul className="flex flex-col gap-2">
            <CheckItem>All four areas of your search performance</CheckItem>
            <CheckItem>Prioritised recommendations and practical next steps</CheckItem>
            <CheckItem>Email delivery and a PDF ready to share</CheckItem>
          </ul>
          <Link href="/order" className={`${buttonStyles({ full: true, size: "lg" })} landing-primary`}>Get started, {price} <Icon icon={ArrowRight} size="sm" /></Link>
        </Card>
        <Card className="pricing-upcoming bg-sunken">
          <Chip className="self-start">Coming soon</Chip>
          <IconTile icon={FlaskConical} tone="neutral" />
          <Heading as="h3" variant="h2">More reports</Heading>
          <p className="type-body text-ink-2">
            We&apos;re building more specialised reports: Local SEO, Google Ads audit, content strategy and more. Join the waitlist and you&apos;ll be first to know when they launch.
          </p>
          <WaitlistDialog />
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
