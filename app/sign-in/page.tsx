import Link from "next/link";
import { Brand } from "@/components/blocks/brand";
import { SignInForm } from "@/components/blocks/auth-forms";
import { Heading } from "@/components/ui";
import { previewParam } from "@/lib/preview-param";

/** S-18 Sign in (7368:22). Light page, two-panel card. `?preview=sent` shows the link-sent state. */
export default async function SignIn({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const preview = previewParam((await searchParams).preview);
  return (
    <div data-theme="app" className="flex min-h-dvh flex-col bg-page text-ink">
      <header className="px-nav-x py-nav-y"><Link href="/" aria-label="Blue Rocket Agents home"><Brand /></Link></header>
      <main id="main" className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="grid w-full max-w-3xl overflow-hidden rounded-modal bg-raised shadow-overlay md:grid-cols-[2fr_3fr]">
          <section className="flex flex-col gap-6 bg-info px-8 py-12">
            <Heading as="p" variant="display" className="text-info-ink">Your next move starts here.</Heading>
            <p className="type-lead text-info-ink">Keep your reports and priorities in one place.</p>
          </section>
          <section className="p-modal"><SignInForm preview={preview} /></section>
        </div>
      </main>
    </div>
  );
}
