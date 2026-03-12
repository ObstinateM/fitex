'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { FitexLogo } from './logo';

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/10 bg-background/60 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          <FitexLogo className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight">Fitex</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'Pricing'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Log in
          </Button>
          <Button
            size="sm"
            className="bg-violet hover:bg-violet-dark text-white text-sm px-4"
          >
            Get started
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
