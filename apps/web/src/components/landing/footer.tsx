import Link from 'next/link';
import { FitexLogo } from './logo';

export function Footer() {
  return (
    <footer className="border-t border-border/20 py-12 px-6">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-8 sm:flex-row sm:justify-between sm:gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Fitex home">
          <FitexLogo className="h-7 w-7" />
          <span className="font-medium tracking-tight text-sm">Fitex</span>
        </Link>

        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {[
            { label: 'Terms of Use', href: '/cgu' },
            { label: 'Terms of Sale', href: '/cgv' },
            { label: 'Privacy Policy', href: '/privacy' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors duration-300 tracking-wide"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-[11px] font-mono text-muted-foreground/70 tracking-wide">
          &copy; {new Date().getFullYear()} Fitex
        </p>
      </div>
    </footer>
  );
}
