'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut, twoFactor } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [totpURI, setTotpURI] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [twoFAPassword, setTwoFAPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [twoFAStatus, setTwoFAStatus] = useState('');

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  async function handleSignOut() {
    await signOut({ fetchOptions: {} });
    router.push('/login');
  }

  async function handleEnable2FA(e: React.FormEvent) {
    e.preventDefault();
    setTwoFAStatus('');
    const { data, error } = await twoFactor.enable({ password: twoFAPassword });
    if (error) {
      setTwoFAStatus(error.message ?? 'Failed to enable 2FA');
      return;
    }
    if (data?.totpURI) {
      setTotpURI(data.totpURI);
      setShowPasswordPrompt(false);
      setTwoFAPassword('');
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await twoFactor.verifyTotp({ code: verifyCode });
    if (error) {
      setTwoFAStatus(error.message ?? 'Invalid code');
      return;
    }
    setTwoFAStatus('2FA enabled successfully');
    setTotpURI('');
    setVerifyCode('');
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Welcome, {session.user.name}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            <p>Email: {session.user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!totpURI && !showPasswordPrompt && (
            <Button
              variant="outline"
              onClick={() => setShowPasswordPrompt(true)}
            >
              Enable 2FA
            </Button>
          )}

          {showPasswordPrompt && !totpURI && (
            <form onSubmit={handleEnable2FA} className="flex flex-col gap-3">
              <Label htmlFor="twofa-password">Confirm your password</Label>
              <Input
                id="twofa-password"
                type="password"
                placeholder="Your account password"
                value={twoFAPassword}
                onChange={(e) => setTwoFAPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="bg-violet hover:bg-violet-dark text-white"
              >
                Continue
              </Button>
            </form>
          )}

          {totpURI && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app, or copy the URI below:
              </p>
              <code className="block break-all rounded bg-muted p-3 text-xs">
                {totpURI}
              </code>
              <form onSubmit={handleVerify2FA} className="flex flex-col gap-3">
                <Label htmlFor="verify-code">Verification code</Label>
                <Input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  disabled={verifyCode.length !== 6}
                  className="bg-violet hover:bg-violet-dark text-white"
                >
                  Verify & activate
                </Button>
              </form>
            </div>
          )}

          {twoFAStatus && (
            <p className="text-sm text-muted-foreground">{twoFAStatus}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
