'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Starter',
    price: 15,
    period: '/month',
    description: 'For casual job seekers testing the waters.',
    features: [
      '10 CV generations per month',
      'ATS keyword analysis',
      'PDF export',
      'Basic Q&A generation',
      'Email support',
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 20,
    period: '/month',
    description: 'For active job seekers who want every edge.',
    features: [
      'Unlimited CV generations',
      'ATS keyword analysis',
      'PDF export',
      'Advanced Q&A generation',
      'Professional Stories library',
      'Browser extension',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: 40,
    period: '/month per seat',
    description: 'For career coaches and recruiting agencies.',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Shared story library',
      'Analytics dashboard',
      'Custom CV templates',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/80 block mb-4">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            Invest in your career, <span className="text-gradient">not your time</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            All plans include a 7-day free trial. No credit card required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex"
            >
              <Card
                className={`flex flex-col w-full border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-500 ${
                  plan.highlighted
                    ? 'border-violet/50 bg-card/70 glow-violet scale-[1.02]'
                    : 'hover:border-violet/30 hover:bg-card/70'
                }`}
              >
                <CardContent className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-medium tracking-tight">{plan.name}</h3>
                    {plan.highlighted && (
                      <Badge className="bg-violet/20 text-violet-light border-violet/30 text-[10px] tracking-wide">
                        Most popular
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-display font-bold text-foreground">{plan.price}&euro;</span>
                    <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                  </div>

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

                  <p className="text-[10px] font-mono text-muted-foreground/65 text-center mt-3 tracking-wide">
                    No credit card required
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
