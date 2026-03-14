'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group/toast font-sans text-sm border bg-[#1e1a35] border-[oklch(0.30_0.03_280/0.5)] text-[oklch(0.95_0.01_280)] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),0_0_0_1px_rgba(124,58,237,0.08)] backdrop-blur-xl rounded-xl overflow-hidden',
          title: 'font-medium text-[oklch(0.95_0.01_280)] text-[13px]',
          description: 'font-mono text-[11px] tracking-wide text-[oklch(0.70_0.02_280)] mt-0.5',
          actionButton:
            'font-sans text-xs font-medium bg-[#7c3aed] hover:bg-[#5b21b6] text-white rounded-lg px-3 py-1.5 transition-colors duration-200',
          cancelButton:
            'font-sans text-xs font-medium bg-[oklch(0.22_0.03_280)] hover:bg-[oklch(0.26_0.03_280)] text-[oklch(0.70_0.02_280)] rounded-lg px-3 py-1.5 transition-colors duration-200',
          closeButton:
            'bg-[oklch(0.22_0.03_280)] border-[oklch(0.30_0.03_280/0.4)] text-[oklch(0.70_0.02_280)] hover:text-[oklch(0.95_0.01_280)] hover:bg-[oklch(0.28_0.03_280)] transition-colors duration-200',
          // Variants
          success:
            '!border-[#34d399]/25 !shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),0_0_0_1px_rgba(52,211,153,0.1),0_0_20px_-8px_rgba(52,211,153,0.2)]',
          error:
            '!border-red-500/25 !shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),0_0_0_1px_rgba(239,68,68,0.1),0_0_20px_-8px_rgba(239,68,68,0.2)]',
          info: '!border-[#7c3aed]/30 !shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),0_0_0_1px_rgba(124,58,237,0.15),0_0_20px_-8px_rgba(124,58,237,0.25)]',
          warning:
            '!border-amber-500/25 !shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),0_0_0_1px_rgba(245,158,11,0.1),0_0_20px_-8px_rgba(245,158,11,0.2)]',
          loader: 'text-[#a78bfa]',
          icon: 'mt-0.5',
        },
      }}
      style={
        {
          '--normal-bg': '#1e1a35',
          '--normal-border': 'oklch(0.30 0.03 280 / 0.5)',
          '--normal-text': 'oklch(0.95 0.01 280)',
          '--success-bg': '#1e1a35',
          '--success-border': 'rgba(52,211,153,0.25)',
          '--success-text': '#34d399',
          '--error-bg': '#1e1a35',
          '--error-border': 'rgba(239,68,68,0.25)',
          '--error-text': '#f87171',
          '--info-bg': '#1e1a35',
          '--info-border': 'rgba(124,58,237,0.3)',
          '--info-text': '#a78bfa',
          '--warning-bg': '#1e1a35',
          '--warning-border': 'rgba(245,158,11,0.25)',
          '--warning-text': '#fbbf24',
          '--width': '360px',
          '--offset': '20px',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { toast } from 'sonner';
