'use client';

import { useState, useMemo } from 'react';
import {
  useStories,
  useAddStory,
  useUpdateStory,
  useDeleteStory,
  useEnhanceStory,
  useParseImport,
  useBulkImportStories,
  type Story,
} from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedStory {
  title: string;
  description: string;
  tags: string[];
}

interface SimilarityWarning {
  existingTitle: string;
}

// ─── Custom Checkbox ────────────────────────────────────────────────────────

function Checkbox({
  checked,
  onChange,
  className = '',
}: {
  checked: boolean;
  onChange: () => void;
  className?: string;
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
      } ${className}`}
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

// ─── Styled Input ───────────────────────────────────────────────────────────

function StyledInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`h-10 w-full rounded-xl border border-border/40 bg-surface-raised/30 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet/30 focus:bg-surface-raised/50 transition-all duration-300 ${className}`}
    />
  );
}

// ─── Styled Textarea ────────────────────────────────────────────────────────

function StyledTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      className="w-full rounded-xl border border-border/40 bg-surface-raised/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet/30 focus:bg-surface-raised/50 transition-all duration-300 resize-none leading-relaxed"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

// ─── Duplicate detection ─────────────────────────────────────────────────────

function findDuplicate(
  title: string,
  tags: string[],
  existing: Story[],
): string | null {
  const pTitle = title.toLowerCase();
  const pTags = new Set(tags.map((t) => t.toLowerCase()));

  for (const ex of existing) {
    const exTitle = ex.title.toLowerCase();

    const shorter = pTitle.length < exTitle.length ? pTitle : exTitle;
    const longer = pTitle.length < exTitle.length ? exTitle : pTitle;
    if (shorter.length > 0 && longer.includes(shorter)) {
      if (shorter.length / longer.length > 0.5) return ex.title;
    }

    const exTags = new Set(ex.tags.map((t) => t.toLowerCase()));
    if (pTags.size > 0 && exTags.size > 0) {
      let intersection = 0;
      for (const t of pTags) {
        if (exTags.has(t)) intersection++;
      }
      const union = new Set([...pTags, ...exTags]).size;
      if (union > 0 && intersection / union > 0.6) return ex.title;
    }
  }

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type ImportPhase = 'idle' | 'input' | 'review' | 'success';

export default function StoriesPage() {
  // ─── TanStack Query ───────────────────────────────────────────────────────
  const { data: stories = [], isPending: loading } = useStories();
  const addMutation = useAddStory();
  const updateMutation = useUpdateStory();
  const deleteMutation = useDeleteStory();
  const enhanceMutation = useEnhanceStory();
  const parseMutation = useParseImport();
  const bulkImportMutation = useBulkImportStories();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');

  // Expand / Edit / Delete
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Derive loading indicators from mutation state
  const enhancingNew = enhanceMutation.isPending && editingId === null;
  const enhancingId = enhanceMutation.isPending && editingId !== null ? editingId : null;

  // Import
  const [importPhase, setImportPhase] = useState<ImportPhase>('idle');
  const [importText, setImportText] = useState('');
  const [parsedStories, setParsedStories] = useState<ParsedStory[]>([]);
  const [importChecked, setImportChecked] = useState<Set<number>>(new Set());
  const [importWarnings, setImportWarnings] = useState<
    Map<number, SimilarityWarning>
  >(new Map());

  const parsing = parseMutation.isPending;

  // ─── Derived state ───────────────────────────────────────────────────────

  const filteredStories = useMemo(() => {
    let result = stories;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (selectedTags.size > 0) {
      result = result.filter((s) =>
        Array.from(selectedTags).every((t) => s.tags.includes(t)),
      );
    }
    return result;
  }, [stories, searchQuery, selectedTags]);

  // Tags that would still yield results if added to the current selection
  const availableTags = useMemo(() => {
    // Start from stories already matching search + current tag selection
    const candidatePool = filteredStories;

    // Collect tags present in the current results, sorted by frequency
    const tagCounts = new Map<string, number>();
    candidatePool.forEach((s) =>
      s.tags.forEach((t) => {
        if (!selectedTags.has(t)) {
          tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
        }
      }),
    );

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [filteredStories, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────

  async function addStory() {
    if (!newTitle.trim()) return;
    try {
      await addMutation.mutateAsync({
        title: newTitle.trim(),
        description: newDescription.trim(),
        tags: parseTags(newTags),
      });
      setNewTitle('');
      setNewDescription('');
      setNewTags('');
      setShowAdd(false);
    } catch {
      toast.error('Failed to add story');
    }
  }

  async function saveEdit(id: string) {
    try {
      await updateMutation.mutateAsync({
        id,
        title: editTitle.trim(),
        description: editDescription.trim(),
        tags: parseTags(editTags),
      });
      setEditingId(null);
    } catch {
      toast.error('Failed to update story');
    }
  }

  async function deleteStory(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      setDeletingId(null);
    } catch {
      toast.error('Failed to delete story');
    }
  }

  // ─── Enhance ─────────────────────────────────────────────────────────────

  async function enhanceNew() {
    if (!newDescription.trim()) return;
    try {
      const data = await enhanceMutation.mutateAsync({
        title: newTitle,
        description: newDescription,
      });
      setNewDescription(data.description);
      setNewTags(data.tags.join(', '));
    } catch {
      toast.error('Enhancement failed. Please try again.');
    }
  }

  async function enhanceEdit(id: string) {
    if (!editDescription.trim()) return;
    try {
      const data = await enhanceMutation.mutateAsync({
        title: editTitle,
        description: editDescription,
      });
      setEditDescription(data.description);
      setEditTags(data.tags.join(', '));
    } catch {
      toast.error('Enhancement failed. Please try again.');
    }
  }

  // ─── Import ──────────────────────────────────────────────────────────────

  async function parseImport() {
    if (!importText.trim()) return;
    try {
      const parsed = await parseMutation.mutateAsync(importText);
      if (!parsed.length) {
        toast.warning('No stories could be parsed from the text. Try providing more detail about your experiences.');
        return;
      }
      setParsedStories(parsed);
      setImportChecked(new Set(parsed.map((_, i) => i)));

      const warnings = new Map<number, SimilarityWarning>();
      parsed.forEach((p, i) => {
        const dup = findDuplicate(p.title, p.tags, stories);
        if (dup) warnings.set(i, { existingTitle: dup });
      });
      setImportWarnings(warnings);
      setImportPhase('review');
    } catch {
      toast.error('Failed to parse text. Please try again.');
    }
  }

  async function doImport() {
    const selected = parsedStories.filter((_, i) => importChecked.has(i));
    if (!selected.length) return;
    try {
      await bulkImportMutation.mutateAsync(selected);
      setImportPhase('success');
      setTimeout(() => {
        setImportPhase('idle');
        setImportText('');
        setParsedStories([]);
        setImportChecked(new Set());
        setImportWarnings(new Map());
      }, 1200);
    } catch {
      toast.error('Failed to import stories.');
    }
  }

  function toggleImportCheck(idx: number) {
    setImportChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function updateParsedStory(idx: number, field: keyof ParsedStory, value: string | string[]) {
    setParsedStories((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  }

  function startEdit(s: Story) {
    setEditingId(s.id);
    setEditTitle(s.title);
    setEditDescription(s.description);
    setEditTags(s.tags.join(', '));
    setExpandedId(s.id);
  }

  function resetImport() {
    setImportPhase('idle');
    setImportText('');
    setParsedStories([]);
    setImportChecked(new Set());
    setImportWarnings(new Map());
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet" />
      </div>
    );
  }

  // ─── Import flow ─────────────────────────────────────────────────────────

  if (importPhase !== 'idle') {
    return (
      <div className="noise-overlay min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
                Import Stories
              </h1>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {importPhase === 'input'
                  ? 'Paste your experience and let AI do the rest'
                  : importPhase === 'review'
                    ? 'Review and refine before importing'
                    : ''}
              </p>
            </div>
            {importPhase !== 'success' && (
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                onClick={resetImport}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Progress indicator */}
          {importPhase !== 'success' && (
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <div
                  className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                    importPhase === 'input' ? 'bg-violet' : 'bg-violet/30'
                  }`}
                />
                <div
                  className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                    importPhase === 'review' ? 'bg-violet' : 'bg-violet/20'
                  }`}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground/50 tracking-wider">
                {importPhase === 'input' ? '1/2' : '2/2'}
              </span>
            </div>
          )}

          {/* Phase 1: Input */}
          {importPhase === 'input' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded-md bg-violet/10 flex items-center justify-center">
                    <svg className="w-3 h-3 text-violet-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <span className="text-xs font-mono tracking-wider text-muted-foreground/60 uppercase">
                    Source text
                  </span>
                </div>
                <StyledTextarea
                  rows={12}
                  placeholder="Paste your resume, LinkedIn summary, career notes, or any text describing your professional experiences..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>
              <Button
                onClick={parseImport}
                disabled={!importText.trim() || parsing}
                className="w-full h-11 rounded-xl bg-violet hover:bg-violet-dark transition-all duration-300 glow-violet"
              >
                {parsing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Parsing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                    Parse with AI
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Phase 2: Review */}
          {importPhase === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-gradient font-bold">{parsedStories.length}</span>{' '}
                  {parsedStories.length === 1 ? 'story' : 'stories'} found
                </p>
                <button
                  className="text-sm text-violet-light hover:text-violet transition-colors duration-200"
                  onClick={() => setImportPhase('input')}
                >
                  Start Over
                </button>
              </div>

              <div className="space-y-3">
                {parsedStories.map((ps, idx) => (
                  <div
                    key={idx}
                    className={`group rounded-2xl border bg-card/30 backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                      !importChecked.has(idx)
                        ? 'opacity-40 border-border/20'
                        : 'border-border/30 hover:border-violet/30'
                    }`}
                  >
                    {/* Card header with checkbox */}
                    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/20">
                      <Checkbox
                        checked={importChecked.has(idx)}
                        onChange={() => toggleImportCheck(idx)}
                      />
                      <span className="text-xs font-mono tracking-wider text-muted-foreground/50 uppercase">
                        Story {idx + 1}
                      </span>
                      {importWarnings.has(idx) && (
                        <span className="ml-auto flex items-center gap-1.5 text-xs text-amber-400/80">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                          Similar to &ldquo;{importWarnings.get(idx)!.existingTitle}&rdquo;
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4 space-y-3">
                      <StyledInput
                        value={ps.title}
                        onChange={(e) =>
                          updateParsedStory(idx, 'title', e.target.value)
                        }
                        placeholder="Title"
                      />
                      <StyledTextarea
                        rows={3}
                        value={ps.description}
                        onChange={(e) =>
                          updateParsedStory(idx, 'description', e.target.value)
                        }
                        placeholder="Description"
                      />
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <svg className="w-3.5 h-3.5 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                          </svg>
                        </div>
                        <StyledInput
                          value={ps.tags.join(', ')}
                          onChange={(e) =>
                            updateParsedStory(
                              idx,
                              'tags',
                              parseTags(e.target.value),
                            )
                          }
                          placeholder="Tags (comma-separated)"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={doImport}
                disabled={importChecked.size === 0}
                className="w-full h-11 rounded-xl bg-violet hover:bg-violet-dark transition-all duration-300 glow-violet"
              >
                Import {importChecked.size} {importChecked.size === 1 ? 'Story' : 'Stories'}
              </Button>
            </div>
          )}

          {/* Phase 3: Success */}
          {importPhase === 'success' && (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="w-14 h-14 rounded-full bg-emerald/10 flex items-center justify-center shadow-[0_0_20px_-4px_rgba(52,211,153,0.3)]">
                <svg className="w-7 h-7 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-lg font-display font-bold text-foreground">
                Stories imported
              </p>
              <p className="text-sm text-muted-foreground">Returning to stories...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Main view ───────────────────────────────────────────────────────────

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
              Stories
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setImportPhase('input')}
            >
              Import
            </Button>
            <Button
              onClick={() => {
                setShowAdd(!showAdd);
                if (showAdd) {
                  setNewTitle('');
                  setNewDescription('');
                  setNewTags('');
                }
              }}
              className="bg-violet hover:bg-violet-dark transition-all duration-300"
            >
              {showAdd ? 'Cancel' : 'Add Story'}
            </Button>
          </div>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="rounded-2xl border border-violet/20 bg-card/30 backdrop-blur-sm overflow-hidden mb-6">
            <div className="px-5 py-3.5 border-b border-violet/10 bg-violet/5">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-violet-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-sm font-medium text-violet-light">New Story</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <StyledInput
                placeholder="Title — e.g. Led migration to microservices"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <StyledTextarea
                rows={4}
                placeholder="Describe what you did, how you did it, and why it mattered..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-3.5 h-3.5 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                </div>
                <StyledInput
                  placeholder="Tags (comma-separated, e.g. Python, Leadership, AWS)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1 h-10 rounded-xl bg-violet hover:bg-violet-dark transition-all duration-300"
                  onClick={addStory}
                  disabled={!newTitle.trim()}
                >
                  Add Story
                </Button>
                <Button
                  variant="outline"
                  disabled={!newDescription.trim() || enhancingNew}
                  onClick={enhanceNew}
                  className="h-10 rounded-xl border-violet/30 text-violet-light hover:bg-violet/10 transition-all duration-300"
                >
                  {enhancingNew ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-violet-light" />
                      Enhancing
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                      Enhance
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        {stories.length > 0 && (
          <div className="space-y-3 mb-6">
            {/* Search bar */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories..."
                className="h-10 w-full rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet/20 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Tag filters — horizontal scroll strip */}
            {(availableTags.length > 0 || selectedTags.size > 0) && (
              <div className="relative">
                {/* Gradient fade masks */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-background to-transparent" />

                <div className="flex items-center gap-1.5 overflow-x-auto px-1 py-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {selectedTags.size > 0 && (
                    <button
                      onClick={() => setSelectedTags(new Set())}
                      className="shrink-0 inline-flex items-center gap-1 h-7 pl-2 pr-2.5 rounded-lg text-[11px] font-medium text-muted-foreground/60 hover:text-foreground border border-border/20 hover:border-border/40 transition-all duration-200"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {selectedTags.size}
                    </button>
                  )}
                  {/* Active tags first */}
                  {Array.from(selectedTags).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="shrink-0 inline-flex items-center h-7 px-3 rounded-lg text-[11px] font-medium transition-all duration-200 bg-violet/20 text-violet-light border border-violet/30 shadow-[0_0_8px_-3px_rgba(124,58,237,0.3)]"
                    >
                      {tag}
                    </button>
                  ))}
                  {/* Remaining tags that would still produce results */}
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="shrink-0 inline-flex items-center h-7 px-3 rounded-lg text-[11px] font-medium transition-all duration-200 bg-card/30 text-muted-foreground/60 border border-transparent hover:border-violet/20 hover:text-muted-foreground"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Story list */}
        {stories.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl border border-border/40 bg-card/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-display font-bold text-foreground">No stories yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your professional stories to help the AI tailor your CV.
              </p>
            </div>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <svg className="w-8 h-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-sm text-muted-foreground">No stories match your search</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStories.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-violet/20"
              >
                {/* Collapsed header */}
                <button
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                  onClick={() =>
                    setExpandedId(expandedId === s.id ? null : s.id)
                  }
                >
                  <svg
                    className={`w-4 h-4 text-muted-foreground/50 shrink-0 transition-transform duration-200 ${expandedId === s.id ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-sm text-foreground truncate flex-1">
                    {s.title}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {s.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-violet/20 bg-violet/5 text-violet-light text-[11px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {s.tags.length > 3 && (
                      <Badge
                        variant="outline"
                        className="border-border/40 text-muted-foreground text-[11px]"
                      >
                        +{s.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {expandedId === s.id && (
                  <div className="border-t border-border/20 px-5 py-4">
                    {editingId === s.id ? (
                      <div className="space-y-3">
                        <StyledInput
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title"
                        />
                        <StyledTextarea
                          rows={4}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description"
                        />
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <svg className="w-3.5 h-3.5 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                            </svg>
                          </div>
                          <StyledInput
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            placeholder="Tags (comma-separated)"
                            className="pl-10"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            className="flex-1 h-9 rounded-xl bg-violet hover:bg-violet-dark transition-all duration-300"
                            onClick={() => saveEdit(s.id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            disabled={
                              !editDescription.trim() ||
                              enhancingId === s.id
                            }
                            onClick={() => enhanceEdit(s.id)}
                            className="h-9 rounded-xl border-violet/30 text-violet-light hover:bg-violet/10 transition-all duration-300"
                          >
                            {enhancingId === s.id ? (
                              <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-violet-light" />
                                Enhancing
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                                </svg>
                                Enhance
                              </span>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-9 rounded-xl"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {s.description ? (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4 leading-relaxed">
                            {s.description}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground/50 italic mb-4">
                            No description
                          </p>
                        )}
                        {s.tags.length > 3 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {s.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="border-violet/20 bg-violet/5 text-violet-light text-[11px]"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => startEdit(s)}
                          >
                            Edit
                          </Button>
                          {deletingId === s.id ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => deleteStory(s.id)}
                            >
                              Confirm Delete
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingId(s.id)}
                              className="rounded-lg text-destructive/70 hover:text-destructive hover:border-destructive/40"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {stories.length > 0 && (
          <p className="text-center text-xs font-mono tracking-wider text-muted-foreground/50 mt-8">
            {filteredStories.length === stories.length
              ? `${stories.length} ${stories.length === 1 ? 'story' : 'stories'}`
              : `${filteredStories.length} of ${stories.length} stories`}
          </p>
        )}
      </div>
    </div>
  );
}
