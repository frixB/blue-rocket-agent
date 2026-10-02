import { SiteNav } from "@/components/blocks/site-nav";
import { LandingClose, LandingHero, LandingHowItWorks, LandingIncluded, LandingPricing, LandingSample, SiteFooter } from "@/components/blocks/landing";

/** Figma 7203:2155. Dark hero and footer, light content bands in between. */
export default function Landing() {
  return (
    <>
      <header className="sticky top-0 z-40 px-5 pt-3 sm:pt-4">
        <div className="mx-auto w-full max-w-report"><SiteNav /></div>
      </header>
      <main id="main">
        <LandingHero />
        <LandingIncluded />
        <LandingSample />
        <LandingPricing />
        <LandingHowItWorks />
        <LandingClose />
      </main>
      <SiteFooter />
    </>
  );
}
