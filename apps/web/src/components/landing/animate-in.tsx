'use client';

import { useRef, useEffect, type ReactNode } from 'react';

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: keyof HTMLElementTagNameMap;
}

export function AnimateIn({ children, className = '', delay = 0, as: Tag = 'div' }: AnimateInProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            setTimeout(() => el.classList.add('animate-in-visible'), delay);
          } else {
            el.classList.add('animate-in-visible');
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '-50px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    // @ts-expect-error - dynamic tag element
    <Tag ref={ref} className={`animate-in-hidden ${className}`}>
      {children}
    </Tag>
  );
}
