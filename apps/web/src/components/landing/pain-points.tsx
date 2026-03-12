'use client';

import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

const stats = [
  { value: '75%', label: 'of CVs are rejected by ATS before a human reads them' },
  { value: '15s', label: 'to generate a fully tailored CV with Fitex' },
  { value: '94%', label: 'average ATS keyword match score' },
  { value: '4x', label: 'more interview callbacks reported by users' },
];

const painPoints = [
  {
    problem: 'You spend 45 min rewriting your CV for every single job',
    solution: 'Fitex does it in 15 seconds',
  },
  {
    problem: 'You never know why you get rejected - is it your CV or the ATS?',
    solution: 'See your exact ATS match score before you apply',
  },
  {
    problem: 'You copy-paste the same answers to every application form',
    solution: 'AI generates tailored answers for each role',
  },
  {
    problem: 'You have great experience but your CV doesn\'t show it for this role',
    solution: 'AI highlights the right achievements for each job',
  },
];

export function PainPoints() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/80 block mb-4">
            The numbers
          </span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            Your CV deserves to be <span className="text-gradient">actually read</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center rounded-xl border border-border/40 bg-card/30 p-6 hover:border-violet/20 transition-all duration-500"
            >
              <div className="text-4xl sm:text-5xl font-display font-bold text-gradient mb-2">{stat.value}</div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Pain points */}
        <div className="space-y-3">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-border/40 bg-card/30 p-5 hover:border-violet/20 transition-all duration-500"
            >
              <div className="flex items-start gap-3">
                <X className="mt-0.5 text-red-400/60 size-4 shrink-0" />
                <p className="text-sm text-muted-foreground">{point.problem}</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 text-emerald size-4 shrink-0" />
                <p className="text-sm text-foreground/90">{point.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
