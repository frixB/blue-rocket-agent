import { SiteNav } from "@/components/blocks/site-nav";
import { LandingHero, LandingHowItWorks, LandingIncluded, LandingPricing, LandingSample, SiteFooter } from "@/components/blocks/landing";

/** Figma 7203:2155. Dark hero and footer, light content bands in between. */
export default function Landing() {
  return (
    <>
      <header className="px-5 pt-6">
        <div className="mx-auto w-full max-w-report"><SiteNav /></div>
      </header>
      <main id="main">
        <LandingHero />
        <LandingIncluded />
        <LandingSample />
        <LandingHowItWorks />
        <LandingPricing />
      </main>
      <SiteFooter />
    </>
  );
}
