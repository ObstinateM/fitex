'use client';

import { useState, useCallback } from 'react';
import { useConvertPdf } from '@/lib/queries';

interface PDFConverterProps {
  onConverted: (tex: string) => void;
}

export function PDFConverter({ onConverted }: PDFConverterProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [tex, setTex] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const convertMutation = useConvertPdf();
  const loading = convertMutation.isPending;

  const convert = useCallback(
    (file: File) => {
      setError('');
      setTex(null);
      convertMutation.mutate(file, {
        onSuccess: (data) => {
          setTex(data.tex);
          onConverted(data.tex);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.');
        },
      });
    },
    [convertMutation, onConverted],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setError('Please upload a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File must be smaller than 10 MB');
        return;
      }
      setCurrentFile(file);
      convert(file);
    },
    [convert],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-violet/20 border-t-violet animate-spin" />
        <p className="text-sm text-muted-foreground">
          Converting your CV to LaTeX…
        </p>
      </div>
    );
  }

  if (tex) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-emerald flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Converted successfully
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          onClick={() => currentFile && convert(currentFile)}
          className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Regenerate
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-violet bg-violet/5'
            : 'border-border/50 hover:border-violet/60 hover:bg-violet/5'
        }`}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        <svg
          className="w-8 h-8 text-muted-foreground mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-muted-foreground">
          Drop your <span className="text-violet font-medium">PDF</span> here
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          or click to browse — max 10 MB
        </p>
      </label>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
