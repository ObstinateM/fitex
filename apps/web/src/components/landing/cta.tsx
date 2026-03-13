import { Button } from '@/components/ui/button';
import { AnimateIn } from './animate-in';

export function CTA() {
  return (
    <section aria-labelledby="cta-heading" className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-3xl text-center">
        <AnimateIn className="relative">
          {/* Glow */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-violet/5 blur-3xl" />

          <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 sm:p-12 md:p-16 space-y-5">
            <h2 id="cta-heading" className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Every hour you spend rewriting your CV<br />
              <span className="text-gradient">is an hour you could be interviewing.</span>
            </h2>

            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Start applying smarter today. Get your first tailored CV in under 15 seconds.
            </p>

            <div className="flex flex-col items-center gap-6">
              <Button
                size="lg"
                className="bg-violet hover:bg-violet-dark text-white px-6 py-4 text-sm sm:px-10 sm:py-6 sm:text-base font-medium glow-violet transition-all duration-300 hover:scale-[1.02]"
              >
                Get started free &mdash; no credit card
              </Button>

              {/* Lead magnet */}
              <div className="w-full max-w-md">
                <p className="text-xs text-muted-foreground/80 mb-3">
                  Not ready yet? Get our free guide:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label htmlFor="lead-email" className="sr-only">Email address</label>
                  <input
                    id="lead-email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="flex-1 rounded-lg border border-border/50 bg-surface/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-violet/40 transition-colors"
                  />
                  <Button
                    variant="outline"
                    className="border-violet/30 text-violet-light hover:bg-violet/10 px-5 shrink-0 self-stretch h-auto py-3 sm:py-0"
                  >
                    Send guide
                  </Button>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground/60 mt-2 tracking-wide">
                  &ldquo;7 CV mistakes that get you auto-rejected by ATS&rdquo; &mdash; free PDF
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
