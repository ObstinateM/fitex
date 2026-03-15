'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBillingData, useCheckout, usePortalSession } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FitexLogo } from '@/components/landing/logo';
import { toast } from '@/components/ui/sonner';
import Link from 'next/link';
import { Check, Target, Sparkles, Infinity, ArrowLeft, Download, CreditCard } from 'lucide-react';

const PLANS = [
  {
    key: 'starter' as const,
    name: 'Starter',
    price: 9,
    credits: 15,
    perCredit: '0.60',
    icon: Target,
    badge: 'One-time',
    description: 'For focused job seekers with a target list.',
    features: [
      '15 credits',
      'ATS keyword analysis',
      'PDF export',
      'Q&A generation',
      'Salary estimation',
      'Feedback refinement',
      'Story library',
    ],
    footnote: 'Credits never expire',
  },
  {
    key: 'pro' as const,
    name: 'Pro Pack',
    price: 19,
    credits: 40,
    perCredit: '0.48',
    icon: Sparkles,
    badge: 'Best value',
    highlighted: true,
    description: 'Best value — for active job seekers who apply everywhere.',
    features: [
      '40 credits',
      'Everything in Starter',
      'Priority generation',
      'Credits never expire',
    ],
    footnote: 'Most chosen by job seekers',
  },
  {
    key: 'unlimited' as const,
    name: 'Unlimited',
    price: 49,
    credits: null,
    perCredit: null,
    suffix: '/month',
    icon: Infinity,
    badge: 'Sprint mode',
    description: 'Applying sprint mode. Cancel anytime.',
    features: [
      'Unlimited generations for 30 days',
      'Everything in Pro Pack',
      'Priority generation',
    ],
    footnote: 'Cancel anytime',
  },
];

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const autoCheckoutTriggered = useRef(false);

  const { data: billingData, isLoading: loading } = useBillingData();
  const balance = billingData?.balance ?? null;
  const payments = billingData?.payments ?? [];
  const sub = billingData?.subscription ?? null;

  const checkoutMutation = useCheckout();
  const portalMutation = usePortalSession();

  // Auto-trigger checkout from query param (e.g. from landing page pricing)
  useEffect(() => {
    if (loading || autoCheckoutTriggered.current) return;
    const checkoutType = searchParams.get('checkout') as 'starter' | 'pro' | 'unlimited' | null;
    if (checkoutType && ['starter', 'pro', 'unlimited'].includes(checkoutType)) {
      autoCheckoutTriggered.current = true;
      handleCheckout(checkoutType);
    }
  }, [loading, searchParams]);

  async function handleCheckout(priceType: 'starter' | 'pro' | 'unlimited') {
    setCheckoutLoading(priceType);
    try {
      const { clientSecret } = await checkoutMutation.mutateAsync(priceType);
      if (!clientSecret) {
        throw new Error('No client secret returned from checkout');
      }
      router.push(`/settings/billing/checkout?priceType=${priceType}&clientSecret=${encodeURIComponent(clientSecret)}`);
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    try {
      const { url } = await portalMutation.mutateAsync();
      window.location.href = url;
    } catch {
      toast.error('Failed to open billing portal.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-violet/40 border-t-violet rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-violet/6 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[40vh] w-[40vh] rounded-full bg-emerald/4 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-border/40" />
            <FitexLogo />
            <span className="text-sm font-semibold tracking-tight">Fitex</span>
          </div>
          {balance && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5 border border-border/30">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">
                {balance.isUnlimited ? 'Unlimited' : `${balance.balance} credits`}
              </span>
            </div>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-12 relative z-10">
        {/* Header */}
        <div>
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/60 mb-2">Settings</p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Billing & <span className="text-gradient">Credits</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Manage your credits, subscription, and payment history.</p>
        </div>

        {/* Credit Balance Card */}
        <section>
          <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-3">
                <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground/70">Current balance</span>
                <div className="flex items-end gap-3">
                  {balance?.isUnlimited ? (
                    <>
                      <span className="text-5xl font-display font-bold tracking-tight text-gradient">
                        <Infinity className="inline h-10 w-10" />
                      </span>
                      <span className="text-sm text-muted-foreground mb-1.5">Unlimited access</span>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl font-display font-bold tracking-tight text-gradient">
                        {balance?.balance ?? 0}
                      </span>
                      <span className="text-sm text-muted-foreground mb-1.5">credits remaining</span>
                    </>
                  )}
                </div>
                {balance?.isUnlimited && balance.unlimitedExpiresAt && (
                  <p className="text-xs text-muted-foreground">
                    Renews {new Date(balance.unlimitedExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>

              {sub?.status === 'active' && (
                <Button
                  onClick={handlePortal}
                  disabled={portalMutation.isPending}
                  className="bg-card border border-border/40 text-foreground hover:border-violet/30 hover:bg-card/80 h-10 px-4 gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {portalMutation.isPending ? 'Loading...' : 'Manage subscription'}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Purchase Options */}
        <section>
          <h2 className="text-lg font-display font-semibold tracking-tight mb-6">Get more credits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isHighlighted = plan.highlighted;
              const isLoading = checkoutLoading === plan.key;

              return (
                <div
                  key={plan.key}
                  className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 ${
                    isHighlighted
                      ? 'border-violet/50 bg-card/70 glow-violet scale-[1.02]'
                      : 'border-border/40 bg-card/50 backdrop-blur-sm hover:border-violet/30 hover:bg-card/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`size-4 shrink-0 ${isHighlighted ? 'text-violet-light' : 'text-muted-foreground'}`} />
                    <h3 className="text-base font-medium tracking-tight">{plan.name}</h3>
                    <Badge className={`ml-auto text-[10px] tracking-wide ${
                      isHighlighted
                        ? 'bg-violet/20 text-violet-light border-violet/30'
                        : 'bg-muted/50 text-muted-foreground border-border/40'
                    }`}>
                      {plan.badge}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-3xl font-display font-bold">{plan.price}&euro;</span>
                    {plan.suffix && <span className="text-sm text-muted-foreground ml-1">{plan.suffix}</span>}
                  </div>

                  <p className={`text-xs font-mono ${isHighlighted ? 'text-violet-light/70' : 'text-muted-foreground/50'}`}>
                    {plan.credits ? `${plan.credits} credits · ${plan.perCredit}€/credit` : 'Unlimited for 30 days'}
                  </p>

                  <p className="text-sm text-muted-foreground">{plan.description}</p>

                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className={`mt-0.5 size-3.5 shrink-0 ${isHighlighted ? 'text-violet-light' : 'text-emerald'}`} />
                        <span className="text-muted-foreground text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={isLoading || checkoutLoading !== null}
                    className={`w-full py-5 text-sm font-medium transition-all duration-300 mt-auto ${
                      isHighlighted
                        ? 'bg-violet hover:bg-violet-dark text-white glow-violet hover:scale-[1.02]'
                        : 'bg-card border border-border/40 text-foreground hover:border-violet/30 hover:bg-card/80'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : plan.credits ? (
                      `Get ${plan.credits} credits`
                    ) : (
                      'Go unlimited'
                    )}
                  </Button>

                  <p className="text-[10px] font-mono text-muted-foreground/50 text-center tracking-wide">
                    {plan.footnote}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-4 font-mono">
            1 credit = CV tailoring. Add Q&A (+0.5) or salary estimate (+0.5) per generation.
          </p>
        </section>

        {/* Payment History */}
        <section>
          <h2 className="text-lg font-display font-semibold tracking-tight mb-6">Payment history</h2>
          {payments.length === 0 ? (
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 text-center">
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border/30 text-xs font-mono tracking-wide uppercase text-muted-foreground/60">
                <span>Product</span>
                <span>Credits</span>
                <span>Amount</span>
                <span>Invoice</span>
              </div>
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {p.productType === 'starter' ? 'Starter Pack' : p.productType === 'pro' ? 'Pro Pack' : 'Unlimited'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">
                    {p.creditsAdded ? `+${p.creditsAdded}` : '—'}
                  </span>
                  <span className="text-sm font-medium">
                    {(p.amount / 100).toFixed(2)}&euro;
                  </span>
                  <div>
                    {p.invoiceUrl ? (
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-violet-light/70 hover:text-violet-light transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
