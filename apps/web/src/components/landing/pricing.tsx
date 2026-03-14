import { Check, Zap, Target, Sparkles, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimateIn } from './animate-in';

const plans = [
  {
    name: 'Free',
    price: 0,
    suffix: '',
    badge: 'No card needed',
    subtitle: '3 credits included',
    description: 'Try it — no strings attached.',
    features: [
      '3 tailored CVs',
      'ATS keyword analysis',
      'PDF export',
      'Q&A generation',
      'Salary estimation',
    ],
    cta: 'Install the extension',
    highlighted: false,
    icon: Zap,
    footnote: 'Free forever',
  },
  {
    name: 'Starter',
    price: 9,
    suffix: '',
    badge: 'One-time',
    subtitle: '0.60\u20AC per credit',
    description: 'For focused job seekers with a target list.',
    features: [
      '15 credits',
      'ATS keyword analysis',
      'PDF export',
      'Q&A generation',
      'Salary estimation',
      'Feedback refinement',
      'Story library',
    ],
    cta: 'Get 15 credits',
    highlighted: false,
    icon: Target,
    footnote: 'Credits never expire',
  },
  {
    name: 'Pro Pack',
    price: 19,
    suffix: '',
    badge: 'Best value',
    subtitle: '0.48\u20AC per credit',
    description: 'Best value — for active job seekers who apply everywhere.',
    features: [
      '40 credits',
      'Everything in Starter',
      'Priority generation',
      'Credits never expire',
    ],
    cta: 'Get 40 credits',
    highlighted: true,
    icon: Sparkles,
    footnote: 'Most chosen by job seekers',
  },
  {
    name: 'Unlimited',
    price: 49,
    suffix: '/month',
    badge: 'Sprint mode',
    subtitle: 'Unlimited for 30 days',
    description: 'Applying sprint mode. Cancel anytime.',
    features: [
      'Unlimited generations for 30 days',
      'Everything in Pro Pack',
      'Priority generation',
    ],
    cta: 'Go unlimited',
    highlighted: false,
    icon: Infinity,
    footnote: 'Cancel anytime',
  },
];

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <AnimateIn className="text-center mb-16">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/80 block mb-4">
            Pricing
          </span>
          <h2 id="pricing-heading" className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            Pay per CV, not per month.{' '}
            <span className="text-gradient">No waste.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Start with 3 free tailored CVs. Buy more when you need them — credits never expire.
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <AnimateIn key={plan.name} delay={i * 100} className="flex">
                <Card
                  className={`flex flex-col w-full border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-500 ${
                    plan.highlighted
                      ? 'border-violet/50 bg-card/70 glow-violet scale-[1.02]'
                      : 'hover:border-violet/30 hover:bg-card/70'
                  }`}
                >
                  <CardContent className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon
                        className={`size-4 shrink-0 ${
                          plan.highlighted ? 'text-violet-light' : 'text-muted-foreground'
                        }`}
                      />
                      <h3 className="text-lg font-medium tracking-tight">{plan.name}</h3>
                      <Badge
                        className={`ml-auto text-[10px] tracking-wide ${
                          plan.highlighted
                            ? 'bg-violet/20 text-violet-light border-violet/30'
                            : 'bg-muted/50 text-muted-foreground border-border/40'
                        }`}
                      >
                        {plan.badge}
                      </Badge>
                    </div>

                    <div className="mb-1">
                      {plan.price === 0 ? (
                        <span className="text-4xl font-display font-bold text-foreground">
                          Free
                        </span>
                      ) : (
                        <>
                          <span className="text-4xl font-display font-bold text-foreground">
                            {plan.price}&euro;
                          </span>
                          {plan.suffix && (
                            <span className="text-sm text-muted-foreground ml-1">
                              {plan.suffix}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <p
                      className={`text-xs font-mono mb-4 h-4 ${
                        plan.highlighted ? 'text-violet-light/70' : 'text-muted-foreground/50'
                      }`}
                    >
                      {plan.subtitle}
                    </p>

                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <Check className="text-emerald mt-0.5 size-4 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full py-5 text-sm font-medium transition-all duration-300 ${
                        plan.highlighted
                          ? 'bg-violet hover:bg-violet-dark text-white glow-violet hover:scale-[1.02]'
                          : 'bg-card border border-border/40 text-foreground hover:border-violet/30 hover:bg-card/80'
                      }`}
                    >
                      {plan.cta}
                    </Button>

                    <p className="text-[10px] font-mono text-muted-foreground/50 text-center mt-3 tracking-wide h-4">
                      {plan.footnote}
                    </p>
                  </CardContent>
                </Card>
              </AnimateIn>
            );
          })}
        </div>

        <AnimateIn delay={500} className="text-center text-sm text-muted-foreground/60 mt-8">
          1 credit = CV tailoring. Add Q&A (+0.5) or salary estimate (+0.5) per generation.
        </AnimateIn>
      </div>
    </section>
  );
}
