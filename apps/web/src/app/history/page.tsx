'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGenerationHistory, type GenerationHistoryEntry } from '@/lib/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' today';
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function scoreColor(score: number): string {
  if (score > 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function scoreBg(score: number): string {
  if (score > 70) return 'bg-emerald-400/10 border-emerald-400/20';
  if (score >= 40) return 'bg-amber-400/10 border-amber-400/20';
  return 'bg-red-400/10 border-red-400/20';
}

function snippet(text: string, max = 120): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '...';
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-border/20" />
        <circle
          cx="22" cy="22" r={r} fill="none" strokeWidth="3"
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${scoreColor(score)} transition-all duration-700`}
        />
      </svg>
      <span className={`absolute text-xs font-bold font-mono ${scoreColor(score)}`}>
        {score}%
      </span>
    </div>
  );
}

// ─── Generation Card ─────────────────────────────────────────────────────────

function GenerationCard({ entry }: { entry: GenerationHistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const maxBadges = 5;
  const visibleKeywords = entry.atsKeywords.slice(0, maxBadges);
  const remaining = entry.atsKeywords.length - maxBadges;

  return (
    <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-violet/20">
      {/* Collapsed header */}
      <button
        className="w-full flex items-start gap-4 px-5 py-4 text-left transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Date + score row */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground/60 tracking-wide">
              {formatDate(entry.createdAt)}
            </span>
            {entry.matchScore !== null && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold font-mono ${scoreBg(entry.matchScore)} ${scoreColor(entry.matchScore)}`}>
                {entry.matchScore}%
              </span>
            )}
          </div>

          {/* Job description snippet */}
          <p className="text-sm text-foreground/90 leading-relaxed">
            {snippet(entry.jobDescription)}
          </p>

          {/* ATS keyword badges */}
          {entry.atsKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visibleKeywords.map((kw) => (
                <Badge
                  key={kw}
                  variant="outline"
                  className="border-violet/20 bg-violet/5 text-violet-light text-[11px]"
                >
                  {kw}
                </Badge>
              ))}
              {remaining > 0 && (
                <Badge
                  variant="outline"
                  className="border-border/40 text-muted-foreground text-[11px]"
                >
                  +{remaining}
                </Badge>
              )}
            </div>
          )}

          {/* Adjustment comment */}
          {entry.adjustmentComment && (
            <p className="text-xs text-muted-foreground/50 italic truncate">
              &ldquo;{entry.adjustmentComment}&rdquo;
            </p>
          )}
        </div>

        {/* Score ring (larger screens) */}
        {entry.matchScore !== null && (
          <div className="hidden sm:block">
            <ScoreRing score={entry.matchScore} />
          </div>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/20 px-5 py-4 space-y-4">
          {/* Full job description */}
          <div>
            <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
              Job Description
            </span>
            <p className="mt-1.5 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {entry.jobDescription}
            </p>
          </div>

          {/* All keywords */}
          {entry.atsKeywords.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                ATS Keywords ({entry.atsKeywords.length})
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {entry.atsKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="border-violet/20 bg-violet/5 text-violet-light text-[11px]"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Adjustment comment full */}
          {entry.adjustmentComment && (
            <div>
              <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                Adjustment
              </span>
              <p className="mt-1.5 text-sm text-foreground/80 italic">
                {entry.adjustmentComment}
              </p>
            </div>
          )}

          {/* View PDF button */}
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-violet/30 text-violet-light hover:bg-violet/10 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`${API_URL}/cv/history/${entry.id}/pdf`, '_blank');
              }}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              View PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { data: history = [], isPending: loading } = useGenerationHistory();

  return (
    <div className="noise-overlay min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
              History
            </h1>
          </div>
          {history.length > 0 && (
            <span className="text-xs font-mono text-muted-foreground/50 tracking-wide">
              {history.length} {history.length === 1 ? 'generation' : 'generations'}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-light" />
            <p className="text-sm text-muted-foreground/50">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="rounded-2xl border border-border/20 bg-card/20 backdrop-blur-sm p-6">
              <svg className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-foreground/70">No generations yet</p>
              <p className="text-xs text-muted-foreground/50 mt-1 max-w-xs">
                Use the browser extension to tailor your CV to a job description. Every generation will appear here.
              </p>
            </div>
          </div>
        ) : (
          /* Card list */
          <div className="space-y-3">
            {history.map((entry) => (
              <GenerationCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
