'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { twoFactor } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error: verifyError } = await twoFactor.verifyTotp({ code });

    setLoading(false);

    if (verifyError) {
      toast.error(verifyError.message ?? 'Invalid code');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Two-factor authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="text-center text-lg tracking-widest"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-violet hover:bg-violet-dark text-white"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
