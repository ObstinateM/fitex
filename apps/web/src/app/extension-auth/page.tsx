'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function ExtensionAuthPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    async function generateToken() {
      const { data, error } = await authClient.oneTimeToken.generate();
      if (error) {
        setError('Failed to generate token. Please try again.');
        return;
      }
      router.replace(`/extension-auth/callback?token=${data.token}`);
    }
    generateToken();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Connecting to extension...</p>
    </div>
  );
}
