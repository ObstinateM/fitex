import { useRef } from "react";
import type { AuxFile } from "@/lib/types";

interface ImageUploaderProps {
  value: AuxFile | null;
  onChange: (image: AuxFile | null) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  function processFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Strip the "data:<mime>;base64," prefix
      const base64 = dataUrl.split(",")[1];
      onChange({ path: file.name, content: base64, encoding: "base64" });
    };
    reader.readAsDataURL(file);
  }

  function mimeFromPath(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase();
    const map: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" };
    return map[ext ?? ""] ?? "image/png";
  }

  const dataUrl = value ? `data:${mimeFromPath(value.path)};base64,${value.content}` : null;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Profile Photo <span className="font-normal text-gray-400">(optional)</span>
      </label>

      {value ? (
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
          <img
            src={dataUrl!}
            alt="Profile preview"
            className="h-16 w-16 rounded object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800">{value.path}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              Reference in your template as{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 font-mono">
                \includegraphics{`{${value.path}}`}
              </code>
            </p>
            <button
              onClick={() => onChange(null)}
              className="mt-2 cursor-pointer text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
        >
          <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-600">Drop an image here, or click to browse</p>
          <p className="mt-1 text-xs text-gray-400">JPG, PNG, GIF, WebP</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
