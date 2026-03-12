# View and Re-run from History

## View (`handleViewHistory`)

Reconstructs a `GenerationResult` from a saved `HistoryEntry` and opens the Results page.

### PDF Reconstruction
```typescript
function base64ToBlob(base64: string, type = "application/pdf"): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}
```

### Result Reconstruction
```typescript
{
  pdfBlob: entry.pdfBase64 ? base64ToBlob(entry.pdfBase64) : null,
  modifiedTex: entry.modifiedTex,
  answers: entry.answers,
  latexErrors: entry.latexErrors,
  jobDescription: entry.jobDescription,
  keywordScanBefore: entry.keywordScanBefore,
  keywordScanAfter: entry.keywordScanAfter,
  salaryEstimate: entry.salaryEstimate,
}
```

### Navigation
- Sets `fromHistory = true`
- Results page shows "Back to History" button instead of "Adjust & Regenerate"
- All refinement tools available (reduce, feedback, match score)

## Re-run (`handleRerunFromHistory`)

Returns to the Selector page with the saved inputs pre-filled.

### With Saved Elements
If the entry has `elements` and `elements.length > 0`:
- Restores `previousElements` from entry
- Restores `previousGuidance` from entry

### Backward Compatibility
If the entry has no saved elements (older entries):
- Synthesizes a single job-description element from the stored snippet:
```typescript
{
  id: crypto.randomUUID(),
  text: entry.jobDescription,  // first 200 chars
  tag: "job-description",
}
```
- Guidance set to empty string

### After Navigation
- Selector page shows pre-filled elements and guidance
- User can modify selections, add/remove elements, change guidance
- Clicking "Generate" starts a fresh generation
