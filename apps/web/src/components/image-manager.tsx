'use client';

import { useState, useRef } from 'react';
import { useImages, useUploadImage, useDeleteImage, useRenameImage, type CvImage } from '@/lib/queries';
import { toast } from '@/components/ui/sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function imageUrl(img: CvImage): string {
  return `${API_URL}${img.url}`;
}

interface ImageManagerProps {
  /** Compact mode hides the section header — used inside onboarding */
  compact?: boolean;
  /** Called whenever images change (upload/delete) so parent can refresh preview */
  onImagesChange?: () => void;
}

export function ImageManager({ compact = false, onImagesChange }: ImageManagerProps) {
  const { data: images = [], isLoading: loading } = useImages();
  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteImage();
  const renameMutation = useRenameImage();

  const [dragging, setDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const uploading = uploadMutation.isPending;

  async function upload(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5 MB limit.`);
        continue;
      }
      try {
        await uploadMutation.mutateAsync(file);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      }
    }
    onImagesChange?.();
  }

  async function remove(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      onImagesChange?.();
    } catch {
      toast.error('Network error deleting image.');
    }
  }

  function startRename(img: CvImage) {
    setEditingId(img.id);
    setEditValue(img.originalFilename);
    setTimeout(() => renameInputRef.current?.select(), 0);
  }

  async function submitRename(id: string) {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    const current = images.find((img) => img.id === id);
    if (current && trimmed === current.originalFilename) {
      setEditingId(null);
      return;
    }
    try {
      await renameMutation.mutateAsync({ id, filename: trimmed });
      onImagesChange?.();
    } catch {
      toast.error('Failed to rename image.');
    }
    setEditingId(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) upload(e.target.files);
    e.target.value = '';
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div>
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-violet-light/60 mb-1.5">
            Images
          </p>
          <h2 className="text-xl font-display font-bold tracking-tight">
            CV images
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload images referenced in your LaTeX template (e.g. profile photo). Use the original filename in{' '}
            <code className="text-xs font-mono text-violet-light/80 bg-violet/10 px-1.5 py-0.5 rounded">
              \includegraphics&#123;photo.jpg&#125;
            </code>
          </p>
        </div>
      )}

      {compact && (
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-6 w-6 rounded-md bg-violet/10 text-violet-light shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground leading-tight">
              Images <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Profile photo or other images used in your template
            </p>
          </div>
        </div>
      )}

      {/* Image thumbnails grid */}
      {!loading && images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden aspect-square hover:border-violet/30 transition-all duration-300"
            >
              <img
                src={imageUrl(img)}
                alt={img.originalFilename}
                className="w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
                {editingId === img.id ? (
                  <input
                    ref={renameInputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => submitRename(img.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitRename(img.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="w-full text-[10px] font-mono text-white bg-white/10 border border-white/20 rounded px-1.5 py-0.5 outline-none focus:border-violet-light/60"
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-[10px] font-mono text-white/80 truncate leading-tight cursor-pointer hover:text-white"
                    onClick={(e) => { e.stopPropagation(); startRename(img); }}
                    title="Click to rename"
                  >
                    {img.originalFilename}
                  </p>
                )}
              </div>
              {/* Action buttons */}
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => startRename(img)}
                  className="h-6 w-6 flex items-center justify-center rounded-md bg-black/60 backdrop-blur-sm text-white/70 hover:text-white hover:bg-violet/60 transition-all duration-200 cursor-pointer border border-white/10"
                  title="Rename"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => remove(img.id)}
                  className="h-6 w-6 flex items-center justify-center rounded-md bg-black/60 backdrop-blur-sm text-white/70 hover:text-white hover:bg-destructive/80 transition-all duration-200 cursor-pointer border border-white/10"
                  title="Delete"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
          compact ? 'p-5' : 'p-6'
        } ${
          dragging
            ? 'border-violet bg-violet/5'
            : 'border-border/40 hover:border-violet/50 hover:bg-violet/3'
        } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onChange}
          className="hidden"
        />
        <div className="flex flex-col items-center text-center">
          {uploading ? (
            <>
              <div className="h-5 w-5 rounded-full border-2 border-violet/20 border-t-violet animate-spin mb-2" />
              <p className="text-xs text-muted-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-violet/10 text-violet-light mb-2.5 group-hover:bg-violet/20 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground/80">
                Drop <span className="text-violet-light">images</span> here
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG, or WebP — max 5 MB each
              </p>
            </>
          )}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/30 bg-border/10 aspect-square animate-pulse"
            />
          ))}
        </div>
      )}
    </div>
  );
}
