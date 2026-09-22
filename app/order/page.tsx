import { Card, CardTitle, Note } from "@/components/ui";

/** Form step 1 and 2 land here. Intake is saved BEFORE Stripe so leads survive a failed payment. */
export default function OrderPage() {
  return (
    <main data-theme="marketing" className="flex min-h-dvh items-center justify-center bg-page px-5 text-ink">
      <div data-theme="app" className="w-full max-w-xl">
        <Card>
          <CardTitle>Tell us about your business</CardTitle>
          <Note>Intake form goes here. See docs/architecture.md, section 8.2.</Note>
        </Card>
      </div>
    </main>
  );
}
