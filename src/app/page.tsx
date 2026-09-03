"use client";

import { useSubdomain } from "@/contexts/SubdomainContext";
import { Spinner } from "@/components/ui/spinner";
import {
  NavBar,
  Hero,
  ProblemSection,
  FeatureGrid,
  FeatureBento,
  HowItWorks,
  PricingSection,
  SocialProofSection,
  FAQSection,
  FinalCTA,
  Footer,
} from "@/components/landing-page";

export default function LandingPage() {
  const { slug } = useSubdomain();

  if (slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-surface-0">
      <NavBar />
      <Hero />
      <ProblemSection />
      <FeatureGrid />
      <FeatureBento />
      <HowItWorks />
      <PricingSection />
      <SocialProofSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
