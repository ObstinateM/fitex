import Link from 'next/link';
import { FitexLogo } from '@/components/landing/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="noise-overlay relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[60vh] w-[60vh] rounded-full bg-violet/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[10%] right-[5%] h-[40vh] w-[40vh] rounded-full bg-violet-light/5 blur-[80px]" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Fitex brand link */}
      <Link
        href="/"
        className="relative z-10 flex items-center gap-2.5 mb-10 group"
        aria-label="Back to Fitex home"
      >
        <FitexLogo className="h-8 w-8 transition-opacity group-hover:opacity-70" />
        <span className="text-lg font-semibold tracking-tight transition-colors group-hover:text-muted-foreground">
          Fitex
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
