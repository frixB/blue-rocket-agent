import Link from "next/link";
import { Card, CardTitle, Note, buttonStyles } from "@/components/ui";
import type { StateProps } from "./shared";

export function PaymentPending({ order }: StateProps) {
  const failed = order.status === "payment_failed";
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-5 py-page-top">
      <Card>
        <CardTitle>{failed ? "Your payment didn't go through" : "Finish paying to start your report"}</CardTitle>
        <Note tone="success">No charge was made. Your details are saved.</Note>
        <Link href={{ pathname: "/order", query: { resume: order.id } }} className={buttonStyles({ full: true })}>{failed ? "Try again" : "Continue to payment"}</Link>
      </Card>
    </main>
  );
}
