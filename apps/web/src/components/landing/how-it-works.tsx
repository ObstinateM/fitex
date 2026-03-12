'use client';

import { motion } from 'motion/react';

const steps = [
  {
    number: '01',
    title: 'Upload your LaTeX CV',
    description: 'Drop your .tex file or a .zip with supporting assets. Any LaTeX template works.',
    code: '\\documentclass{article}',
  },
  {
    number: '02',
    title: 'Paste the job description',
    description: 'Copy from any job posting, or use the browser extension to select it directly from the page.',
    code: 'Senior Frontend Engineer — React, TypeScript...',
  },
  {
    number: '03',
    title: 'Generate & download',
    description: 'AI rewrites your CV, compiles to PDF, and shows your ATS keyword match score.',
    code: '✓ ATS match: 94% → resume.pdf',
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-emerald/60 block mb-4">
            How it works
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif tracking-tight">
            Three steps to a <span className="text-gradient italic">perfect fit</span>
          </h2>
        </motion.div>

        <div className="space-y-2">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative grid grid-cols-[auto_1fr_1fr] gap-8 items-center rounded-xl border border-border/20 bg-card/20 p-6 hover:border-violet/20 hover:bg-card/40 transition-all duration-500"
            >
              {/* Number */}
              <span className="text-5xl font-serif text-violet/20 group-hover:text-violet/40 transition-colors duration-500 select-none w-16 text-center">
                {step.number}
              </span>

              {/* Text */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-medium tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Code snippet */}
              <div className="flex justify-end">
                <code className="text-xs font-mono text-muted-foreground/50 bg-surface/40 rounded-md px-3 py-2 border border-border/10 group-hover:text-violet-light/50 group-hover:border-violet/10 transition-all duration-500">
                  {step.code}
                </code>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
