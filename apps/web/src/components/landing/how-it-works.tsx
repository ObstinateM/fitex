import { AnimateIn } from './animate-in';

const steps = [
  {
    number: '01',
    title: 'Drop your CV once',
    description: 'Upload your CV file - any template works. You only do this once, then it\u2019s ready for every application.',
    code: 'cv-template.tex → uploaded',
  },
  {
    number: '02',
    title: 'Paste any job description',
    description: 'Copy from a job posting, or grab it in one click with our browser extension. No reformatting needed.',
    code: 'Senior Frontend Engineer - React, TS...',
  },
  {
    number: '03',
    title: 'Download & apply in 15s',
    description: 'Get a tailored CV with a 94% ATS match score. Download the PDF and hit apply - while others are still rewriting theirs.',
    code: '✓ ATS: 94% → tailored-cv.pdf',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <AnimateIn className="text-center mb-20">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-emerald/80 block mb-4">
            How it works
          </span>
          <h2 id="how-it-works-heading" className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            From job post to tailored CV in <span className="text-gradient">15 seconds</span>
          </h2>
        </AnimateIn>

        <AnimateIn className="rounded-xl border border-border/40 bg-card/30 divide-y divide-border/40">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="group relative grid grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_1fr] gap-4 lg:gap-8 items-start lg:items-center p-5 sm:p-6 hover:bg-card/40 transition-all duration-500"
            >
              {/* Number */}
              <span className="text-4xl sm:text-5xl font-display font-bold text-violet/20 group-hover:text-violet/40 transition-colors duration-500 select-none w-12 sm:w-16 text-center row-span-2 lg:row-span-1">
                {step.number}
              </span>

              {/* Text */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-medium tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Code snippet */}
              <div className="flex lg:justify-end col-start-2 lg:col-start-auto">
                <code className="text-xs font-mono text-muted-foreground/80 bg-surface/40 rounded-md px-3 py-2 border border-border/30 group-hover:text-violet-light/80 group-hover:border-violet/20 transition-all duration-500 lg:whitespace-nowrap">
                  {step.code}
                </code>
              </div>
            </div>
          ))}
        </AnimateIn>
      </div>
    </section>
  );
}
