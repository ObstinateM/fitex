import type { Metadata } from 'next';
import { TemplateUpload } from '@/components/onboarding/TemplateUpload';
import { FitexLogo } from '@/components/landing/logo';

export const metadata: Metadata = {
  title: 'Get started — Fitex',
};

export default function OnboardingPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] rounded-full bg-violet/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 h-[50vh] w-[50vh] rounded-full bg-emerald/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-navbar-enter">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <FitexLogo className="h-9 w-9" />
          <span className="text-lg font-semibold">Fitex</span>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold tracking-tight leading-tight">
            One step away from tailoring CVs in{' '}
            <span className="text-gradient">15 seconds</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Upload your CV template once — we handle the rest
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-xl">
          <TemplateUpload />
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-5">
          You&apos;re one upload away from 15-second applications
        </p>
      </div>
    </div>
  );
}
