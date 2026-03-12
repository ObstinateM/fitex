'use client';

import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'AI CV Tailoring',
    description: 'Your LaTeX CV is rewritten to highlight the most relevant experience for each specific job posting.',
    accent: 'violet',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'ATS Keyword Analysis',
    description: 'Before/after keyword scan shows exactly which terms were added and your estimated ATS pass rate.',
    accent: 'emerald',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'PDF in Seconds',
    description: 'LaTeX compilation happens server-side. Download a pixel-perfect PDF or iterate with AI feedback.',
    accent: 'violet',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Smart Q&A',
    description: 'Auto-generates answers to application questions using your CV, stories, and the job context.',
    accent: 'emerald',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Professional Stories',
    description: 'Store and manage career achievements. AI selects the most relevant ones for each application.',
    accent: 'violet',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Browser Extension',
    description: 'Select job descriptions directly from any page. Fill application forms without leaving the site.',
    accent: 'emerald',
  },
];

export function Features() {
  return (
    <section className="relative py-32 px-6">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/60 block mb-4">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif tracking-tight">
            Everything you need to <span className="text-gradient italic">land the role</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card className="group border-border/30 bg-card/40 backdrop-blur-sm hover:border-violet/20 transition-all duration-500 hover:bg-card/60 h-full">
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${
                      feature.accent === 'violet'
                        ? 'bg-violet/10 text-violet-light'
                        : 'bg-emerald/10 text-emerald'
                    } transition-colors duration-300 group-hover:${
                      feature.accent === 'violet' ? 'bg-violet/20' : 'bg-emerald/20'
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
