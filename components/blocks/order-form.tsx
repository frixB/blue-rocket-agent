"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChartColumn, CircleCheck, Clock, Search, TriangleAlert, Wrench } from "lucide-react";
import { Button, Chip, Field, Heading, Icon, IconTile, Input, ProgressBar, Select, type InputState } from "@/components/ui";
import type { VerifyResult } from "@/lib/verify-url";

/**
 * Form Step 1 (7203:2397) and Step 2 (7203:2823), with the S-01 URL check
 * (7369:2) inline on the website field. Intake is kept in component state;
 * saving it before Stripe is the next backend step (architecture.md §8.2).
 */

const INDUSTRIES = ["Home services (plumbing, HVAC, electrical)", "Health and dental", "Legal", "Restaurants and food", "Retail and e-commerce", "Real estate", "Professional services", "Other"];
const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Other"];
const REVENUE = ["Under $10,000", "$10,000 to $50,000", "$50,000 to $250,000", "Over $250,000", "Prefer not to say"];
const EMPLOYEES = ["Just me", "2 to 10", "11 to 50", "51 to 200", "Over 200"];

type Check = { state: "idle" } | { state: "checking" } | VerifyResult;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function OrderForm({ price, productName }: { price: string; productName: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [f, setF] = useState({ name: "", url: "", industry: "", city: "", country: "", revenue: "", employees: "", email: "" });
  const [check, setCheck] = useState<Check>({ state: "idle" });
  const [acceptedUrl, setAcceptedUrl] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedStep, setAttemptedStep] = useState<1 | 2 | null>(null);
  const [paying, setPaying] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);
  const verifyRequest = useRef(0);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const touch = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function verify() {
    touch("url")();
    if (!f.url.trim()) return setCheck({ state: "idle" });
    const request = ++verifyRequest.current;
    setAcceptedUrl(null);
    setCheck({ state: "checking" });
    const res = await fetch("/api/verify-url", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: f.url, businessName: f.name }) })
      .then((r) => r.json() as Promise<VerifyResult>)
      .catch((): VerifyResult => ({ state: "unreachable", reason: "error" }));
    if (request !== verifyRequest.current) return;
    setCheck(res);
  }

  const urlOk = check.state === "verified" || acceptedUrl === f.url;
  const step1Ready = f.name.trim() && f.url.trim() && urlOk && f.industry && f.city.trim() && f.country;
  const emailOk = EMAIL.test(f.email.trim());
  const step2Ready = f.revenue && f.employees && emailOk;
  const host = (() => { try { return new URL(check.state === "verified" || check.state === "mismatch" ? check.url : `https://${f.url}`).host; } catch { return f.url; } })();

  if (step === 2) {
    return (
      <form noValidate className="flex flex-col gap-8" onSubmit={(e) => {
        e.preventDefault();
        setAttemptedStep(2);
        setTouched((current) => ({ ...current, revenue: true, employees: true, email: true }));
        if (!step2Ready) {
          const first = !f.revenue ? "revenue" : !f.employees ? "employees" : "email";
          document.getElementById(first)?.focus();
          return;
        }
        setPaying(true);
        router.push("/order/checkout");
      }}>
        <Button variant="text" className="self-start type-body-sm" onClick={() => setStep(1)}><Icon icon={ArrowLeft} size="sm" /> Back to step 1</Button>
        <StepHeader label="Step 2 of 2: final details" right="Almost done" value={100} />
        <div className="flex flex-col gap-1">
          <Heading as="h2">Where should we send it?</Heading>
          <p className="type-body text-ink-2">This helps us calibrate your report and makes sure it reaches the right inbox.</p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-hairline bg-sunken px-5 py-4">
          <div className="flex items-center gap-3">
            <Icon icon={ChartColumn} className="text-action" />
            <div className="flex flex-col">
              <span className="type-body-strong text-ink">{productName}</span>
              <span className="type-caption text-muted">{f.name} · {host}</span>
            </div>
          </div>
          <span className="type-heading-h4 text-action">{price}</span>
        </div>
        <div className="flex flex-col gap-6">
          <Field htmlFor="revenue" label="Monthly revenue range" hint="We use this to put the recommended SEO investment in context." required
            message={touched.revenue && !f.revenue ? { tone: "danger", text: "Choose the range that best describes your business." } : undefined}>
            <Select id="revenue" required value={f.revenue} onChange={set("revenue")} onBlur={touch("revenue")}
              state={touched.revenue && !f.revenue ? "error" : "default"} aria-describedby="revenue-hint revenue-msg">
              <option value="" disabled>Choose a range</option>
              {REVENUE.map((o) => <option key={o}>{o}</option>)}
            </Select>
          </Field>
          <Field htmlFor="employees" label="Number of employees" hint="We use this to keep recommendations realistic for your team." required
            message={touched.employees && !f.employees ? { tone: "danger", text: "Choose your current team size." } : undefined}>
            <Select id="employees" required value={f.employees} onChange={set("employees")} onBlur={touch("employees")}
              state={touched.employees && !f.employees ? "error" : "default"} aria-describedby="employees-hint employees-msg">
              <option value="" disabled>Choose a size</option>
              {EMPLOYEES.map((o) => <option key={o}>{o}</option>)}
            </Select>
          </Field>
          <Field htmlFor="email" label="Email address" hint="Your finished report is emailed here, and to your order page." required
            message={touched.email ? (emailOk ? { tone: "success", text: "Looks good. Your report will be sent here." } : { tone: "danger", text: "Enter an email address like you@yourbusiness.com" }) : undefined}>
            <Input id="email" type="email" autoComplete="email" required value={f.email} onChange={set("email")} onBlur={touch("email")}
              state={touched.email ? (emailOk ? "valid" : "error") : "default"} aria-describedby="email-hint email-msg"
              trailing={touched.email && emailOk ? <Icon icon={CircleCheck} className="text-success-ink" /> : undefined} placeholder="you@yourbusiness.com" />
          </Field>
        </div>
        <div className="flex flex-col items-center gap-4">
          {attemptedStep === 2 && !step2Ready && (
            <p role="alert" className="w-full type-body-sm-strong text-danger-ink">Complete the highlighted fields before continuing to secure payment.</p>
          )}
          <Button type="submit" size="lg" full loading={paying}>Continue to secure payment · {price} <Icon icon={ArrowRight} size="sm" /></Button>
          <Chip>Secured by Stripe · PCI DSS compliant</Chip>
          <p className="type-caption text-muted">We never store your card details. Nothing is charged until you confirm on Stripe.</p>
        </div>
      </form>
    );
  }

  const urlState: InputState =
    touched.url && !f.url.trim() ? "error" : check.state === "verified" ? "valid" : check.state === "mismatch" ? "warning" : check.state === "unreachable" ? "error" : "default";
  const urlIcon = { idle: undefined, checking: <Icon icon={Clock} className="text-muted" />, verified: <Icon icon={CircleCheck} className="text-success-ink" />,
    mismatch: <Icon icon={TriangleAlert} className="text-warning-ink" />, unreachable: <Icon icon={TriangleAlert} className="text-danger-ink" /> }[check.state];
  const urlMessage =
    touched.url && !f.url.trim() ? { tone: "danger" as const, text: "Enter the website address you want us to audit." }
    : check.state === "checking" ? { tone: "neutral" as const, text: "Checking that we can reach this site…" }
    : check.state === "verified" ? { tone: "success" as const, text: "Found it. Is this your site?" }
    : check.state === "mismatch" ? { tone: "warning" as const, text: "This site doesn't mention your business name. Double-check the URL before you pay. We can only audit the site you give us." }
    : check.state === "unreachable" ? { tone: "danger" as const, text: check.reason === "invalid"
        ? "Enter a full web address, e.g. https://yoursite.com"
        : "We couldn't reach this site. It may be down, or the address may have a typo. Continue anyway and we'll try again when your report starts." }
    : undefined;

  return (
    <form noValidate className="flex flex-col gap-8" onSubmit={(e) => {
      e.preventDefault();
      setAttemptedStep(1);
      setTouched((current) => ({ ...current, name: true, url: true, industry: true, city: true, country: true }));
      if (!step1Ready) {
        const first = !f.name.trim() ? "name" : !f.url.trim() || !urlOk ? "url" : !f.industry ? "industry" : !f.city.trim() ? "city" : "country";
        document.getElementById(first)?.focus();
        if (f.url.trim() && check.state === "idle") void verify();
        return;
      }
      setAttemptedStep(null);
      setStep(2);
    }}>
      <StepHeader label="Step 1 of 2: your business" right="50% complete" value={50} />
      <div className="flex flex-col gap-1">
        <Heading as="h2">Your business, in focus.</Heading>
        <p className="type-body text-ink-2">We use this to build a report specific to your market and location.</p>
      </div>
      <div className="flex flex-col gap-6">
        <Field htmlFor="name" label="Business name" hint="Used to personalise your report and search for local citations." required
          message={touched.name && !f.name.trim() ? { tone: "danger", text: "Enter the business name you want us to research." } : undefined}>
          <Input id="name" required autoComplete="organization" value={f.name} onChange={set("name")} onBlur={touch("name")}
            state={touched.name && !f.name.trim() ? "error" : "default"} placeholder="e.g. Johnson & Sons Plumbing" aria-describedby="name-hint name-msg" />
        </Field>
        <Field htmlFor="url" label="Website URL" hint="The site we'll audit. Include https:// for best results." required message={urlMessage}>
          <Input ref={urlRef} id="url" required inputMode="url" autoComplete="url" value={f.url} onChange={(e) => { verifyRequest.current += 1; set("url")(e); setAcceptedUrl(null); setCheck({ state: "idle" }); }}
            onBlur={verify} state={urlState} trailing={urlIcon} placeholder="https://yoursite.com" aria-describedby="url-hint url-msg" />
        </Field>
        {(check.state === "verified" || check.state === "mismatch") && (
          <div className="flex items-center gap-3 rounded-lg border border-hairline bg-sunken px-3.5 py-3">
            <IconTile icon={check.state === "verified" ? Wrench : Search} size="sm" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate type-body-sm-strong text-ink">{check.title || new URL(check.url).host}</span>
              <span className="type-caption text-muted">Responds in {(check.ms / 1000).toFixed(1)}s</span>
            </div>
          </div>
        )}
        {(check.state === "mismatch" || (check.state === "unreachable" && check.reason !== "invalid")) && acceptedUrl !== f.url && (
          <div className="flex gap-2.5">
            <Button full onClick={() => (check.state === "mismatch" ? urlRef.current?.focus() : verify())}>{check.state === "mismatch" ? "Fix the URL" : "Retry"}</Button>
            <Button variant="ghost" full onClick={() => setAcceptedUrl(f.url)}>Continue anyway</Button>
          </div>
        )}
        <Field htmlFor="industry" label="Industry" hint="Lets us benchmark your site against direct competitors in your field." required
          message={touched.industry && !f.industry ? { tone: "danger", text: "Choose the closest match for your business." } : undefined}>
          <Select id="industry" required value={f.industry} onChange={set("industry")} onBlur={touch("industry")}
            state={touched.industry && !f.industry ? "error" : f.industry ? "valid" : "default"} aria-describedby="industry-hint industry-msg">
            <option value="" disabled>Choose your industry</option>
            {INDUSTRIES.map((o) => <option key={o}>{o}</option>)}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field htmlFor="city" label="City" hint="For local SEO benchmarking." required
            message={touched.city && !f.city.trim() ? { tone: "danger", text: "Enter the main city or area your business serves." } : undefined}>
            <Input id="city" required autoComplete="address-level2" value={f.city} onChange={set("city")} onBlur={touch("city")}
              state={touched.city && !f.city.trim() ? "error" : "default"} placeholder="e.g. Austin" aria-describedby="city-hint city-msg" />
          </Field>
          <Field htmlFor="country" label="Country" hint="Sets the regional search data." required
            message={touched.country && !f.country ? { tone: "danger", text: "Choose the country where your customers search." } : undefined}>
            <Select id="country" required value={f.country} onChange={set("country")} onBlur={touch("country")}
              state={touched.country && !f.country ? "error" : "default"} aria-describedby="country-hint country-msg">
              <option value="" disabled>Choose a country</option>
              {COUNTRIES.map((o) => <option key={o}>{o}</option>)}
            </Select>
          </Field>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        {attemptedStep === 1 && !step1Ready && (
          <p role="alert" className="w-full type-body-sm-strong text-danger-ink">
            {f.url.trim() && !urlOk ? "Verify your website, then complete any highlighted fields." : "Complete the highlighted fields to continue."}
          </p>
        )}
        <Button type="submit" size="lg" full>Continue to final details <Icon icon={ArrowRight} size="sm" /></Button>
        <p className="type-caption text-muted">We only use these details to build your report.</p>
      </div>
    </form>
  );
}

function StepHeader({ label, right, value }: { label: string; right: string; value: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between type-bra-caption">
        <span className="text-action">{label}</span>
        <span className="text-muted">{right}</span>
      </div>
      <ProgressBar value={value} label={label} />
    </div>
  );
}
