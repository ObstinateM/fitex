import { unzlibSync } from "fflate";
import type { TexTemplate, LatexCompiler } from "./types";
import { getCompiler } from "./storage";

interface CompileOptions {
  template: TexTemplate;
  modifiedMainContent: string;
  compiler?: LatexCompiler;
}

interface CompileResult {
  pdfBlob: Blob | null;
  errors: string[];
}

export async function compileLatex(options: CompileOptions): Promise<CompileResult> {
  const compiler = options.compiler ?? await getCompiler();

  const resources: Array<{ path?: string; main?: boolean; content?: string; file?: string }> = [
    { main: true, content: options.modifiedMainContent },
  ];

  for (const aux of options.template.auxFiles) {
    if (aux.encoding === "base64") {
      resources.push({ path: aux.path, file: aux.content });
    } else {
      resources.push({ path: aux.path, content: aux.content });
    }
  }

  const res = await fetch("https://latex.ytotech.com/builds/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ compiler, resources }),
  });

  if (res.ok && res.headers.get("content-type")?.includes("application/pdf")) {
    const blob = await res.blob();
    return { pdfBlob: blob, errors: [] };
  }

  // Error response - try to parse log
  const text = await res.text();
  const errors = parseLatexErrors(text);
  return { pdfBlob: null, errors: errors.length > 0 ? errors : [text || `Compilation failed (HTTP ${res.status})`] };
}

export async function countPdfPages(blob: Blob): Promise<number> {
  const buf = await blob.arrayBuffer();
  const raw = new Uint8Array(buf);
  // latin-1 gives a 1-to-1 byte↔character mapping, so string indices === byte indices
  const text = new TextDecoder("latin1").decode(raw);

  // Method 1: uncompressed /Count (older pdflatex / PDF 1.4)
  const direct = [...text.matchAll(/\/Count\s+(\d+)/g)]
    .map((m) => parseInt(m[1], 10))
    .filter((n) => n > 0);
  if (direct.length > 0) return Math.max(...direct);

  // Method 2: decompress ObjStm streams (pdflatex ≥ TeX Live 2018 uses PDF 1.5
  // compressed object streams, so /Count lives inside a FlateDecode ObjStm)
  let maxCount = 0;
  const objStmRe = /\/Type\s*\/ObjStm/g;
  let m: RegExpExecArray | null;
  while ((m = objStmRe.exec(text)) !== null) {
    // The stream keyword follows the dictionary close ">>"
    const slice = text.slice(m.index, m.index + 1500);
    const delimMatch = slice.match(/>>\s*stream[\r\n]+/);
    if (!delimMatch || delimMatch.index == null) continue;
    const dataStart = m.index + delimMatch.index + delimMatch[0].length;

    // endstream is preceded by a newline
    let endPos = text.indexOf("\nendstream", dataStart);
    if (endPos === -1) continue;
    // trim \r if present (Windows line endings)
    if (text[endPos - 1] === "\r") endPos--;

    try {
      const decompressed = unzlibSync(raw.slice(dataStart, endPos));
      const inner = new TextDecoder("latin1").decode(decompressed);
      const counts = [...inner.matchAll(/\/Count\s+(\d+)/g)]
        .map((mm) => parseInt(mm[1], 10))
        .filter((n) => n > 0);
      if (counts.length > 0) maxCount = Math.max(maxCount, ...counts);
    } catch {
      // stream uses a different filter or is malformed — skip
    }
  }

  return maxCount > 0 ? maxCount : 1;
}

function parseLatexErrors(log: string): string[] {
  const errors: string[] = [];
  const lines = log.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("!")) {
      let errorMsg = line;
      // Include the next line for context
      if (i + 1 < lines.length) {
        errorMsg += "\n" + lines[i + 1];
      }
      errors.push(errorMsg);
    }
  }
  return errors;
}
