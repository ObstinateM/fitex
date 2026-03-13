'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LatexDropzone } from './LatexDropzone';
import { PDFConverter } from './PDFConverter';
import { authedFetch } from '@/lib/api-client';

type Tab = 'latex' | 'pdf';

export function TemplateUpload() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('latex');
  const [tex, setTex] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setTex(null);
    setFilename(undefined);
    setError('');
  }

  async function handleConfirm() {
    if (!tex) return;
    setSaving(true);
    setError('');

    try {
      const res = await authedFetch('/cv/template', {
        method: 'POST',
        body: JSON.stringify({ tex, filename }),
      });

      if (!res.ok) {
        setError('Failed to save template. Please try again.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Tab selector */}
      <div className="flex rounded-xl bg-surface border border-border/30 p-1 gap-1">
        <button
          onClick={() => switchTab('latex')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
            activeTab === 'latex'
              ? 'bg-violet text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          I have a LaTeX template
        </button>
        <button
          onClick={() => switchTab('pdf')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
            activeTab === 'pdf'
              ? 'bg-violet text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Convert from PDF
        </button>
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === 'latex' ? (
          <LatexDropzone
            onFile={(t, fname) => {
              setTex(t);
              setFilename(fname);
            }}
          />
        ) : (
          <PDFConverter onConverted={(t) => setTex(t)} />
        )}
      </motion.div>

      {/* Preview for LaTeX path */}
      {tex && activeTab === 'latex' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <pre className="rounded-lg bg-surface p-4 text-xs font-mono text-muted-foreground overflow-auto max-h-48 border border-border/30 whitespace-pre-wrap">
            {tex.slice(0, 300)}
            {tex.length > 300 ? '\n…' : ''}
          </pre>
        </motion.div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Confirm CTA */}
      {tex && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleConfirm}
          disabled={saving}
          className="w-full rounded-xl bg-violet py-3.5 text-sm font-semibold text-white glow-violet transition-all duration-300 hover:bg-violet-dark hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Use this template →'}
        </motion.button>
      )}
    </div>
  );
}
