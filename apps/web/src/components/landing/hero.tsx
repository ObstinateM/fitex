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
            className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[1.1]"
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
            <p className="text-xs font-mono text-muted-foreground/70 tracking-wide">
              4x more callbacks &middot; <span className="text-white">No credit card required</span> &middot; Works with any CV template
            </p>
          </motion.div>
        </motion.div>

        {/* Floating extension mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-20 mx-auto max-w-5xl"
        >
          <div className="relative rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-1 glow-violet">
            <div className="rounded-lg bg-surface-raised overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-surface/60 rounded-md px-4 py-1 text-xs font-mono text-muted-foreground/80">
                    jobs.example.com/fullstack-engineer
                  </div>
                </div>
              </div>

              {/* Page + Sidebar layout */}
              <div className="flex min-h-[400px]">
                {/* Job listing page */}
                <div className="flex-1 p-6 space-y-4">
                  {/* Job title */}
                  <div className="space-y-1.5">
                    <div className="h-4 w-3/5 rounded bg-foreground/20" />
                    <div className="h-2 w-2/5 rounded bg-muted-foreground/15" />
                  </div>
                  <div className="h-px bg-border/20" />

                  {/* Job description lines */}
                  <div className="space-y-2.5">
                    {[90, 100, 75, 85].map((w, i) => (
                      <div
                        key={`pre-${i}`}
                        className="h-1.5 rounded-full bg-muted/30"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>

                  {/* Selected element - green highlight */}
                  <div className="rounded-md border-2 border-emerald/60 bg-emerald/5 p-3 space-y-2">
                    {[95, 80, 100, 70].map((w, i) => (
                      <div
                        key={`sel-${i}`}
                        className="h-1.5 rounded-full bg-muted/40"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>

                  {/* More lines after */}
                  <div className="space-y-2.5">
                    {[80, 65, 95, 70, 88, 60].map((w, i) => (
                      <div
                        key={`post-${i}`}
                        className="h-1.5 rounded-full bg-muted/30"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Fitex sidebar */}
                <div className="w-[260px] border-l border-border/30 bg-surface/40 flex flex-col">
                  {/* Sidebar header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-violet/20 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-violet-light">F</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground/90">Fitex</span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-4 w-4 rounded bg-muted/20" />
                      <div className="h-4 w-4 rounded bg-muted/20" />
                    </div>
                  </div>

                  <div className="px-4 py-3 space-y-4 flex-1">
                    {/* CV Assistant title */}
                    <span className="text-sm font-semibold text-foreground/90">CV Assistant</span>

                    {/* Selecting status */}
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                      <span className="text-[10px] text-emerald/80">Selecting elements...</span>
                    </div>

                    {/* Selected element */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-medium text-muted-foreground/70">Selected (1)</span>
                      <div className="rounded-md border border-border/30 bg-surface/60 p-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono rounded bg-emerald/10 text-emerald/80 px-1.5 py-0.5">Job Description</span>
                          <div className="h-3 w-3 rounded-sm bg-muted/20" />
                        </div>
                        <div className="space-y-1">
                          {[100, 85, 70].map((w, i) => (
                            <div
                              key={`side-${i}`}
                              className="h-1 rounded-full bg-muted/30"
                              style={{ width: `${w}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Guidance field */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-muted-foreground/60">Guidance (optional)</span>
                      <div className="h-14 rounded-md border border-border/20 bg-surface/30" />
                    </div>
                  </div>

                  {/* Generate button */}
                  <div className="px-4 pb-4 pt-2 mt-auto">
                    <div className="text-[9px] text-muted-foreground/40 text-right mb-2 font-mono">
                      ~13,064 tokens
                    </div>
                    <div className="h-9 rounded-lg bg-violet flex items-center justify-center">
                      <span className="text-xs font-medium text-white">Generate</span>
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
