'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] rounded-full bg-violet/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-[30%] -right-[15%] h-[60vh] w-[60vh] rounded-full bg-emerald/8 blur-[100px] animate-pulse-glow" />
        <div className="absolute top-[20%] right-[10%] h-[40vh] w-[40vh] rounded-full bg-violet-light/5 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-28"
          >
            <Badge
              variant="outline"
              className="border-emerald/30 bg-emerald/5 px-4 py-1.5 text-xs tracking-widest uppercase text-emerald font-mono"
            >
              No credit card required
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1]"
          >
            Land more interviews.
            <br />
            <span className="text-gradient">Stop getting ghosted.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="max-w-xl text-lg text-muted-foreground leading-relaxed"
          >
            75% of CVs are rejected by ATS before a human ever reads them.
            Fitex rewrites your CV to match any job description, optimizes for ATS keywords,
            and delivers a ready-to-send PDF &mdash; in 15 seconds.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4"
          >
            <Button
              size="lg"
              className="bg-violet hover:bg-violet-dark text-white px-8 py-6 text-base font-medium glow-violet transition-all duration-300 hover:scale-[1.02]"
            >
              Try free &mdash; no credit card
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border/60 hover:border-violet/40 px-8 py-6 text-base text-foreground/80 hover:text-foreground transition-all duration-300"
            >
              Install extension
            </Button>
          </motion.div>

          {/* Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex flex-col items-center gap-2 mt-4"
          >
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                15s generation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                94% ATS match rate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                4x more callbacks
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground/70 tracking-wide">
              Free forever &middot; No credit card required &middot; Works with any CV template
            </p>
          </motion.div>
        </motion.div>

        {/* Floating CV mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-20 mx-auto max-w-4xl"
        >
          <div className="relative rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-1 glow-violet">
            <div className="rounded-lg bg-surface-raised overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-surface/60 rounded-md px-4 py-1 text-xs font-mono text-muted-foreground/80">
                    app.fitex.dev
                  </div>
                </div>
              </div>

              {/* App preview */}
              <div className="grid grid-cols-2 gap-0 min-h-[360px]">
                {/* Left panel - job desc */}
                <div className="border-r border-border/20 p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
                    <span className="text-xs font-mono text-emerald/80 tracking-wide">JOB DESCRIPTION</span>
                  </div>
                  {[85, 100, 70, 90, 60, 80, 95, 50, 75, 88].map((w, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-full bg-muted/40"
                      style={{ width: `${w}%`, opacity: 1 - i * 0.06 }}
                    />
                  ))}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'AWS', 'CI/CD', 'PostgreSQL'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-emerald/20 bg-emerald/5 px-2.5 py-0.5 text-[10px] font-mono text-emerald/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right panel - CV output */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-violet animate-pulse" />
                    <span className="text-xs font-mono text-violet-light/80 tracking-wide">TAILORED CV</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-3/5 rounded bg-foreground/20" />
                    <div className="h-1.5 w-2/5 rounded bg-muted-foreground/20" />
                  </div>
                  <div className="h-px bg-border/30 my-3" />
                  {[95, 80, 100, 65, 90, 75, 85, 70, 60, 92].map((w, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full bg-violet/15"
                      style={{ width: `${w}%`, opacity: 1 - i * 0.05 }}
                    />
                  ))}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-violet/20 flex items-center justify-center">
                      <span className="text-[8px] text-violet-light">%</span>
                    </div>
                    <div className="text-xs font-mono text-violet-light/70">
                      ATS Match: <span className="text-emerald">94%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection */}
          <div className="absolute -bottom-12 left-[10%] right-[10%] h-12 bg-gradient-to-b from-violet/5 to-transparent blur-xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
