import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { PainPoints } from '@/components/landing/pain-points';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="noise-overlay min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
