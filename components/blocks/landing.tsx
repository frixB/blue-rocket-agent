import Link from "next/link";
import { ArrowRight, Check, FileText, Lock, ShieldCheck, Timer } from "lucide-react";
import { Card, Chip, Heading, Icon, IconTile, buttonStyles } from "@/components/ui";
import { SLA, formatPriceShort } from "@/lib/orders/sla";
import { Brand } from "./brand";
import { MarketingSection } from "./marketing-section";
import { REPORT_SECTIONS, SECTION_ORDER } from "./report-sections";
import { UPCOMING_REPORTS } from "./upcoming-reports";
import { WaitlistDialog } from "./waitlist-dialog";

/*
 * The landing page bands, top to bottom, mirroring Figma node 7203:2155
 * "Blue Rocket Agents — SEO Report Site". Copy about timing comes from SLA,
 * never from the design file.
 */

const price = formatPriceShort(SLA.priceCents);
const CONTACT = "hello@bluerocketagents.com";
/** One refund promise, worded once. */
const REFUND = "Full refund if we can't complete your audit";
/** Total checks across the four sections, from the same list the report uses. */
const CHECKS = SECTION_ORDER.reduce((n, k) => n + REPORT_SECTIONS[k].includes.length, 0);
/** Who does the audit, said once and early. */
const WHO = "AI agents run the analysis, and a person reviews every report before it reaches you.";

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 type-body-sm text-ink-2">
      <Icon icon={Check} size="sm" className="mt-0.5 text-success-accent" />
      <span>{children}</span>
    </li>
  );
}

/**
 * The buy action, repeated where intent peaks: after the proof, after the
 * objections, and at the close. Same label and destination everywhere.
 */
export function OrderCta({ note, align = "center", withPrice }: { note?: string; align?: "center" | "start"; withPrice?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start"}`}>
      <Link href="/order" className={`${buttonStyles({ size: "lg" })} landing-primary`}>
        Get my SEO report{withPrice ? `, ${price}` : ""} <Icon icon={ArrowRight} size="sm" />
      </Link>
      {note && <p className="type-caption text-muted">{note}</p>}
    </div>
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
            <a href="#sample" className={buttonStyles({ variant: "darkghost", size: "lg" })}>See an example report</a>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 type-caption text-ink-2" aria-label="What you can count on">
            <li className="flex items-center gap-1.5"><Icon icon={Timer} size="sm" className="text-success-accent" /> Report within {SLA.deliveryHours} hours, every day</li>
            <li className="flex items-center gap-1.5"><Icon icon={FileText} size="sm" className="text-success-accent" /> Prioritised next steps</li>
            <li className="flex items-center gap-1.5"><Icon icon={ShieldCheck} size="sm" className="text-success-accent" /> {REFUND}</li>
          </ul>
        </div>

        <div className="hero-stage relative mt-8 h-[22rem] w-full max-w-[64rem] overflow-hidden sm:mt-10 sm:h-[32rem]" aria-label="The four areas covered by the SEO report">
          <div className="hero-orbit hero-orbit-far" aria-hidden />
          <div className="hero-orbit hero-orbit-near" aria-hidden />
          <div className="hero-planet" aria-hidden>
            <div className="hero-planet-grid" />
          </div>
          <ol className="absolute inset-0 max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-5 max-sm:grid max-sm:grid-cols-2 max-sm:gap-2">
            {SECTION_ORDER.map((key, i) => {
              const s = REPORT_SECTIONS[key];
              return (
                <li key={key} className={`hero-signal hero-signal-${i + 1}`}>
                  <IconTile icon={s.icon} tone="info" size="sm" />
                  <span className="min-w-0 text-left">
                    <span className="block type-caption text-muted">0{i + 1}</span>
                    <span className="block type-body-strong text-ink sm:whitespace-nowrap">{s.name}</span>
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
    </MarketingSection>
  );
}

/*
 * The example report excerpt (#sample). Same structure as a delivered report
 * (score, counts, "Fix first", findings by severity) so visitors see what they
 * are buying. The business is fictional and the page says so.
 */
const EXAMPLE = {
  business: "A local plumbing company",
  city: "Austin, TX",
  score: 61,
  issues: 23,
  critical: 4,
  pages: 14,
  fixFirst: [
    { action: "Compress the homepage hero image", why: "About an hour of work, and the biggest single traffic gain." },
    { action: "Fix the four broken menu links", why: "Your own site is pointing Google at dead pages." },
    { action: "Build one page for \u201cemergency plumber Austin\u201d", why: "It's the search term you're closest to winning." },
  ],
  findings: [
    { severity: "critical", area: "Technical SEO", title: "Homepage takes 6.8s to load on mobile", body: "Google's threshold is 2.5s, and 71% of visits come from phones." },
    { severity: "critical", area: "On-Page SEO", title: "No main heading on 9 of 14 pages", body: "Google can't tell what those pages are about." },
    { severity: "medium", area: "Technical SEO", title: "robots.txt blocks your own sitemap", body: "A leftover staging rule stops Google reading /sitemap.xml." },
    { severity: "pass", area: "Technical SEO", title: "HTTPS and redirects", body: "All traffic redirects correctly to the secure site." },
  ],
} as const;

const SEVERITY = { critical: { tone: "danger", label: "Critical" }, medium: { tone: "warning", label: "Medium" }, pass: { tone: "success", label: "Pass" } } as const;

/**
 * Proof slots. Leave null until real material exists; never fill with
 * invented quotes. `quote` renders under the report, `samplePdf` adds a link.
 */
const PROOF: { quote: { text: string; name: string; business: string } | null; samplePdf: string | null } = { quote: null, samplePdf: null };

export function LandingSample() {
  return (
    <MarketingSection id="sample" theme="marketing" className="sample-section relative overflow-hidden" title="See what you get"
      intro={`An excerpt from an example report. Yours is built from your own website and covers all four areas. ${WHO}`}>
      <article aria-label="Example report excerpt" className="report-sheet mx-auto w-full max-w-wide overflow-hidden rounded-card border border-hairline bg-raised">
        <header className="flex flex-col gap-4 border-b border-hairline px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
          <div className="flex flex-col gap-1">
            <p className="type-caption text-muted">Example report · fictional business</p>
            <p className="type-heading-h4 text-ink">{EXAMPLE.business}, {EXAMPLE.city}</p>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              [`${EXAMPLE.score}/100`, "health score"],
              [String(EXAMPLE.issues), "issues"],
              [String(EXAMPLE.critical), "critical"],
              [String(EXAMPLE.pages), "pages checked"],
            ].map(([v, k]) => (
              <div key={k} className="flex items-baseline gap-1.5">
                <dt className="sr-only">{k}</dt>
                <dd className="type-body-strong tabular-nums text-ink">{v}</dd>
                <span aria-hidden className="type-caption text-muted">{k}</span>
              </div>
            ))}
          </dl>
        </header>
        <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section aria-labelledby="example-fix-first" className="flex flex-col gap-4 border-b border-hairline px-5 py-6 sm:px-7 md:border-b-0 md:border-r">
            <h3 id="example-fix-first" className="type-body-strong text-ink">Fix first</h3>
            <ol className="flex flex-col gap-4">
              {EXAMPLE.fixFirst.map((f, i) => (
                <li key={f.action} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2">
                  <span className="type-body-strong tabular-nums text-info-ink">{i + 1}</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="type-body-strong text-ink">{f.action}</span>
                    <span className="type-body-sm text-ink-2">{f.why}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="example-findings" className="flex flex-col gap-4 px-5 py-6 sm:px-7">
            <h3 id="example-findings" className="type-body-strong text-ink">Findings</h3>
            <ul className="flex flex-col divide-y divide-hairline">
              {EXAMPLE.findings.map((f) => (
                <li key={f.title} className="flex flex-col gap-1.5 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:gap-4">
                  <span className="w-20 shrink-0 pt-0.5"><Chip tone={SEVERITY[f.severity].tone} className={f.severity === "pass" ? "bg-success/45" : undefined}>{SEVERITY[f.severity].label}</Chip></span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="type-body-strong text-ink">{f.title}</span>
                    <span className="type-body-sm text-ink-2">{f.body} <span className="text-muted">· {f.area}</span></span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
      {PROOF.quote && (
        <figure className="mx-auto flex max-w-main flex-col gap-3 text-center">
          <blockquote className="type-lead text-ink">&ldquo;{PROOF.quote.text}&rdquo;</blockquote>
          <figcaption className="type-caption text-muted">{PROOF.quote.name}, {PROOF.quote.business}</figcaption>
        </figure>
      )}
      <div className="flex flex-col items-center gap-4">
        <OrderCta withPrice note={`Your own report within ${SLA.deliveryHours} hours`} />
        {PROOF.samplePdf && <a href={PROOF.samplePdf} className="type-body-sm text-ink-2 underline hover:text-ink">Download the full example report (PDF)</a>}
      </div>
    </MarketingSection>
  );
}

const STEPS = [
  { title: "Tell us about your business", body: "Share your website, industry and location so the report is relevant to your market." },
  { title: "Pay once, then follow the analysis", body: `Review your details and pay ${price}. Your order page shows progress after payment.` },
  { title: "Receive your report", body: "We email you when it's ready. Review the priorities and download a PDF to share." },
];

const FAQ = [
  { q: "When does analysis run?", a: `Every day, weekends included. Your report starts as soon as you pay and lands within ${SLA.deliveryHours} hours. Track progress on your order page, and we email you when the report is ready.` },
  { q: "What does the price include?", a: "One SEO audit report covering four areas of search performance, with prioritised recommendations. There is no subscription. Implementing the recommendations is separate." },
  { q: "What if the site can't be audited?", a: `You'll see the issue and any action needed on your order page. ${REFUND}.` },
  { q: "Who does the audit?", a: `${WHO} You can reply to the report email with any question.` },
];

export function LandingHowItWorks() {
  return (
    <MarketingSection id="how-it-works" title="From your website to your next move">
      <ol className="process-path grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="process-step relative flex flex-col gap-2 rounded-card px-5 py-6">
            <span className="process-marker flex size-10 items-center justify-center rounded-full border border-hairline bg-raised type-caption-strong text-action">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="type-heading-h4 text-ink">{s.title}</h3>
            <p className="type-body text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
      <div id="faq" className="flex flex-col gap-6 border-t border-hairline pt-10">
        <Heading as="h3" variant="h2">Before you get started</Heading>
        <dl className="faq-grid grid gap-x-8 gap-y-7 md:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q} className="flex flex-col gap-1.5">
              <dt className="type-body-strong text-ink">{f.q}</dt>
              <dd className="type-body text-ink-2">{f.a}</dd>
            </div>
          ))}
        </dl>
        <OrderCta align="start" withPrice note={`Pay once. ${REFUND}.`} />
      </div>
    </MarketingSection>
  );
}

export function LandingPricing() {
  return (
    <MarketingSection id="pricing" tint title="One report. One flat price."
      intro="No subscription, no retainer. Pay once and get a plan you can act on yourself or hand to your web person.">
      <Card className="pricing-featured relative mx-auto w-full max-w-wide overflow-hidden shadow-raised md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        <div className="flex flex-col gap-4">
          <Heading as="h3" variant="h2">{SLA.productName}</Heading>
          <p className="type-body text-ink-2">{CHECKS} checks across four areas of your site&apos;s search performance, reviewed by a person, with the fixes put in order.</p>
          <p className="flex items-baseline gap-2"><span className="type-display tabular-nums text-ink">{price}</span><span className="type-body-lg text-muted">one-time</span></p>
          <div className="mt-auto flex flex-col gap-2.5 pt-2">
            <Link href="/order" className={`${buttonStyles({ full: true, size: "lg" })} landing-primary`}>Get my SEO report, {price} <Icon icon={ArrowRight} size="sm" /></Link>
            <p className="flex items-center justify-center gap-1.5 type-caption text-muted"><Icon icon={Lock} size="sm" /> Secure checkout with Stripe · Takes about 2 minutes</p>
          </div>
        </div>
        <ul className="flex flex-col gap-3 border-t border-hairline pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0" aria-label="What's included">
          <CheckItem>All four areas: technical, on-page, backlinks and competitors</CheckItem>
          <CheckItem>Fixes in priority order, each with a practical next step</CheckItem>
          <CheckItem>Delivered within {SLA.deliveryHours} hours, any day of the week</CheckItem>
          <CheckItem>Email delivery and a PDF ready to share</CheckItem>
          <CheckItem>{REFUND}</CheckItem>
          <CheckItem>One-time payment. No subscription.</CheckItem>
        </ul>
      </Card>
    </MarketingSection>
  );
}

/** The last screen before the footer: one sentence, one action. */
export function LandingClose() {
  return (
    <section aria-labelledby="close-title" className="landing-close relative isolate overflow-hidden px-5 py-24 lg:py-28">
      <div className="mx-auto flex w-full max-w-[44rem] flex-col items-center gap-6 text-center">
        <Heading as="h2" id="close-title" variant="display" className="type-bra-display-responsive text-balance">
          Know what to fix first, within {SLA.deliveryHours} hours
        </Heading>
        <p className="max-w-[34rem] type-lead text-ink-2">
          Tell us about your business, pay once, and get a prioritised plan for your website. No subscription.
        </p>
        <OrderCta withPrice note="Secure checkout with Stripe · Takes about 2 minutes" />
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline px-5 py-16">
      <div className="mx-auto flex w-full max-w-report flex-col gap-10">
        <div className="flex max-w-md flex-col gap-3">
          <Brand />
          <p className="type-body-sm text-ink-2">SEO audits for local businesses, run by AI and reviewed by a person. Understand what is holding your site back and what to improve next.</p>
        </div>
        <div className="flex flex-col gap-1 type-body-sm text-ink-2">
          <p className="type-body-strong text-ink">More reports are on the way</p>
          <div>{UPCOMING_REPORTS.join(", ")}. <WaitlistDialog variant="link" triggerLabel="Get notified" /></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6 type-caption text-muted">
          <p>© {new Date().getFullYear()} Blue Rocket Agents. All rights reserved.</p>
          <a href={`mailto:${CONTACT}`} className="hover:text-ink">Contact</a>
        </div>
      </div>
    </footer>
  );
}
