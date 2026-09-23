import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark, CircleCheck, Clock, FileText, Mail, Rocket, TriangleAlert } from "lucide-react";
import {
  Avatar, Banner, Button, Card, CardTitle, Checkbox, Chip, CodeBlock, EmptyState, Field, Heading, Icon,
  IconTile, Input, Modal, Note, ProgressBar, Select, Stat, StatusBadge, StepList, SummaryRow, Tabs, TimelineStep,
  type BadgeKind, type Tone,
} from "@/components/ui";

/**
 * Every primitive in components/ui, in both themes. Review token or
 * primitive changes here, next to /dev/states. Same gate as the state gallery.
 */

const TONES: Tone[] = ["neutral", "success", "warning", "danger", "info"];
const BADGES: BadgeKind[] = ["queued", "running", "ready", "delayed", "blocked", "failed", "refunded", "credit"];

function Row({ title, figma, children }: { title: string; figma: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-hairline pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="type-heading-h4 text-ink">{title}</h2>
        <code className="type-caption text-muted">Figma: {figma}</code>
      </div>
      {children}
    </section>
  );
}

function Gallery({ p }: { p: string }) {
  return (
    <div className="flex flex-col gap-8">
      <Row title="Heading" figma="BRA/Display, BRA/Heading 1–3">
        <Heading variant="display">Display</Heading>
        <Heading as="p">Heading 1</Heading>
        <Heading as="p" variant="h2">Heading 2</Heading>
        <Heading as="p" variant="h3">Heading 3</Heading>
      </Row>

      <Row title="Button" figma="Button / primary · ghost · text · darkghost">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="text">Text</Button>
          <Button variant="darkghost">Dark ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Row>

      <Row title="Chip, StatusBadge" figma="Chip / status · delivery promise, Status badge">
        <div className="flex flex-wrap gap-2">{TONES.map((t) => <Chip key={t} tone={t}>{t}</Chip>)}</div>
        <div className="flex flex-wrap gap-2">{BADGES.map((b) => <StatusBadge key={b} kind={b} />)}</div>
      </Row>

      <Row title="Icon, IconTile, Avatar" figma="Icon / *, Icon tile, Icon tile / status">
        <div className="flex flex-wrap items-center gap-3">
          <Icon icon={Rocket} />
          {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => <IconTile key={s} icon={FileText} tone="info" size={s} />)}
          {TONES.map((t) => <IconTile key={t} icon={CircleCheck} tone={t} />)}
          <IconTile icon={Rocket} tone="action" size="xs" className="rounded-2xl" />
          <Avatar name="Johnson Smith" />
          <Avatar name="Carlos" size="lg" />
        </div>
      </Row>

      <Row title="Note, Banner" figma="Note, Banner / claim account · unverified email">
        {TONES.map((t) => <Note key={t} tone={t}>A {t} note. Every failure state says what happened to the money in one of these.</Note>)}
        <Banner icon={Bookmark} actions={<Button size="sm">Set a password</Button>}>Set a password and this report stays in your dashboard for good.</Banner>
        <Banner inset icon={Mail} actions={<Button variant="text" className="type-body-sm">Resend email</Button>}>Verify your email so we can deliver reports to you.</Banner>
      </Row>

      <Row title="Field, Input, Select, Checkbox" figma="Field, Input, Dropdown, Checkbox (S-01, Form Step 1)">
        <div className="grid gap-5 md:grid-cols-2">
          <Field htmlFor={`${p}-name`} label="Business name" hint="Used to personalise your report." required>
            <Input id={`${p}-name`} placeholder="e.g. Johnson & Sons Plumbing" />
          </Field>
          <Field htmlFor={`${p}-check`} label="Website URL" hint="The site we'll audit." message={{ tone: "neutral", text: "Checking that we can reach this site…" }}>
            <Input id={`${p}-check`} defaultValue="https://johnsonplumbing.com" aria-describedby={`${p}-check-msg`} trailing={<Icon icon={Clock} className="text-muted" />} />
          </Field>
          <Field htmlFor={`${p}-ok`} label="Website URL" message={{ tone: "success", text: "Found it. Is this your site?" }}>
            <Input id={`${p}-ok`} state="valid" defaultValue="https://johnsonplumbing.com" aria-describedby={`${p}-ok-msg`} trailing={<Icon icon={CircleCheck} className="text-success-ink" />} />
          </Field>
          <Field htmlFor={`${p}-warn`} label="Website URL" message={{ tone: "warning", text: "This site doesn't mention your business name." }}>
            <Input id={`${p}-warn`} state="warning" defaultValue="https://austinplumbers.net" aria-describedby={`${p}-warn-msg`} trailing={<Icon icon={TriangleAlert} className="text-warning-ink" />} />
          </Field>
          <Field htmlFor={`${p}-err`} label="Website URL" message={{ tone: "danger", text: "Please enter a valid URL, e.g. https://yoursite.com" }}>
            <Input id={`${p}-err`} state="error" defaultValue="johnsonplumbing" aria-describedby={`${p}-err-msg`} trailing={<Icon icon={TriangleAlert} className="text-danger-ink" />} />
          </Field>
          <Field htmlFor={`${p}-country`} label="Country" required>
            <Select id={`${p}-country`} defaultValue=""><option value="" disabled>Choose a country</option><option>United States</option><option>Canada</option></Select>
          </Field>
          <Checkbox label="Email me when my report is ready" defaultChecked />
        </div>
      </Row>

      <Row title="ProgressBar, Tabs" figma="Form Step 1 progress, Portal tabs">
        <ProgressBar value={50} label="Step 1 of 2" />
        <Tabs label="Portal" items={[{ href: "#", label: "My Reports", active: true }, { href: "#b", label: "Billing" }, { href: "#a", label: "Account" }]} />
      </Row>

      <Row title="Card, Stat, SummaryRow, TimelineStep" figma="Card / *, Stat, Summary row, Rail step / *">
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardTitle>What we found</CardTitle>
            <div className="flex gap-3"><Stat value="23" label="issues" /><Stat value="4" label="critical" tone="danger" /><Stat value="~1,900" label="visits lost" tone="warning" /></div>
            <dl className="flex flex-col divide-y divide-hairline"><SummaryRow label="Business" value="Johnson & Sons" /><SummaryRow label="Amount paid" value="$1,500.00" emphasis /></dl>
          </Card>
          <Card>
            <CardTitle>Report progress</CardTitle>
            <ol>
              <TimelineStep index={1} label="Done" meta="Completed 09:14" state="done" />
              <TimelineStep index={2} label="Active" meta="Running now" state="active" />
              <TimelineStep index={3} label="Scheduled" meta="Starts Mon 09:00" state="scheduled" />
              <TimelineStep index={4} label="Failed" meta="Stopped" state="failed" />
              <TimelineStep index={5} label="Pending" meta="Waiting" state="pending" last />
            </ol>
          </Card>
        </div>
      </Row>

      <Row title="StepList" figma="Card / what happens next (S-06)">
        <StepList steps={[{ title: "Payment confirmed", body: "Processed by Stripe.", state: "done" }, { title: "AI agents are working now", body: "Across 4 SEO areas.", state: "active" }, { title: "Report lands here", body: "And in your inbox.", state: "pending" }]} />
      </Row>

      <Row title="CodeBlock, EmptyState" figma="Code block (S-08), Empty state (S-16)">
        <CodeBlock>{"User-agent: BlueRocketBot\nAllow: /"}</CodeBlock>
        <EmptyState icon={Rocket} title="No reports yet" body="Your first report lands here the moment you order it." action={<Link href="/order" className="text-action">Start a report</Link>} />
      </Row>
    </div>
  );
}

export default function ComponentGallery() {
  if (process.env.NEXT_PUBLIC_SHOW_STATE_GALLERY !== "true" && process.env.NODE_ENV === "production") notFound();
  return (
    <div className="flex flex-col">
      <main data-theme="app" className="bg-page px-5 py-16 text-ink">
        <div className="mx-auto flex max-w-app flex-col gap-8">
          <header className="flex flex-col gap-2">
            <Heading>Components</Heading>
            <p className="type-body text-ink-2">Every primitive in components/ui, built from the Figma tokens. App theme here, marketing theme below. <Link href="/dev/states" className="text-action">Order states →</Link></p>
          </header>
          <Gallery p="app" />
        </div>
      </main>
      <section data-theme="marketing" aria-label="Marketing theme" className="bg-page px-5 py-16 text-ink">
        <div className="mx-auto flex max-w-app flex-col gap-8">
          <Heading as="h2">Marketing theme</Heading>
          <Modal aria-label="Modal example">
            <IconTile icon={TriangleAlert} tone="danger" size="lg" />
            <Heading as="p">Your bank declined the payment</Heading>
            <Note tone="success">No charge was made. Your card has not been debited.</Note>
            <Button full>Try again</Button>
            <Button variant="ghost" full>Use a different card</Button>
          </Modal>
          <Gallery p="mkt" />
        </div>
      </section>
    </div>
  );
}
