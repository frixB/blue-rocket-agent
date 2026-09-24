import { Clock, Pause, ShieldCheck } from "lucide-react";
import { Card, CardTitle, Chip, CodeBlock, Note, buttonStyles } from "@/components/ui";
import { supportHref } from "@/lib/support";
import { StatusLayout } from "@/components/blocks/status-layout";
import type { StateProps } from "./shared";

export function Blocked({ order }: StateProps) {
  const host = new URL(order.websiteUrl).host;
  return (
    <StatusLayout
      order={order}
      tile={{ icon: ShieldCheck, tone: "warning" }}
      heading="Your site is blocking our crawler"
      body={`${host} is set to refuse automated visitors, so we can't read your pages yet. It's a common security setting and it takes about two minutes to fix.`}
      chips={<><Chip tone="warning" icon={Pause}>Paused, waiting on you</Chip><Chip icon={Clock}>Clock stopped while we wait</Chip></>}
    >
      <Card>
        <CardTitle>How to fix it, about 2 minutes</CardTitle>
        <ol className="list-decimal pl-5 type-body text-ink-2">
          <li>Open your robots.txt file, usually at {host}/robots.txt</li>
          <li>Add the two lines below</li>
          <li>Save it, then press retry</li>
        </ol>
        <CodeBlock label="Lines to add to robots.txt">{"User-agent: BlueRocketBot\nAllow: /"}</CodeBlock>
        <p className="type-body-sm text-muted">On Cloudflare instead? Add BlueRocketBot to your allowed bots under Security, then Bots.</p>
        <Note tone="success">Your {"$"}1,500 is on hold and fully refundable. We haven&apos;t started the paid analysis yet.</Note>
        <div className="flex flex-col gap-2.5">
          <a href={supportHref("I've fixed robots.txt, please retry the crawl", order.reference)} className={buttonStyles({ full: true })}>I&apos;ve fixed it, retry the crawl</a>
          <a href={supportHref("Please audit a different URL", order.reference)} className={buttonStyles({ variant: "ghost", full: true })}>Audit a different URL instead</a>
          <a href={supportHref("Please refund my payment", order.reference)} className={buttonStyles({ variant: "text", full: true })}>Refund my payment</a>
          <p className="text-center type-caption text-muted">Each option opens an email to our team with your order reference filled in.</p>
        </div>
      </Card>
    </StatusLayout>
  );
}
