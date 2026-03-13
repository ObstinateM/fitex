import { Card, CardContent } from '@/components/ui/card';
import { AnimateIn } from './animate-in';

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'One CV, every job',
    description: 'Stop rewriting from scratch. Your CV is automatically reworded to match each job description - so you apply to 5x more positions in the same time.',
    accent: 'violet',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Beat the ATS filter',
    description: 'See your keyword match score before you apply. Know exactly which terms were added to get past automated screening - 94% average match rate.',
    accent: 'emerald',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Ready-to-send in 15 seconds',
    description: 'Get a pixel-perfect PDF instantly. No formatting headaches, no broken layouts - download and apply right away.',
    accent: 'violet',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Nail every application question',
    description: 'Application forms filled in seconds. AI crafts tailored answers using your experience and the job context - no more blank stares at "Why this role?"',
    accent: 'emerald',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Your best stories, always relevant',
    description: 'Store your career wins once. AI picks the right achievements for each application - your most impressive stories always surface at the right time.',
    accent: 'violet',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Apply without leaving the page',
    description: 'See a job you like? One click captures the description and fills the application form - directly from your browser. No copy-pasting.',
    accent: 'emerald',
  },
];

export function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="relative py-32 px-6">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <AnimateIn className="text-center mb-20">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/80 block mb-4">
            Features
          </span>
          <h2 id="features-heading" className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            AI-powered CV tailoring that <span className="text-gradient">gets you past the ATS</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            Automatically match your resume to any job description, beat applicant tracking systems, and apply faster — all from one tool.
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <AnimateIn key={feature.title} delay={i * 80}>
              <article>
                <Card className="group border-border/40 bg-card/50 backdrop-blur-sm hover:border-violet/30 transition-all duration-500 hover:bg-card/70 h-full">
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
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
