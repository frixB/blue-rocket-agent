import { ShieldCheck } from "lucide-react";
import { Button, Card, CardTitle, Chip, CodeBlock, Note } from "@/components/ui";
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
      chips={<><Chip tone="warning">⏸ Paused, waiting on you</Chip><Chip>● Clock stopped while we wait</Chip></>}
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
          <Button full>I&apos;ve fixed it, retry the crawl</Button>
          <Button variant="ghost" full>Audit a different URL instead</Button>
          <Button variant="text" full>Refund my payment</Button>
        </div>
      </Card>
    </StatusLayout>
  );
}
