import { Check, X } from 'lucide-react';
import { AnimateIn } from './animate-in';

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
    <section aria-labelledby="pain-points-heading" className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Stats */}
        <AnimateIn className="text-center mb-16">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/80 block mb-4">
            The numbers
          </span>
          <h2 id="pain-points-heading" className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            Your CV deserves to be <span className="text-gradient">actually read</span>
          </h2>
        </AnimateIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <AnimateIn
              key={stat.value}
              delay={i * 100}
              className="text-center rounded-xl border border-border/40 bg-card/30 p-6 hover:border-violet/20 transition-all duration-500"
            >
              <div className="text-4xl sm:text-5xl font-display font-bold text-gradient mb-2">{stat.value}</div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{stat.label}</p>
            </AnimateIn>
          ))}
        </div>

        {/* Pain points */}
        <div className="space-y-3">
          {painPoints.map((point, i) => (
            <AnimateIn
              key={i}
              delay={i * 80}
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
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
