import Link from 'next/link';
import { FitexLogo } from './logo';

export function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl animate-navbar-enter"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Fitex home">
          <FitexLogo className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">Fitex</span>
        </Link>

        <nav aria-label="Main" className="hidden md:flex items-center gap-8">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-7 px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-7 px-4 bg-violet hover:bg-violet-dark text-white transition-all"
          >
            Try for free
          </Link>
        </div>
      </div>
    </header>
  );
}
