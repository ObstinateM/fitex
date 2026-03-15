'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { LatexDropzone } from './LatexDropzone';
import { PDFConverter } from './PDFConverter';
import { ImageManager } from '@/components/image-manager';
import { useCompileRaw, useSaveTemplate } from '@/lib/queries';

type Tab = 'latex' | 'pdf';

export function TemplateUpload() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get('callbackURL') || '/dashboard';
  const [activeTab, setActiveTab] = useState<Tab>('pdf');
  const [tex, setTex] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | undefined>();
  const [error, setError] = useState('');

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [compilingPreview, setCompilingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const blobUrlRef = useRef<string | null>(null);
  const previewSeqRef = useRef(0);

  const compileRaw = useCompileRaw();
  const saveTemplateMutation = useSaveTemplate();
  const saving = saveTemplateMutation.isPending;

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setTex(null);
    setFilename(undefined);
    setError('');
  }

  function compilePreview(texContent: string) {
    if (!texContent) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
        setPdfBlobUrl(null);
      }
      return;
    }

    const seq = ++previewSeqRef.current;
    setCompilingPreview(true);
    setPreviewError('');

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setPdfBlobUrl(null);
    }

    compileRaw
      .mutateAsync({ tex: texContent, includeImages: true })
      .then((blob) => {
        if (seq !== previewSeqRef.current) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setPdfBlobUrl(url);
      })
      .catch(() => {
        if (seq === previewSeqRef.current)
          setPreviewError('Could not generate preview. The template may have LaTeX errors.');
      })
      .finally(() => {
        if (seq === previewSeqRef.current) setCompilingPreview(false);
      });
  }

  useEffect(() => {
    compilePreview(tex ?? '');
  }, [tex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  async function handleConfirm() {
    if (!tex) return;
    setError('');

    try {
      await saveTemplateMutation.mutateAsync({ tex, filename });
      router.push(callbackURL);
    } catch {
      setError('Failed to save template. Please try again.');
    }
  }

  return (
    <div className="space-y-5">
      {/* Tab selector */}
      <div className="flex rounded-xl bg-surface border border-border/30 p-1 gap-1">
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

      {/* PDF Preview */}
      {tex && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          {compilingPreview && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-xl border border-border/30 bg-surface">
              <div className="h-5 w-5 rounded-full border-2 border-violet/20 border-t-violet animate-spin" />
              <p className="text-xs text-muted-foreground">Generating preview…</p>
            </div>
          )}
          {!compilingPreview && previewError && (
            <p className="text-xs text-muted-foreground italic">{previewError}</p>
          )}
          {!compilingPreview && pdfBlobUrl && (
            <div className="rounded-xl overflow-hidden border border-border/30">
              <iframe
                src={`${pdfBlobUrl}#toolbar=0`}
                className="w-full h-[420px]"
                title="CV preview"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Image upload (optional) */}
      {tex && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <ImageManager compact onImagesChange={() => tex && compilePreview(tex)} />
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
