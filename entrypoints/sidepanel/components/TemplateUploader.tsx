import { useState, useRef } from "react";
import { unzipSync, strFromU8 } from "fflate";
import type { TexTemplate, AuxFile } from "@/lib/types";

interface TemplateUploaderProps {
  onUploaded: (template: TexTemplate) => void;
}

export default function TemplateUploader({ onUploaded }: TemplateUploaderProps) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  async function processFile(file: File) {
    setError("");
    setPreview("");
    setFileName(file.name);

    try {
      if (file.name.endsWith(".zip")) {
        await processZip(file);
      } else if (file.name.endsWith(".tex")) {
        const text = await file.text();
        if (!text.includes("\\documentclass")) {
          setError("File doesn't appear to be a valid LaTeX document.");
          return;
        }
        setPreview(text.slice(0, 300));
        onUploaded({ mainContent: text, auxFiles: [], compiler: "pdflatex" });
      } else {
        setError("Please upload a .tex or .zip file.");
      }
    } catch {
      setError("Failed to read file.");
    }
  }

  async function processZip(file: File) {
    const buffer = await file.arrayBuffer();
    const files = unzipSync(new Uint8Array(buffer));

    let mainContent = "";
    let mainPath = "";
    const auxFiles: AuxFile[] = [];

    const BINARY_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".eps", ".bmp", ".tiff", ".webp"];

    for (const [path, data] of Object.entries(files)) {
      if (path.startsWith("__MACOSX/") || path.startsWith(".")) continue;
      const isBinary = BINARY_EXTS.some(ext => path.toLowerCase().endsWith(ext));
      if (path.endsWith(".tex")) {
        const content = strFromU8(data);
        if (content.includes("\\documentclass")) {
          mainContent = content;
          mainPath = path;
        } else if (!path.endsWith("/")) {
          auxFiles.push({ path, content });
        }
      } else if (!path.endsWith("/")) {
        if (isBinary) {
          let binary = "";
          for (let i = 0; i < data.byteLength; i++) binary += String.fromCharCode(data[i]);
          auxFiles.push({ path, content: btoa(binary), encoding: "base64" });
        } else {
          auxFiles.push({ path, content: strFromU8(data) });
        }
      }
    }

    if (!mainContent) {
      setError("No .tex file with \\documentclass found in the ZIP.");
      return;
    }

    setPreview(mainContent.slice(0, 300));
    onUploaded({ mainContent, auxFiles, compiler: "pdflatex" });
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        LaTeX CV Template
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
      >
        <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-gray-600">
          {fileName || "Drop .tex or .zip file here, or click to browse"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".tex,.zip"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {preview && (
        <pre className="max-h-32 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          {preview}...
        </pre>
      )}
    </div>
  );
}
