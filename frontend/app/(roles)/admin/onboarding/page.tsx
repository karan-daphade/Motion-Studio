import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { Metadata } from "next";
import { appName } from "@/config/branding";


export const metadata: Metadata = {
  title: `Branch Onboarding Wizard — ${appName}`,
  description: `Set up your physical branch, kitchen stations, operating shifts, and compliance details on ${appName}.`,
};

export default function AdminOnboardingPage() {
  return <OnboardingWizard />;
}
