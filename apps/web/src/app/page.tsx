import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { PainPoints } from '@/components/landing/pain-points';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

const SITE_URL = 'https://fitex.app';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Fitex',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
      },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Fitex',
      publisher: { '@id': `${SITE_URL}/#organization` },
      description:
        'AI-powered CV tailoring tool that rewrites your resume to match any job description, optimizes for ATS keywords, and delivers a ready-to-send PDF in 15 seconds.',
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: 'Fitex — Tailor your CV to any job in 15 seconds',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      description:
        'Stop getting ghosted. Fitex rewrites your CV to match any job description, optimizes for ATS keywords with a 94% match rate, and delivers a ready-to-send PDF in 15 seconds.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fitex',
      description:
        'AI-powered CV tailoring tool that rewrites your resume to match any job description, optimizes for ATS keywords, and delivers a ready-to-send PDF in 15 seconds.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Chrome Extension',
      url: SITE_URL,
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Free plan — 3 tailored CVs included',
        },
        {
          '@type': 'Offer',
          price: '9',
          priceCurrency: 'EUR',
          description: 'Starter — 15 credits, one-time purchase',
        },
        {
          '@type': 'Offer',
          price: '19',
          priceCurrency: 'EUR',
          description: 'Pro Pack — 40 credits, best value',
        },
        {
          '@type': 'Offer',
          price: '49',
          priceCurrency: 'EUR',
          description: 'Unlimited — unlimited generations for 30 days',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does Fitex tailor my CV?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Fitex uses AI to analyze a job description and rewrite your CV to match the required keywords and skills, optimizing it for ATS (Applicant Tracking Systems) with an average 94% keyword match rate.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does it take to generate a tailored CV?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Fitex generates a fully tailored, ATS-optimized CV in approximately 15 seconds, ready to download as a PDF.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Fitex free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Fitex offers 3 free tailored CVs with no credit card required. Additional credits can be purchased starting at 9 EUR for 15 credits.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is ATS and why does it matter?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ATS (Applicant Tracking System) is software used by 75% of employers to automatically screen CVs before a recruiter sees them. If your CV doesn\'t contain the right keywords, it gets rejected — even if you\'re qualified. Fitex ensures your CV passes ATS filters by matching keywords from the job description.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Fitex work with any CV template?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Fitex works with any CV template or format. Upload your existing CV once — whether it\'s a PDF, Word document, or LaTeX file — and Fitex will tailor the content while preserving your formatting.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do credits expire?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, credits never expire. You can purchase credits and use them whenever you need — there\'s no time limit. The only exception is the Unlimited plan, which gives unlimited generations for 30 days.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is Fitex different from other CV builders?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Unlike generic CV builders, Fitex doesn\'t create CVs from scratch. It takes your existing CV and intelligently rewrites it to match specific job descriptions, optimizing for ATS keywords. It also provides a match score so you know your chances before applying, and works directly from your browser via a Chrome extension.',
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div className="noise-overlay min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
