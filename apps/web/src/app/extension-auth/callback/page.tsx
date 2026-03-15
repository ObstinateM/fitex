'use client';

export default function ExtensionAuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Connected!</h1>
        <p className="mt-2 text-muted-foreground">
          You can close this tab. The extension is now signed in.
        </p>
      </div>
    </div>
  );
}
