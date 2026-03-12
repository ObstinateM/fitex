import { FitexLogo } from './logo';

export function Footer() {
  return (
    <footer className="border-t border-border/20 py-12 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <FitexLogo className="h-7 w-7" />
          <span className="font-medium tracking-tight text-sm">Fitex</span>
        </div>

        <nav className="flex items-center gap-8">
          {['Features', 'Pricing', 'Docs', 'GitHub'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors duration-300 tracking-wide"
            >
              {link}
            </a>
          ))}
        </nav>

        <p className="text-[11px] font-mono text-muted-foreground/70 tracking-wide">
          &copy; {new Date().getFullYear()} Fitex
        </p>
      </div>
    </footer>
  );
}
