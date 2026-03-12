'use client';

import { motion } from 'motion/react';

const steps = [
  {
    number: '01',
    title: 'Drop your CV once',
    description: 'Upload your CV file — any template works. You only do this once, then it\u2019s ready for every application.',
    code: 'cv-template.tex → uploaded',
  },
  {
    number: '02',
    title: 'Paste any job description',
    description: 'Copy from a job posting, or grab it in one click with our browser extension. No reformatting needed.',
    code: 'Senior Frontend Engineer — React, TS...',
  },
  {
    number: '03',
    title: 'Download & apply in 15s',
    description: 'Get a tailored CV with a 94% ATS match score. Download the PDF and hit apply — while others are still rewriting theirs.',
    code: '✓ ATS: 94% → tailored-cv.pdf',
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
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-emerald/80 block mb-4">
            How it works
          </span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            From job post to tailored CV in <span className="text-gradient">15 seconds</span>
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
              className="group relative grid grid-cols-[auto_1fr_1fr] gap-8 items-center rounded-xl border border-border/40 bg-card/30 p-6 hover:border-violet/20 hover:bg-card/40 transition-all duration-500"
            >
              {/* Number */}
              <span className="text-5xl font-display font-bold text-violet/20 group-hover:text-violet/40 transition-colors duration-500 select-none w-16 text-center">
                {step.number}
              </span>

              {/* Text */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-medium tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Code snippet */}
              <div className="flex justify-end">
                <code className="text-xs font-mono text-muted-foreground/80 bg-surface/40 rounded-md px-3 py-2 border border-border/30 group-hover:text-violet-light/80 group-hover:border-violet/20 transition-all duration-500">
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
