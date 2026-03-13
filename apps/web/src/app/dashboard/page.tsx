'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut, twoFactor } from '@/lib/auth-client';
import { authedFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FitexLogo } from '@/components/landing/logo';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CvTemplate {
  id: string;
  tex: string;
  filename?: string;
  updatedAt: string;
}

type TemplateView = 'idle' | 'edit' | 'add' | 'delete-confirm';

// ─── Fake credits data ────────────────────────────────────────────────────────

const CREDITS_USED = 3;
const CREDITS_TOTAL = 10;
const CREDITS_REMAINING = CREDITS_TOTAL - CREDITS_USED;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent = 'violet',
  children,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'violet' | 'emerald';
  children?: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 flex flex-col gap-3 hover:border-violet/30 transition-all duration-300 group overflow-hidden">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${accent === 'violet' ? 'bg-violet/3' : 'bg-emerald/3'}`} />
      <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground/70">{label}</span>
      <div className="flex items-end gap-2">
        <span className={`text-4xl font-display font-bold tracking-tight ${accent === 'violet' ? 'text-gradient' : 'text-emerald'}`}>
          {value}
        </span>
        {sub && <span className="text-sm text-muted-foreground mb-1">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

function CreditBar({ used, total }: { used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="w-full">
      <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet to-violet-light transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{used} of {total} used this month</p>
    </div>
  );
}

// ─── LaTeX file dropzone (inline, minimal) ────────────────────────────────────

function LatexDropzoneInline({ onFile }: { onFile: (tex: string, filename: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      onFile(e.target?.result as string, file.name);
    };
    reader.readAsText(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.tex')) readFile(file);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`group cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
        dragging ? 'border-violet bg-violet/5' : 'border-border/40 hover:border-violet/50 hover:bg-violet/3'
      }`}
    >
      <input ref={inputRef} type="file" accept=".tex" onChange={onChange} className="hidden" />
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-violet/10 text-violet-light mb-3 mx-auto group-hover:bg-violet/20 transition-colors">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground/80">Drop your <span className="text-violet-light">.tex</span> file here</p>
      <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
    </div>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: CvTemplate;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-surface/60 overflow-hidden transition-all duration-300 hover:border-violet/20">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-surface-raised/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet/10 text-violet-light shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{template.filename ?? 'cv-template.tex'}</p>
            <p className="text-xs text-muted-foreground">Updated {timeAgo(template.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-light/80 hover:text-violet-light px-3 py-1.5 rounded-lg hover:bg-violet/10 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete
          </button>
        </div>
      </div>
      {/* LaTeX preview */}
      <pre className="px-4 py-3 text-xs font-mono text-muted-foreground/70 leading-relaxed overflow-hidden whitespace-pre-wrap line-clamp-4 max-h-24 select-none">
        {template.tex.slice(0, 280)}{template.tex.length > 280 ? '\n…' : ''}
      </pre>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Template state
  const [template, setTemplate] = useState<CvTemplate | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateView, setTemplateView] = useState<TemplateView>('idle');
  const [editTex, setEditTex] = useState('');
  const [editFilename, setEditFilename] = useState('');
  const [addTex, setAddTex] = useState('');
  const [addFilename, setAddFilename] = useState('');
  const [saving, setSaving] = useState(false);
  const [templateError, setTemplateError] = useState('');

  // 2FA state
  const [totpURI, setTotpURI] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [twoFAPassword, setTwoFAPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [twoFAStatus, setTwoFAStatus] = useState('');

  // Auth redirect
  useEffect(() => {
    if (!isPending && !session) router.push('/login');
  }, [isPending, session, router]);

  // Fetch template
  const fetchTemplate = useCallback(async () => {
    setTemplateLoading(true);
    try {
      const res = await authedFetch('/cv/template');
      if (res.ok) {
        const data = await res.json();
        setTemplate(data);
      } else {
        setTemplate(null);
      }
    } catch {
      setTemplate(null);
    } finally {
      setTemplateLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchTemplate();
  }, [session, fetchTemplate]);

  // ── Template handlers ──────────────────────────────────────────────────────

  function startEdit() {
    if (!template) return;
    setEditTex(template.tex);
    setEditFilename(template.filename ?? '');
    setTemplateError('');
    setTemplateView('edit');
  }

  async function saveEdit() {
    if (!editTex.trim()) return;
    setSaving(true);
    setTemplateError('');
    try {
      const res = await authedFetch('/cv/template', {
        method: 'POST',
        body: JSON.stringify({ tex: editTex, filename: editFilename || undefined }),
      });
      if (!res.ok) { setTemplateError('Failed to save. Please try again.'); return; }
      await fetchTemplate();
      setTemplateView('idle');
    } catch {
      setTemplateError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function saveAdd() {
    if (!addTex.trim()) return;
    setSaving(true);
    setTemplateError('');
    try {
      const res = await authedFetch('/cv/template', {
        method: 'POST',
        body: JSON.stringify({ tex: addTex, filename: addFilename || undefined }),
      });
      if (!res.ok) { setTemplateError('Failed to save. Please try again.'); return; }
      await fetchTemplate();
      setTemplateView('idle');
      setAddTex('');
      setAddFilename('');
    } catch {
      setTemplateError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    // No backend DELETE endpoint yet — clear optimistically
    setTemplate(null);
    setTemplateView('idle');
  }

  // ── 2FA handlers ──────────────────────────────────────────────────────────

  async function handleEnable2FA(e: React.FormEvent) {
    e.preventDefault();
    setTwoFAStatus('');
    const { data, error } = await twoFactor.enable({ password: twoFAPassword });
    if (error) { setTwoFAStatus(error.message ?? 'Failed to enable 2FA'); return; }
    if (data?.totpURI) { setTotpURI(data.totpURI); setShowPasswordPrompt(false); setTwoFAPassword(''); }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await twoFactor.verifyTotp({ code: verifyCode });
    if (error) { setTwoFAStatus(error.message ?? 'Invalid code'); return; }
    setTwoFAStatus('2FA enabled successfully');
    setTotpURI(''); setVerifyCode('');
  }

  // ── Loading / unauthenticated ─────────────────────────────────────────────

  if (isPending) {
    return (
      <div className="noise-overlay flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-violet border-t-transparent animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (!session) return null;

  const firstName = session.user.name?.split(' ')[0] ?? 'there';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="noise-overlay min-h-screen bg-background">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet/8 blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald/6 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Top nav ── */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Fitex home">
            <FitexLogo className="h-8 w-8" />
            <span className="text-base font-semibold tracking-tight">Fitex</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Overview', href: '#overview' },
              { label: 'Templates', href: '#templates' },
              { label: 'Security', href: '#security' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5 border border-border/30">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">{CREDITS_REMAINING} credits</span>
            </div>
            <button
              onClick={async () => { await signOut({ fetchOptions: {} }); router.push('/login'); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-muted/50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-5xl px-6 py-12 space-y-14 relative z-10">

        {/* ── Section: Overview ── */}
        <section id="overview">
          <div className="mb-8">
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/60 mb-2">Dashboard</p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Welcome back, <span className="text-gradient">{firstName}</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">{session.user.email}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Credits remaining" value={CREDITS_REMAINING} sub={`/ ${CREDITS_TOTAL}`} accent="violet">
              <CreditBar used={CREDITS_USED} total={CREDITS_TOTAL} />
              <a href="#" className="text-xs text-violet-light/70 hover:text-violet-light transition-colors duration-200 flex items-center gap-1 w-fit">
                Get more credits
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </StatCard>

            <StatCard label="CVs generated" value={CREDITS_USED} sub="this month" accent="emerald">
              <p className="text-xs text-muted-foreground/70">Avg. match rate <span className="text-emerald font-medium">94%</span></p>
            </StatCard>

            <StatCard label="Current plan" value="Starter" accent="violet">
              <p className="text-xs text-muted-foreground/70">Renews on Apr 13, 2026</p>
              <a href="/pricing" className="text-xs text-violet-light/70 hover:text-violet-light transition-colors duration-200 flex items-center gap-1 w-fit">
                Upgrade plan
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </StatCard>
          </div>
        </section>

        {/* ── Section divider ── */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />

        {/* ── Section: CV Templates ── */}
        <section id="templates">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/60 mb-1.5">CV Templates</p>
              <h2 className="text-xl font-display font-bold tracking-tight">Your LaTeX templates</h2>
              <p className="text-sm text-muted-foreground mt-1">Fitex tailors your CV to each job using this template.</p>
            </div>
            {template && templateView === 'idle' && (
              <button
                onClick={() => { setTemplateView('add'); setAddTex(''); setAddFilename(''); setTemplateError(''); }}
                className="inline-flex items-center gap-2 text-sm font-medium bg-violet/10 hover:bg-violet/20 text-violet-light border border-violet/20 hover:border-violet/40 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16m-8-8h16" strokeLinecap="round" />
                </svg>
                Replace template
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">

            {/* ── Idle: show template or empty state ── */}
            {templateView === 'idle' && (
              <div className="p-6">
                {templateLoading ? (
                  <div className="flex items-center gap-3 text-muted-foreground py-4">
                    <div className="h-4 w-4 rounded-full border-2 border-violet border-t-transparent animate-spin" />
                    <span className="text-sm">Loading template…</span>
                  </div>
                ) : template ? (
                  <TemplateCard
                    template={template}
                    onEdit={startEdit}
                    onDelete={() => setTemplateView('delete-confirm')}
                  />
                ) : (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-violet/10 text-violet-light mb-4">
                      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium mb-1">No template yet</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mb-5">
                      Upload your LaTeX CV once and Fitex will tailor it to every job you apply to.
                    </p>
                    <button
                      onClick={() => { setTemplateView('add'); setAddTex(''); setAddFilename(''); setTemplateError(''); }}
                      className="inline-flex items-center gap-2 text-sm font-semibold bg-violet hover:bg-violet-dark text-white px-5 py-2.5 rounded-lg glow-violet transition-all duration-300 hover:scale-[1.02]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Upload template
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Add / Replace template ── */}
            {templateView === 'add' && (
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{template ? 'Replace template' : 'Upload template'}</h3>
                  <button onClick={() => setTemplateView('idle')} className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <LatexDropzoneInline
                  onFile={(tex, fname) => { setAddTex(tex); setAddFilename(fname); }}
                />

                {addTex && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-medium block mb-1.5">Filename</label>
                      <input
                        type="text"
                        value={addFilename}
                        onChange={(e) => setAddFilename(e.target.value)}
                        placeholder="my-cv.tex"
                        className="w-full rounded-lg bg-surface border border-border/40 focus:border-violet/60 outline-none px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors duration-200"
                      />
                    </div>
                    <pre className="rounded-lg bg-surface p-3 text-xs font-mono text-muted-foreground/70 overflow-auto max-h-32 border border-border/30 whitespace-pre-wrap">
                      {addTex.slice(0, 300)}{addTex.length > 300 ? '\n…' : ''}
                    </pre>
                    {templateError && <p className="text-xs text-destructive">{templateError}</p>}
                    <button
                      onClick={saveAdd}
                      disabled={saving}
                      className="w-full rounded-xl bg-violet py-3 text-sm font-semibold text-white glow-violet transition-all duration-300 hover:bg-violet-dark hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving…' : 'Save template →'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Edit template ── */}
            {templateView === 'edit' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Edit template</h3>
                  <button onClick={() => setTemplateView('idle')} className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">Filename</label>
                  <input
                    type="text"
                    value={editFilename}
                    onChange={(e) => setEditFilename(e.target.value)}
                    placeholder="my-cv.tex"
                    className="w-full rounded-lg bg-surface border border-border/40 focus:border-violet/60 outline-none px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">LaTeX source</label>
                  <textarea
                    value={editTex}
                    onChange={(e) => setEditTex(e.target.value)}
                    rows={14}
                    spellCheck={false}
                    className="w-full rounded-lg bg-surface border border-border/40 focus:border-violet/60 outline-none px-3 py-2.5 text-xs font-mono text-foreground/90 resize-y transition-colors duration-200"
                  />
                </div>

                {templateError && <p className="text-xs text-destructive">{templateError}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => setTemplateView('idle')}
                    className="flex-1 rounded-lg border border-border/40 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-border/70 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving || !editTex.trim()}
                    className="flex-1 rounded-lg bg-violet py-2.5 text-sm font-semibold text-white hover:bg-violet-dark transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Delete confirmation ── */}
            {templateView === 'delete-confirm' && (
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-500/10 text-red-400 shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Delete template?</h3>
                    <p className="text-sm text-muted-foreground">
                      This will remove your CV template. Fitex won't be able to generate tailored CVs until you upload a new one.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTemplateView('idle')}
                    className="flex-1 rounded-lg border border-border/40 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-border/70 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 rounded-lg bg-red-500/80 hover:bg-red-500 py-2.5 text-sm font-semibold text-white transition-all duration-200"
                  >
                    Delete template
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Section divider ── */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />

        {/* ── Section: Security ── */}
        <section id="security">
          <div className="mb-6">
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/60 mb-1.5">Account</p>
            <h2 className="text-xl font-display font-bold tracking-tight">Security</h2>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-emerald/10 text-emerald shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Two-factor authentication</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security to your account using an authenticator app.</p>
                </div>
              </div>

              {!totpURI && !showPasswordPrompt && (
                <button
                  onClick={() => setShowPasswordPrompt(true)}
                  className="inline-flex items-center gap-2 text-sm font-medium bg-emerald/10 hover:bg-emerald/20 text-emerald border border-emerald/20 hover:border-emerald/40 px-4 py-2.5 rounded-lg transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m-8-8h16" strokeLinecap="round" />
                  </svg>
                  Enable 2FA
                </button>
              )}

              {showPasswordPrompt && !totpURI && (
                <form onSubmit={handleEnable2FA} className="flex flex-col gap-3 max-w-sm">
                  <div>
                    <Label htmlFor="twofa-password" className="text-xs text-muted-foreground">Confirm your password</Label>
                    <Input
                      id="twofa-password"
                      type="password"
                      placeholder="Your account password"
                      value={twoFAPassword}
                      onChange={(e) => setTwoFAPassword(e.target.value)}
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <Button type="submit" className="bg-violet hover:bg-violet-dark text-white w-fit">
                    Continue
                  </Button>
                </form>
              )}

              {totpURI && (
                <div className="space-y-4 max-w-sm">
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code with your authenticator app, then enter the 6-digit code below:
                  </p>
                  <code className="block break-all rounded-lg bg-surface p-3 text-xs font-mono text-muted-foreground/70 border border-border/30">
                    {totpURI}
                  </code>
                  <form onSubmit={handleVerify2FA} className="flex flex-col gap-3">
                    <div>
                      <Label htmlFor="verify-code" className="text-xs text-muted-foreground">Verification code</Label>
                      <Input
                        id="verify-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="000000"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        required
                        className="mt-1.5 font-mono tracking-widest text-center"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={verifyCode.length !== 6}
                      className="bg-violet hover:bg-violet-dark text-white w-fit"
                    >
                      Verify & activate
                    </Button>
                  </form>
                </div>
              )}

              {twoFAStatus && (
                <p className={`text-sm mt-3 ${twoFAStatus.includes('successfully') ? 'text-emerald' : 'text-muted-foreground'}`}>
                  {twoFAStatus}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="pb-6 pt-2 text-center">
          <p className="text-xs text-muted-foreground/50">
            Fitex · <a href="mailto:hello@fitex.app" className="hover:text-muted-foreground transition-colors">hello@fitex.app</a>
          </p>
        </footer>

      </main>
    </div>
  );
}
