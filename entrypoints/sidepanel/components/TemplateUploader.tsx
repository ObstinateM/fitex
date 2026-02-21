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
        onUploaded({ mainContent: text, auxFiles: [] });
      } else {
        setError("Please upload a .tex or .zip file.");
      }
    } catch {
      setError("Failed to read file.");
    }
  }

  async function processZip(file: File) {
    const MAX_ZIP_SIZE = 10 * 1024 * 1024; // 10 MB compressed
    const MAX_EXTRACTED_SIZE = 50 * 1024 * 1024; // 50 MB decompressed
    const MAX_FILE_COUNT = 100;

    if (file.size > MAX_ZIP_SIZE) {
      setError(`ZIP file too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`);
      return;
    }

    const buffer = await file.arrayBuffer();
    const files = unzipSync(new Uint8Array(buffer));

    let mainContent = "";
    const auxFiles: AuxFile[] = [];
    let mainCandidateCount = 0;
    let totalExtractedSize = 0;
    let fileCount = 0;

    const BINARY_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".eps", ".bmp", ".tiff", ".webp"];

    for (const [path, data] of Object.entries(files)) {
      if (path.startsWith("__MACOSX/") || path.startsWith(".") || path.endsWith("/")) continue;

      // Path traversal protection
      if (path.includes("..") || path.startsWith("/")) {
        setError(`Rejected unsafe path in ZIP: ${path}`);
        return;
      }

      fileCount++;
      if (fileCount > MAX_FILE_COUNT) {
        setError(`ZIP contains too many files (>${MAX_FILE_COUNT}).`);
        return;
      }

      totalExtractedSize += data.length;
      if (totalExtractedSize > MAX_EXTRACTED_SIZE) {
        setError(`Extracted content too large (>${MAX_EXTRACTED_SIZE / 1024 / 1024} MB). Possible zip bomb.`);
        return;
      }
      const isBinary = BINARY_EXTS.some(ext => path.toLowerCase().endsWith(ext));
      if (path.endsWith(".tex")) {
        const content = strFromU8(data);
        if (content.includes("\\documentclass")) {
          if (mainCandidateCount === 0) {
            mainContent = content;
          } else {
            // Extra documentclass files go to aux; first one stays as main
            auxFiles.push({ path, content });
          }
          mainCandidateCount++;
        } else {
          auxFiles.push({ path, content });
        }
      } else if (isBinary) {
        const bytes = new Uint8Array(data);
        const chunks: string[] = [];
        for (let i = 0; i < bytes.length; i += 8192) {
          chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
        }
        auxFiles.push({ path, content: btoa(chunks.join("")), encoding: "base64" });
      } else {
        auxFiles.push({ path, content: strFromU8(data) });
      }
    }

    if (!mainContent) {
      setError("No .tex file with \\documentclass found in the ZIP.");
      return;
    }

    if (mainCandidateCount > 1) {
      setError(`Found ${mainCandidateCount} .tex files with \\documentclass — using the first one. Consider removing extras from your ZIP.`);
    }

    setPreview(mainContent.slice(0, 300));
    onUploaded({ mainContent, auxFiles });
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
