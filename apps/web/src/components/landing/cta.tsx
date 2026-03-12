'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-violet/5 blur-3xl" />

          <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-12 md:p-16 space-y-8">
            <h2 className="text-4xl sm:text-5xl font-serif tracking-tight">
              Stop rewriting your CV<br />
              <span className="text-gradient italic">manually.</span>
            </h2>

            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Join thousands of job seekers who land more interviews with
              AI-tailored, ATS-optimized LaTeX CVs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-violet hover:bg-violet-dark text-white px-10 py-6 text-base font-medium glow-violet transition-all duration-300 hover:scale-[1.02]"
              >
                Start for free
              </Button>
            </div>

            <p className="text-[11px] font-mono text-muted-foreground/40 tracking-wide">
              Free tier includes 10 generations per month
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
