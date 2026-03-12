# Auto-Save

## Overview

Every successful generation is automatically saved to history. Refined versions are also saved as separate entries.

## Trigger

In `handleGenerated` callback in App.tsx, after navigating to Results:
- **Condition**: `res.pdfBlob || res.modifiedTex` must exist

## Job Description Truncation

The job description stored in each history entry is truncated to **200 characters**:
```typescript
jobDescription: res.jobDescription.slice(0, 200)
```
This limits storage usage since the full job description can be very long and is not needed for the history list display (which also applies `line-clamp-2` CSS). The truncation is a hard slice with no ellipsis suffix.

## PDF Encoding

PDF blob is converted to a base64 string for JSON-serializable storage in `chrome.storage.local`. The conversion uses a chunked approach via the `blobToBase64` helper function (App.tsx lines 44-52):

```typescript
async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 8192) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
  }
  return btoa(chunks.join(""));
}
```

### Why chunked conversion (8192-byte chunks)

`String.fromCharCode(...bytes)` uses the spread operator to pass each byte as an argument. For large PDFs, this can exceed the JavaScript engine's maximum call stack size (argument limit). By processing **8192 bytes at a time**, each `String.fromCharCode` call receives at most 8192 arguments, safely within engine limits. The resulting string chunks are joined before being passed to `btoa()` for base64 encoding.

The same chunked pattern is also used in `Results.tsx` when saving refined versions to history (line 134-135).

## Entry Structure

```typescript
interface HistoryEntry {
  id: string;                              // crypto.randomUUID()
  createdAt: number;                       // Date.now()
  jobDescription: string;                  // First 200 characters only
  pdfBase64: string;                       // Base64-encoded PDF
  modifiedTex: string;                     // Full tailored LaTeX source
  answers: AnswerItem[];                   // Question answers
  latexErrors: string[];                   // Compilation errors
  elements?: SelectedElement[];            // Selected page elements
  guidance?: string;                       // Generation guidance text
  keywordScanBefore?: KeywordScanResult;   // Before keyword scan
  keywordScanAfter?: KeywordScanResult;    // After keyword scan
  salaryEstimate?: SalaryEstimate;         // Salary estimate
}
```

## Storage Mechanics

- `addHistoryEntry`: prepends new entry to array, slices to max 20
- Newest entries first (LIFO order)
- Errors silently caught (e.g., storage quota exceeded - extension storage has limits)

## Refined Versions

When a user applies feedback refinement on the Results page, the refined version is saved as a **new, separate** history entry (not overwriting the original). This preserves the full history trail.
