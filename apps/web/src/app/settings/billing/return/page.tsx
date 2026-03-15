'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { FitexLogo } from '@/components/landing/logo';
import { Button } from '@/components/ui/button';

type Status = 'loading' | 'success' | 'failed';

export default function ReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!sessionId) {
      setStatus('failed');
      return;
    }
    // Stripe embedded checkout redirects here on completion — session_id presence means success
    setStatus('success');
  }, [sessionId]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => router.push('/settings/billing'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center">
      {/* Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-violet/6 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[40vh] w-[40vh] rounded-full bg-emerald/4 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center space-y-6 px-6">
        <FitexLogo />

        {status === 'loading' && (
          <div className="space-y-4 pt-8">
            <div className="h-8 w-8 mx-auto border-2 border-violet/40 border-t-violet rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Confirming your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 pt-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald/10 border border-emerald/30 flex items-center justify-center">
              <Check className="h-8 w-8 text-emerald" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Payment successful</h1>
            <p className="text-sm text-muted-foreground">Your credits have been added to your account.</p>
            <p className="text-xs text-muted-foreground/50">Redirecting to billing...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4 pt-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <X className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">Your payment could not be confirmed. No charges were made.</p>
            <Button
              onClick={() => router.push('/settings/billing')}
              className="bg-violet hover:bg-violet-dark text-white mt-2"
            >
              Back to billing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
