'use client';

import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FitexLogo } from '@/components/landing/logo';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('clientSecret');

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">No checkout session found.</p>
          <Link href="/settings/billing" className="text-sm text-violet-light hover:text-violet-light/80 transition-colors">
            Back to billing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-violet/6 blur-[120px] animate-pulse-glow" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-6 h-14 flex items-center gap-4">
          <Link href="/settings/billing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="h-4 w-px bg-border/40" />
          <FitexLogo />
          <span className="text-sm font-semibold tracking-tight">Fitex</span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12 relative z-10">
        <div className="mb-8">
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/60 mb-2">Checkout</p>
          <h1 className="text-2xl font-display font-bold tracking-tight">Complete your purchase</h1>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </main>
    </div>
  );
}
