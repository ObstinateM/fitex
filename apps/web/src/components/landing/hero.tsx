'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Animation steps:
// 0: idle - sidebar shows "Select elements" button, cursor near it
// 1: cursor clicks "Select elements" -> status changes to "Selecting..."
// 2: cursor moves to skeleton text on page
// 3: cursor clicks skeleton -> green border + Selected (1) appears
// 4: cursor moves to Generate button
// 5: cursor clicks Generate
// 6: generating loader (cursor hidden)
// 7: results appear with CV preview + ATS score (cursor hidden)
// 8: pause on results, then loop

const STEP_DURATIONS = [2000, 600, 1500, 600, 1500, 600, 3000, 4000, 2000];
const TOTAL_STEPS = STEP_DURATIONS.length;

const CURSOR_POSITIONS: { left: string; top: string }[] = [
  { left: '82%', top: '30%' },
  { left: '82%', top: '30%' },
  { left: '30%', top: '56%' },
  { left: '30%', top: '56%' },
  { left: '82%', top: '90%' },
  { left: '82%', top: '90%' },
  { left: '82%', top: '90%' },
  { left: '82%', top: '90%' },
  { left: '82%', top: '90%' },
];

function CursorIcon({ clicking }: { clicking: boolean }) {
  return (
    <motion.div animate={{ scale: clicking ? 0.8 : 1 }} transition={{ duration: 0.1 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
          fill="white"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="1.2"
        />
      </svg>
    </motion.div>
  );
}

function ClickRipple() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="absolute h-4 w-4 rounded-full bg-white/30 -translate-x-1/2 -translate-y-1/2"
    />
  );
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="h-5 w-5 rounded-full border-2 border-violet/20 border-t-violet"
    />
  );
}

function SidebarAssistant({
  isSelecting,
  isSelected,
  generateGlow,
}: {
  isSelecting: boolean;
  isSelected: boolean;
  generateGlow: boolean;
}) {
  return (
    <>
      <div className="px-4 py-3 space-y-4 flex-1">
        <span className="text-sm font-semibold text-foreground/90">CV Assistant</span>

        <AnimatePresence mode="wait">
          {isSelecting ? (
            <motion.div
              key="selecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="text-[10px] text-emerald/80">Selecting elements...</span>
            </motion.div>
          ) : (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-7 w-full rounded-md border border-border/30 bg-surface/60 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground/70">Select elements</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 overflow-hidden"
            >
              <span className="text-[10px] font-medium text-muted-foreground/70">Selected (1)</span>
              <div className="rounded-md border border-border/30 bg-surface/60 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono rounded bg-emerald/10 text-emerald/80 px-1.5 py-0.5">
                    Job Description
                  </span>
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
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <span className="text-[10px] text-muted-foreground/60">Guidance (optional)</span>
          <div className="h-14 rounded-md border border-border/20 bg-surface/30" />
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 mt-auto">
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9px] text-muted-foreground/40 text-right mb-2 font-mono"
            >
              ~13,064 tokens
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{
            boxShadow: generateGlow
              ? '0 0 20px rgba(124,58,237,0.4)'
              : '0 0 0px rgba(124,58,237,0)',
          }}
          transition={{ duration: 0.3 }}
          className="h-9 rounded-lg bg-violet flex items-center justify-center"
        >
          <span className="text-xs font-medium text-white">Generate</span>
        </motion.div>
      </div>
    </>
  );
}

function SidebarGenerating() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
      <Spinner />
      <span className="text-xs text-muted-foreground/70">Generating your CV...</span>
    </div>
  );
}

function SidebarResults() {
  return (
    <>
      <div className="px-4 py-3 space-y-3 flex-1 overflow-hidden">
        <span className="text-sm font-semibold text-foreground/90">Results</span>

        {/* CV preview card */}
        <div className="rounded-md border border-border/30 bg-white/[0.03] p-3 space-y-2.5">
          {/* Header: photo + name */}
          <div className="flex gap-2.5">
            <div className="h-10 w-10 rounded bg-muted/20 shrink-0" />
            <div className="flex-1 space-y-1.5 pt-0.5">
              <div className="h-2.5 w-4/5 rounded bg-foreground/15" />
              <div className="h-1.5 w-3/5 rounded bg-muted/20" />
            </div>
          </div>

          {/* Experience section */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-1/3 rounded bg-violet/25" />
            <div className="space-y-1">
              {[100, 90, 75, 95, 60].map((w, i) => (
                <div
                  key={`exp-${i}`}
                  className="h-1 rounded-full bg-muted/20"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>

          {/* Education section */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-1/4 rounded bg-violet/25" />
            <div className="space-y-1">
              {[85, 70, 90].map((w, i) => (
                <div
                  key={`edu-${i}`}
                  className="h-1 rounded-full bg-muted/20"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>

          {/* Skills section */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-1/3 rounded bg-violet/25" />
            <div className="flex flex-wrap gap-1">
              {[28, 35, 22, 30, 25, 20].map((w, i) => (
                <div
                  key={`skill-${i}`}
                  className="h-2.5 rounded-full bg-muted/15"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Download PDF button */}
        <div className="h-8 rounded-lg bg-emerald/80 flex items-center justify-center">
          <span className="text-[10px] font-medium text-white">Download PDF</span>
        </div>

        {/* ATS Keyword Scan */}
        <div className="space-y-2">
          <span className="text-[10px] font-medium text-muted-foreground/70">ATS Keyword Scan</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className="h-full rounded-full bg-emerald/70"
              />
            </div>
            <span className="text-[9px] font-mono text-emerald/80">78%</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {['React', 'TypeScript', 'CI/CD', 'AWS'].map((tag) => (
              <span
                key={tag}
                className="text-[8px] rounded-full bg-emerald/10 text-emerald/70 px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function Hero() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStep((s) => (s + 1) % TOTAL_STEPS);
    }, STEP_DURATIONS[step]);
    return () => clearTimeout(timeout);
  }, [step]);

  const isSelecting = step >= 1 && step <= 5;
  const isSelected = step >= 3 && step <= 5;
  const clicking = step === 1 || step === 3 || step === 5;
  const generateGlow = step === 5;
  const showCursor = step <= 5;
  const showGreenHighlight = step >= 3 && step <= 8;

  // Sidebar mode
  const sidebarMode = step <= 5 ? 'assistant' : step === 6 ? 'generating' : 'results';

  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative min-h-screen flex items-center justify-center overflow-x-clip">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] rounded-full bg-violet/10 blur-[120px] animate-pulse-glow" />

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

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 text-center w-full">
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
            className="mt-24 sm:mt-28"
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
            id="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[1.1]"
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
            className="max-w-xl w-full text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed"
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
            <p className="text-[10px] sm:text-xs font-mono text-muted-foreground/70 tracking-wide text-center text-balance">
              4x more callbacks &middot; <span className="text-white">No credit card required</span> &middot; Works with any CV template
            </p>
          </motion.div>
        </motion.div>

        {/* Floating extension mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-12 sm:mt-20 mx-auto max-w-5xl"
        >
          <div className="overflow-hidden">
          {/* Emerald glow behind mockup */}
          <div className="absolute inset-0 -m-6 rounded-2xl bg-emerald/8 blur-[60px]" />
          <div className="relative rounded-xl border border-border/40 bg-card backdrop-blur-sm p-1 glow-violet origin-top left-1/2 -translate-x-1/2 scale-[0.34] mb-[-290px] sm:scale-[0.55] sm:mb-[-200px] md:scale-[0.75] md:mb-[-110px] lg:scale-100 lg:mb-0 min-w-[900px]">
            <div className="relative rounded-lg bg-surface-raised overflow-hidden">
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
              <div className="flex h-[400px]">
                {/* Job listing page */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="h-4 w-3/5 rounded bg-foreground/20" />
                    <div className="h-2 w-2/5 rounded bg-muted-foreground/15" />
                  </div>
                  <div className="h-px bg-border/20" />

                  <div className="space-y-2.5">
                    {[90, 100, 75, 85].map((w, i) => (
                      <div
                        key={`pre-${i}`}
                        className="h-1.5 rounded-full bg-muted/30"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>

                  {/* Selectable element */}
                  <motion.div
                    animate={{
                      borderColor: showGreenHighlight
                        ? 'rgba(16,185,129,0.6)'
                        : 'rgba(16,185,129,0)',
                      backgroundColor: showGreenHighlight
                        ? 'rgba(16,185,129,0.05)'
                        : 'rgba(16,185,129,0)',
                    }}
                    transition={{ duration: 0.3 }}
                    className="rounded-md border-2 p-3 space-y-2"
                  >
                    {[95, 80, 100, 70].map((w, i) => (
                      <div
                        key={`sel-${i}`}
                        className="h-1.5 rounded-full bg-muted/40"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </motion.div>

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
                <div className="w-[260px] border-l border-border/30 bg-surface/40 flex flex-col overflow-hidden">
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

                  {/* Sidebar content — switches between modes */}
                  <AnimatePresence mode="wait">
                    {sidebarMode === 'assistant' && (
                      <motion.div
                        key="assistant"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col flex-1"
                      >
                        <SidebarAssistant
                          isSelecting={isSelecting}
                          isSelected={isSelected}
                          generateGlow={generateGlow}
                        />
                      </motion.div>
                    )}

                    {sidebarMode === 'generating' && (
                      <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col flex-1"
                      >
                        <SidebarGenerating />
                      </motion.div>
                    )}

                    {sidebarMode === 'results' && (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col flex-1"
                      >
                        <SidebarResults />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Animated cursor */}
              <AnimatePresence>
                {showCursor && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      left: CURSOR_POSITIONS[step].left,
                      top: CURSOR_POSITIONS[step].top,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 0.3 },
                      left: { duration: clicking ? 0 : 1.5, ease: [0.22, 1, 0.36, 1] },
                      top: { duration: clicking ? 0 : 1.5, ease: [0.22, 1, 0.36, 1] },
                    }}
                    className="absolute z-20 pointer-events-none"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                  >
                    <CursorIcon clicking={clicking} />
                    <AnimatePresence>
                      {clicking && <ClickRipple key={`ripple-${step}`} />}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Reflection */}
          <div className="absolute -bottom-12 left-[10%] right-[10%] h-12 bg-gradient-to-b from-violet/5 to-transparent blur-xl rounded-full" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
