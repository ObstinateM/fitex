import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FitexLogo } from './logo';

export function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl animate-navbar-enter"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Fitex home">
          <FitexLogo className="h-16 w-16 -m-2" />
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
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Log in
          </Button>
          <Button
            size="sm"
            className="bg-violet hover:bg-violet-dark text-white text-sm px-4"
          >
            Try for free
          </Button>
        </div>
      </div>
    </header>
  );
}
