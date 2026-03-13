'use client';

import { useState, useCallback } from 'react';
import * as fflate from 'fflate';

interface LatexDropzoneProps {
  onFile: (tex: string, filename: string) => void;
}

export function LatexDropzone({ onFile }: LatexDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(
    async (file: File) => {
      setError('');

      if (file.name.endsWith('.tex')) {
        const text = await file.text();
        onFile(text, file.name);
      } else if (file.name.endsWith('.zip')) {
        const buffer = await file.arrayBuffer();
        const files = fflate.unzipSync(new Uint8Array(buffer));
        const texFiles = Object.entries(files).filter(([name]) =>
          name.endsWith('.tex'),
        );

        if (texFiles.length === 0) {
          setError('No .tex file found in the ZIP archive');
          return;
        }

        // Pick the largest .tex file (most likely the main one)
        const [name, data] = texFiles.sort((a, b) => b[1].length - a[1].length)[0];
        const text = new TextDecoder().decode(data);
        onFile(text, name);
      } else {
        setError('Please upload a .tex or .zip file');
      }
    },
    [onFile],
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
          accept=".tex,.zip"
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
          Drop your{' '}
          <span className="text-violet font-medium">.tex</span> or{' '}
          <span className="text-violet font-medium">.zip</span> here
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          or click to browse
        </p>
      </label>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
