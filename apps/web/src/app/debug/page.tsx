'use client';

import { useState } from 'react';
import { authedFetch } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Debug page is not available in production');
}

export default function DebugPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function handleAction(endpoint: string, label: string) {
    setStatus(null);
    try {
      const res = await authedFetch(`/debug/${endpoint}`, { method: 'POST' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setStatus(`✓ ${label} done`);
      if (endpoint === 'reset-onboarding') {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setStatus(`✗ ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </Link>
          <h1 className="text-xl font-semibold mt-3">Debug</h1>
          <p className="text-sm text-muted-foreground mt-1">Dev only — not available in production</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleAction('reset-onboarding', 'Onboarding reset')}
            className="w-full rounded-lg border border-border/50 bg-card px-4 py-3 text-sm text-left hover:bg-accent transition-colors"
          >
            <div className="font-medium">Reset onboarding</div>
            <div className="text-xs text-muted-foreground mt-0.5">Sets isOnboarded=false, removes CV template</div>
          </button>

          <button
            onClick={() => handleAction('reset-pdf-quota', 'PDF quota reset')}
            className="w-full rounded-lg border border-border/50 bg-card px-4 py-3 text-sm text-left hover:bg-accent transition-colors"
          >
            <div className="font-medium">Reset PDF quota</div>
            <div className="text-xs text-muted-foreground mt-0.5">Clears this month&apos;s conversion log</div>
          </button>

          <button
            onClick={() => handleAction('add-credits', '10 credits added')}
            className="w-full rounded-lg border border-border/50 bg-card px-4 py-3 text-sm text-left hover:bg-accent transition-colors"
          >
            <div className="font-medium">Add 10 credits</div>
            <div className="text-xs text-muted-foreground mt-0.5">Fake payment with history record (productType=debug)</div>
          </button>

          <button
            onClick={() => handleAction('expire-subscription', 'Subscription expired')}
            className="w-full rounded-lg border border-border/50 bg-card px-4 py-3 text-sm text-left hover:bg-accent transition-colors"
          >
            <div className="font-medium">Expire subscription</div>
            <div className="text-xs text-muted-foreground mt-0.5">Sets subscription status to canceled, period end to now</div>
          </button>
        </div>

        {status && (
          <p className="text-sm text-muted-foreground">{status}</p>
        )}
      </div>
    </div>
  );
}
