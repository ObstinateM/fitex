'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut, twoFactor } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FitexLogo } from '@/components/landing/logo';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { toast } from '@/components/ui/sonner';
import { ImageManager } from '@/components/image-manager';
import {
  useTemplate,
  usePdfUsage,
  useCreditBalance,
  useSaveTemplate,
  useCompilePdf,
  useConvertPdf,
  type CvTemplate,
  type PdfUsage,
} from '@/lib/queries';

// ─── PDF cache ────────────────────────────────────────────────────────────────
// Two-layer cache: in-memory Map (fast, same JS lifetime) + sessionStorage
// (survives page reloads within the same tab).
// Key = templateId:updatedAt so stale versions are never reused.

const PDF_MEM_CACHE = new Map<string, string>(); // key → blob URL
const PDF_SESSION_KEY = 'fitex:pdf-cache';       // sessionStorage entry

function pdfCacheKey(t: { id: string; updatedAt: string }) {
  return `${t.id}:${t.updatedAt}`;
}

function base64ToBlobUrl(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
}

function loadPdfFromSession(key: string): string | null {
  try {
    const raw = sessionStorage.getItem(PDF_SESSION_KEY);
    if (!raw) return null;
    const { key: k, b64 } = JSON.parse(raw) as { key: string; b64: string };
    if (k !== key) return null;
    return base64ToBlobUrl(b64);
  } catch { return null; }
}

function savePdfToSession(key: string, blob: Blob) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const b64 = (reader.result as string).split(',')[1];
      sessionStorage.setItem(PDF_SESSION_KEY, JSON.stringify({ key, b64 }));
    } catch { /* quota exceeded — skip */ }
  };
  reader.readAsDataURL(blob);
}

type TemplateView = 'idle' | 'add';

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
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none ${accent === 'violet' ? 'bg-violet/3' : 'bg-emerald/3'}`} />
      <span className="relative text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground/70">{label}</span>
      <div className="relative flex items-end gap-2">
        <span className={`text-4xl font-display font-bold tracking-tight ${accent === 'violet' ? 'text-gradient' : 'text-emerald'}`}>
          {value}
        </span>
        {sub && <span className="text-sm text-muted-foreground mb-1">{sub}</span>}
      </div>
      <div className="relative">{children}</div>
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

// ─── .tex file dropzone (inline) ─────────────────────────────────────────────

function TexDropzoneInline({ onFile }: { onFile: (tex: string, filename: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => onFile(e.target?.result as string, file.name);
    reader.readAsText(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.tex')) readFile(file);
    else toast.error('Please drop a .tex file.');
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

// ─── PDF import (inline) ──────────────────────────────────────────────────────

function PdfImportInline({
  onConverted,
  usage,
}: {
  onConverted: (tex: string, filename: string) => void;
  usage: PdfUsage | null;
}) {
  const [dragging, setDragging] = useState(false);
  const [tex, setTex] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const convertMutation = useConvertPdf();

  const loading = convertMutation.isPending;
  const atLimit = usage !== null && usage.used >= usage.limit;
  const remaining = usage ? Math.max(0, usage.limit - usage.used) : null;

  async function convert(file: File) {
    setTex(null);
    try {
      const data = await convertMutation.mutateAsync(file);
      setTex(data.tex);
      const baseName = file.name.replace(/\.pdf$/i, '') + '.tex';
      onConverted(data.tex, baseName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Network error. Please try again.');
    }
  }

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be smaller than 10 MB.');
      return;
    }
    setCurrentFile(file);
    await convert(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-3">
        <div className="h-5 w-5 rounded-full border-2 border-violet/20 border-t-violet animate-spin" />
        <p className="text-sm text-muted-foreground">Extracting your CV…</p>
      </div>
    );
  }

  if (tex) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-emerald flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Extracted successfully
        </p>
        <button
          onClick={() => currentFile && convert(currentFile)}
          className="text-xs text-muted-foreground hover:text-foreground underline transition-colors cursor-pointer"
        >
          Retry extraction
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Usage badge */}
      {usage && (
        <div className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 border ${
          atLimit
            ? 'border-red-500/20 bg-red-500/5 text-red-400'
            : 'border-border/30 bg-surface/60 text-muted-foreground'
        }`}>
          <span>PDF imports</span>
          <span className={atLimit ? 'text-red-400 font-medium' : 'font-medium'}>
            {usage.used} / {usage.limit} this month
            {remaining !== null && remaining > 0 && (
              <span className="text-muted-foreground font-normal"> — {remaining} left</span>
            )}
          </span>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); if (!atLimit) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { if (!atLimit) onDrop(e); else e.preventDefault(); }}
        onClick={() => !atLimit && inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          atLimit
            ? 'border-border/20 opacity-50 cursor-not-allowed'
            : dragging
            ? 'border-violet bg-violet/5 cursor-pointer'
            : 'border-border/40 hover:border-violet/50 hover:bg-violet/3 cursor-pointer'
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={onChange} className="hidden" disabled={atLimit} />
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-violet/10 text-violet-light mb-3 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 13h6m-3-3v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {atLimit ? (
          <>
            <p className="text-sm font-medium text-foreground/60">Limit reached for this month</p>
            <p className="text-xs text-muted-foreground mt-1">Try again next month.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground/80">Drop your <span className="text-violet-light">PDF</span> here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse — max 10 MB</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Template card (PDF preview) ─────────────────────────────────────────────

function TemplateCard({
  template,
  pdfBlobUrl,
  pdfGenerating,
  pdfError,
  onReplace,
  onRetry,
}: {
  template: CvTemplate;
  pdfBlobUrl: string | null;
  pdfGenerating: boolean;
  pdfError: string;
  onReplace: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30 bg-surface-raised/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet/10 text-violet-light shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground leading-tight">{template.filename ?? 'cv-template.tex'}</p>
            <p className="text-xs text-muted-foreground">Updated {timeAgo(template.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReplace}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-light/80 hover:text-violet-light px-3 py-1.5 rounded-lg hover:bg-violet/10 border border-violet/20 hover:border-violet/40 transition-all duration-200 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Replace
          </button>
          {pdfBlobUrl && (
            <a
              href={pdfBlobUrl}
              download="cv.pdf"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/50 border border-border/30 hover:border-border/60 transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download
            </a>
          )}
        </div>
      </div>

      {/* PDF body */}
      {pdfGenerating ? (
        <div className="relative h-[700px] overflow-hidden bg-surface/20">
          {/* Skeleton lines mimicking a document */}
          <div className="absolute inset-0 p-10 flex flex-col gap-4">
            <div className="h-5 w-2/5 rounded-md bg-border/30 animate-pulse" />
            <div className="h-3 w-1/3 rounded-md bg-border/20 animate-pulse" style={{ animationDelay: '80ms' }} />
            <div className="mt-4 h-px w-full bg-border/20" />
            {[1, 0.9, 0.95, 0.7, 1, 0.85, 0.6].map((w, i) => (
              <div
                key={i}
                className="h-2.5 rounded-md bg-border/20 animate-pulse"
                style={{ width: `${w * 100}%`, animationDelay: `${(i + 2) * 80}ms` }}
              />
            ))}
            <div className="mt-2 h-px w-full bg-border/20" />
            <div className="h-3 w-1/4 rounded-md bg-border/25 animate-pulse" style={{ animationDelay: '720ms' }} />
            {[0.8, 1, 0.75, 0.9].map((w, i) => (
              <div
                key={i}
                className="h-2.5 rounded-md bg-border/20 animate-pulse"
                style={{ width: `${w * 100}%`, animationDelay: `${(i + 10) * 80}ms` }}
              />
            ))}
            <div className="mt-2 h-px w-full bg-border/20" />
            <div className="h-3 w-1/3 rounded-md bg-border/25 animate-pulse" style={{ animationDelay: '1120ms' }} />
            {[0.95, 0.7, 1, 0.6].map((w, i) => (
              <div
                key={i}
                className="h-2.5 rounded-md bg-border/20 animate-pulse"
                style={{ width: `${w * 100}%`, animationDelay: `${(i + 15) * 80}ms` }}
              />
            ))}
          </div>
          {/* Fade overlay + label */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-violet/30 border-t-violet animate-spin" />
            <p className="text-xs text-muted-foreground/70">Loading your CV…</p>
          </div>
        </div>
      ) : pdfError ? (
        <div className="flex flex-col items-center justify-center h-[700px] gap-4 bg-surface/20">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-destructive/10 text-destructive">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center max-w-xs">
            <p className="text-sm text-foreground/80 font-medium mb-1">Compilation failed</p>
            <p className="text-xs text-muted-foreground mb-4">{pdfError}</p>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-light px-4 py-2 rounded-lg bg-violet/10 hover:bg-violet/20 border border-violet/20 transition-all duration-200 cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      ) : pdfBlobUrl ? (
        <iframe
          src={`${pdfBlobUrl}#toolbar=0`}
          className="w-full h-[700px]"
          title="CV Preview"
        />
      ) : (
        <div className="relative h-[700px] overflow-hidden bg-surface/20">
          <div className="absolute inset-0 p-10 flex flex-col gap-4">
            {[0.4, 0.25, null, 1, 0.9, 0.95, 0.7, null, 0.3, 0.8, 1, 0.75].map((w, i) =>
              w === null ? (
                <div key={i} className="h-px w-full bg-border/20" />
              ) : (
                <div key={i} className="h-2.5 rounded-md bg-border/20 animate-pulse" style={{ width: `${w * 100}%`, animationDelay: `${i * 60}ms` }} />
              )
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-violet/30 border-t-violet animate-spin" />
            <p className="text-xs text-muted-foreground/70">Loading your CV…</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // TanStack Query hooks
  const templateQuery = useTemplate(!!session);
  const pdfUsageQuery = usePdfUsage(!!session);
  const creditBalanceQuery = useCreditBalance(!!session);
  const saveTemplateMutation = useSaveTemplate();
  const compilePdfMutation = useCompilePdf();

  const template = templateQuery.data ?? null;
  const templateLoading = templateQuery.isLoading;
  const pdfUsage = pdfUsageQuery.data ?? null;
  const creditBalance = creditBalanceQuery.data ?? null;

  // Template add/replace UI state
  const [templateView, setTemplateView] = useState<TemplateView>('idle');
  const [addTex, setAddTex] = useState('');
  const [addFilename, setAddFilename] = useState('');
  const [addTab, setAddTab] = useState<'pdf' | 'tex'>('pdf');
  const [templateError, setTemplateError] = useState('');

  // PDF generation state
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState('');

  // Prevents re-triggering auto-compile on the same template load
  const autoCompileRef = useRef(false);

  // 2FA state
  const [totpURI, setTotpURI] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [twoFAPassword, setTwoFAPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showDisablePrompt, setShowDisablePrompt] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');

  // User settings panel
  const [showUserSettings, setShowUserSettings] = useState(false);

  // Derived state
  const pdfGenerating = compilePdfMutation.isPending;
  const saving = saveTemplateMutation.isPending;

  // Auth redirect
  useEffect(() => {
    if (!isPending && !session) router.push('/login');
  }, [isPending, session, router]);

  // ── PDF generation ─────────────────────────────────────────────────────────

  async function generatePdf(templateToCache?: CvTemplate) {
    setPdfError('');
    setPdfBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    try {
      const blob = await compilePdfMutation.mutateAsync();
      const url = URL.createObjectURL(blob);
      if (templateToCache) {
        const key = pdfCacheKey(templateToCache);
        PDF_MEM_CACHE.set(key, url);
        savePdfToSession(key, blob);
      }
      setPdfBlobUrl(url);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Network error. Please try again.');
    }
  }

  // Auto-compile when template first loads (serves from cache when available)
  useEffect(() => {
    if (!template || pdfBlobUrl || pdfGenerating || autoCompileRef.current) return;
    autoCompileRef.current = true;
    const key = pdfCacheKey(template);
    // 1. In-memory cache (same JS lifetime)
    const memHit = PDF_MEM_CACHE.get(key);
    if (memHit) { setPdfBlobUrl(memHit); return; }
    // 2. sessionStorage (survives page reloads)
    const sessionHit = loadPdfFromSession(key);
    if (sessionHit) { PDF_MEM_CACHE.set(key, sessionHit); setPdfBlobUrl(sessionHit); return; }
    // 3. Compile fresh
    generatePdf(template);
  }, [template]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Template handlers ──────────────────────────────────────────────────────

  async function saveAdd() {
    if (!addTex.trim()) return;
    setTemplateError('');
    try {
      await saveTemplateMutation.mutateAsync({ tex: addTex, filename: addFilename || undefined });

      // Bust both cache layers so the new template always compiles fresh
      PDF_MEM_CACHE.clear();
      try { sessionStorage.removeItem(PDF_SESSION_KEY); } catch { /* ignore */ }
      setPdfBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
      setPdfError('');

      // Mark ref as handled so the auto-compile effect doesn't double-fire
      autoCompileRef.current = true;
      // Wait for the template query to refetch
      const result = await templateQuery.refetch();
      setTemplateView('idle');
      setAddTex('');
      setAddFilename('');

      // Explicitly recompile with the fresh template
      if (result.data) generatePdf(result.data);
    } catch {
      setTemplateError('Network error. Please try again.');
    }
  }

  function openAdd() {
    setTemplateView('add');
    setAddTex('');
    setAddFilename('');
    setAddTab('pdf');
    setTemplateError('');
    pdfUsageQuery.refetch();
  }

  // ── 2FA handlers ──────────────────────────────────────────────────────────

  async function handleEnable2FA(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await twoFactor.enable({ password: twoFAPassword });
    if (error) { toast.error(error.message ?? 'Failed to enable 2FA'); return; }
    if (data?.totpURI) { setTotpURI(data.totpURI); setShowPasswordPrompt(false); setTwoFAPassword(''); }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await twoFactor.verifyTotp({ code: verifyCode });
    if (error) { toast.error(error.message ?? 'Invalid code'); return; }
    toast.success('2FA enabled successfully');
    setTotpURI(''); setVerifyCode('');
  }

  async function handleDisable2FA(e: React.FormEvent) {
    e.preventDefault();
    const { error: verifyError } = await twoFactor.verifyTotp({ code: disableCode });
    if (verifyError) { toast.error('Invalid authenticator code'); return; }
    const { error: disableError } = await twoFactor.disable({ password: disablePassword });
    if (disableError) { toast.error(disableError.message ?? 'Failed to disable 2FA'); return; }
    toast.success('2FA disabled successfully');
    setShowDisablePrompt(false);
    setDisableCode('');
    setDisablePassword('');
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
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer" aria-label="Fitex home">
            <FitexLogo className="h-8 w-8" />
            <span className="text-base font-semibold tracking-tight">Fitex</span>
          </Link>

          <div className="flex items-center gap-3">
            {process.env.NODE_ENV === 'development' && (
              <Link
                href="/debug"
                className="text-sm text-amber-500/70 hover:text-amber-500 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer"
              >
                Debug
              </Link>
            )}
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5 border border-border/30">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">{creditBalance?.isUnlimited ? 'Unlimited' : `${creditBalance?.balance ?? '—'} credits`}</span>
            </div>
            {/* User settings button */}
            <div className="relative">
              <button
                onClick={() => setShowUserSettings((v) => !v)}
                aria-label="User settings"
                className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-200 cursor-pointer ${showUserSettings ? 'border-violet/50 bg-violet/10 text-violet-light' : 'border-border/40 bg-muted/30 text-muted-foreground hover:border-border/60 hover:bg-muted/50 hover:text-foreground'}`}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Settings dropdown */}
              {showUserSettings && (
                <>
                  {/* Click-away backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserSettings(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-border/30">
                      <p className="text-xs font-mono tracking-[0.2em] uppercase text-violet-light/60 mb-0.5">Account</p>
                      <p className="text-sm font-medium text-foreground truncate">{session.user.email}</p>
                    </div>

                    {/* 2FA section */}
                    <div className="px-5 py-4 border-b border-border/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-emerald/10 text-emerald shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">Two-factor authentication</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Secure your account with an authenticator app.</p>
                        </div>
                      </div>

                      {/* Enabled state */}
                      {session.user.twoFactorEnabled && !showDisablePrompt && !totpURI && !showPasswordPrompt && (
                        <div className="flex flex-col gap-3">
                          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-emerald bg-emerald/10 border border-emerald/20 px-3 py-1.5 rounded-full w-fit">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                            Active
                          </div>
                          <button
                            onClick={() => setShowDisablePrompt(true)}
                            className="inline-flex items-center gap-2 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 hover:border-destructive/40 px-3 py-2 rounded-lg transition-all duration-200 w-fit cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                              <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" />
                            </svg>
                            Disable 2FA
                          </button>
                        </div>
                      )}

                      {/* Disable confirmation form */}
                      {session.user.twoFactorEnabled && showDisablePrompt && (
                        <form onSubmit={handleDisable2FA} className="flex flex-col gap-3">
                          <p className="text-xs text-muted-foreground">Enter your authenticator code and password to confirm.</p>
                          <div>
                            <Label htmlFor="disable-code" className="text-xs text-muted-foreground">Authenticator code</Label>
                            <Input id="disable-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} required className="mt-1 font-mono tracking-widest text-center text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="disable-password" className="text-xs text-muted-foreground">Password</Label>
                            <Input id="disable-password" type="password" placeholder="Your account password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} required className="mt-1 text-sm" />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={disableCode.length !== 6 || !disablePassword} className="bg-destructive hover:bg-destructive/90 text-white text-xs h-8 px-3">Confirm disable</Button>
                            <Button type="button" variant="ghost" onClick={() => { setShowDisablePrompt(false); setDisableCode(''); setDisablePassword(''); }} className="text-xs h-8 px-3">Cancel</Button>
                          </div>
                        </form>
                      )}

                      {/* Not enabled state */}
                      {!session.user.twoFactorEnabled && !totpURI && !showPasswordPrompt && (
                        <button
                          onClick={() => setShowPasswordPrompt(true)}
                          className="inline-flex items-center gap-2 text-xs font-medium bg-emerald/10 hover:bg-emerald/20 text-emerald border border-emerald/20 hover:border-emerald/40 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
                            <path d="M12 4v16m-8-8h16" strokeLinecap="round" />
                          </svg>
                          Enable 2FA
                        </button>
                      )}

                      {showPasswordPrompt && !totpURI && (
                        <form onSubmit={handleEnable2FA} className="flex flex-col gap-3">
                          <div>
                            <Label htmlFor="twofa-password" className="text-xs text-muted-foreground">Confirm your password</Label>
                            <Input id="twofa-password" type="password" placeholder="Your account password" value={twoFAPassword} onChange={(e) => setTwoFAPassword(e.target.value)} required className="mt-1 text-sm" />
                          </div>
                          <Button type="submit" className="bg-violet hover:bg-violet-dark text-white text-xs h-8 px-3 w-fit">Continue</Button>
                        </form>
                      )}

                      {totpURI && (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">Scan this QR code with your authenticator app, then enter the 6-digit code below.</p>
                          <div className="flex justify-center rounded-xl bg-white p-3 border border-border/30 w-fit">
                            <QRCodeSVG value={totpURI} size={160} />
                          </div>
                          <form onSubmit={handleVerify2FA} className="flex flex-col gap-3">
                            <div>
                              <Label htmlFor="verify-code" className="text-xs text-muted-foreground">Verification code</Label>
                              <Input id="verify-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} required className="mt-1 font-mono tracking-widest text-center text-sm" />
                            </div>
                            <Button type="submit" disabled={verifyCode.length !== 6} className="bg-violet hover:bg-violet-dark text-white text-xs h-8 px-3 w-fit">Verify & activate</Button>
                          </form>
                        </div>
                      )}
                    </div>

                    {/* Sign out */}
                    <div className="px-5 py-3">
                      <button
                        onClick={async () => { await signOut({ fetchOptions: {} }); router.push('/login'); }}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 w-full py-1.5 rounded-lg hover:bg-muted/50 px-2 -mx-2 cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.5">
                          <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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

          <StatCard label="Credits remaining" value={creditBalance?.isUnlimited ? '∞' : (creditBalance?.balance ?? '—')} accent="violet">
            {!creditBalance?.isUnlimited && creditBalance && (
              <CreditBar used={0} total={creditBalance.balance} />
            )}
            <Link href="/settings/billing" className="text-xs text-violet-light/70 hover:text-violet-light transition-colors duration-200 flex items-center gap-1 w-fit cursor-pointer">
              {creditBalance?.isUnlimited ? 'Manage subscription' : 'Get more credits'}
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </StatCard>
        </section>

        {/* ── Section divider ── */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />

        {/* ── Section: CV Templates ── */}
        <section id="templates">
          <div className="mb-6">
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/60 mb-1.5">CV Templates</p>
            <h2 className="text-xl font-display font-bold tracking-tight">Your CV template</h2>
            <p className="text-sm text-muted-foreground mt-1">Fitex tailors your CV to each job using this template.</p>
          </div>

          {/* ── Idle: show template or empty state ── */}
          {templateView === 'idle' && (
            <>
              {templateLoading ? (
                <div className="flex items-center gap-3 text-muted-foreground py-4">
                  <div className="h-4 w-4 rounded-full border-2 border-violet border-t-transparent animate-spin" />
                  <span className="text-sm">Loading template…</span>
                </div>
              ) : template ? (
                <TemplateCard
                  template={template}
                  pdfBlobUrl={pdfBlobUrl}
                  pdfGenerating={pdfGenerating}
                  pdfError={pdfError}
                  onReplace={openAdd}
                  onRetry={() => generatePdf(template)}
                />
              ) : (
                /* Empty state */
                <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-violet/10 text-violet-light mb-4">
                      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium mb-1">No template yet</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mb-5">
                      Upload your CV once and Fitex will tailor it to every job you apply to.
                    </p>
                    <button
                      onClick={openAdd}
                      className="inline-flex items-center gap-2 text-sm font-semibold bg-violet hover:bg-violet-dark text-white px-5 py-2.5 rounded-lg glow-violet transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Upload template
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Add / Replace template ── */}
          {templateView === 'add' && (
            <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{template ? 'Replace template' : 'Upload template'}</h3>
                  <button onClick={() => setTemplateView('idle')} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 rounded-lg bg-surface p-1 border border-border/30">
                  <button
                    onClick={() => { setAddTab('pdf'); setAddTex(''); setAddFilename(''); }}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                      addTab === 'pdf'
                        ? 'bg-violet/15 text-violet-light border border-violet/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Import from PDF
                  </button>
                  <button
                    onClick={() => { setAddTab('tex'); setAddTex(''); setAddFilename(''); }}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                      addTab === 'tex'
                        ? 'bg-violet/15 text-violet-light border border-violet/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Upload .tex file
                  </button>
                </div>

                {addTab === 'pdf' && (
                  <PdfImportInline
                    usage={pdfUsage}
                    onConverted={(tex, fname) => { setAddTex(tex); setAddFilename(fname); }}
                  />
                )}

                {addTab === 'tex' && (
                  <TexDropzoneInline
                    onFile={(tex, fname) => { setAddTex(tex); setAddFilename(fname); }}
                  />
                )}

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
                    {templateError && <p className="text-xs text-destructive">{templateError}</p>}
                    <button
                      onClick={saveAdd}
                      disabled={saving}
                      className="w-full rounded-xl bg-violet py-3 text-sm font-semibold text-white glow-violet transition-all duration-300 hover:bg-violet-dark hover:scale-[1.01] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving…' : 'Save template →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Section divider ── */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />

        {/* ── Section: CV Images ── */}
        <section id="images">
          <ImageManager
            onImagesChange={() => {
              if (template) {
                // Bust cache & recompile with updated images
                PDF_MEM_CACHE.clear();
                try { sessionStorage.removeItem(PDF_SESSION_KEY); } catch { /* ignore */ }
                setPdfBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
                setPdfError('');
                generatePdf(template);
              }
            }}
          />
        </section>

        {/* ── Footer ── */}
        <footer className="pb-6 pt-2 text-center">
          <p className="text-xs text-muted-foreground/50">
            Fitex · <a href="mailto:hello@fitex.app" className="hover:text-muted-foreground transition-colors cursor-pointer">hello@fitex.app</a>
          </p>
        </footer>

      </main>
    </div>
  );
}
