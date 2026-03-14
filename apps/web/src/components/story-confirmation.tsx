'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Story {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

interface StorySelection {
  id: string;
  reason: string;
}

interface StoryConfirmationProps {
  stories: Story[];
  selections: StorySelection[];
  onConfirm: (ids: string[]) => void;
  onCancel: () => void;
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-[18px] w-[18px] shrink-0 rounded-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50 ${
        checked
          ? 'border-violet bg-violet shadow-[0_0_8px_-2px_rgba(124,58,237,0.5)]'
          : 'border-border/60 bg-surface-raised/50 hover:border-violet/40'
      }`}
    >
      <svg
        className={`absolute inset-0 m-auto h-3 w-3 text-white transition-all duration-200 ${
          checked ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </button>
  );
}

export function StoryConfirmation({
  stories,
  selections,
  onConfirm,
  onCancel,
}: StoryConfirmationProps) {
  const selectedIdSet = new Set(selections.map((s) => s.id));
  const reasonMap = new Map(selections.map((s) => [s.id, s.reason]));

  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(selections.map((s) => s.id)),
  );

  const picked = stories.filter((s) => selectedIdSet.has(s.id));
  const rest = stories.filter((s) => !selectedIdSet.has(s.id));

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-2xl border border-violet/20 bg-card/30 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-violet/10 bg-violet/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-violet-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span className="text-sm font-medium text-violet-light">
              Stories selected for this job
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-violet/30 bg-violet/10 text-violet-light text-[11px]"
          >
            {checked.size} selected
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* AI-selected stories */}
        <div className="space-y-1">
          {picked.map((s) => (
            <div
              key={s.id}
              className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-all duration-200 cursor-pointer ${
                checked.has(s.id)
                  ? 'bg-violet/5 hover:bg-violet/8'
                  : 'opacity-50 hover:opacity-70'
              }`}
              onClick={() => toggle(s.id)}
            >
              <Checkbox
                checked={checked.has(s.id)}
                onChange={() => toggle(s.id)}
              />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-foreground group-hover:text-violet-light transition-colors duration-200">
                  {s.title}
                </span>
                <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">
                  {reasonMap.get(s.id)}
                </p>
                {s.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.tags.slice(0, 4).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-violet/15 bg-violet/5 text-violet-light/70 text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Other stories */}
        {rest.length > 0 && (
          <div className="space-y-1 pt-3 border-t border-border/20">
            <p className="text-xs font-mono tracking-wider uppercase text-muted-foreground/40 px-3 pb-1">
              Other stories
            </p>
            {rest.map((s) => (
              <div
                key={s.id}
                className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer ${
                  checked.has(s.id)
                    ? 'bg-violet/5'
                    : 'hover:bg-surface-raised/30'
                }`}
                onClick={() => toggle(s.id)}
              >
                <Checkbox
                  checked={checked.has(s.id)}
                  onChange={() => toggle(s.id)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onConfirm(Array.from(checked))}
            className="flex-1 h-10 rounded-xl bg-violet hover:bg-violet-dark transition-all duration-300 glow-violet"
          >
            Confirm &amp; Generate
          </Button>
          <Button variant="outline" className="h-10 rounded-xl" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
