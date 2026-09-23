import { LandingHero, LandingHowItWorks, LandingIncluded, LandingPricing, LandingSample, SiteFooter } from "@/components/blocks/landing";

/** Figma 7203:2155. Dark hero and footer, light content bands in between. */
export default function Landing() {
  return (
    <>
      <LandingHero />
      <main>
        <LandingIncluded />
        <LandingSample />
        <LandingHowItWorks />
        <LandingPricing />
      </main>
      <SiteFooter />
    </>
  );
}
