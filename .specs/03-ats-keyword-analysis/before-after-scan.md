# Before/After Keyword Scan

## Overview

During generation, two keyword scans are performed: one on the original template (before) and one on the tailored CV (after). The comparison shows how tailoring improved ATS keyword coverage.

## Before Scan

- **When**: Runs IN PARALLEL with CV tailoring (Step 1)
- **Input**: Original `template.mainContent` + job description
- **Method**: Non-streaming `chatCompletion` using the user's selected model
- **Stored as**: `keywordScanBefore` in `GenerationResult`
- **Non-critical**: Errors silently caught

## After Scan

- **When**: Runs AFTER CV tailoring completes (Step 1.5)
- **Input**: Tailored `modifiedTex` + job description
- **Method**: Non-streaming `chatCompletion` using the user's selected model
- **Stored as**: `keywordScanAfter` in `GenerationResult`
- **Non-critical**: Errors silently caught

## Response Parsing

Both scans use identical parsing:
```typescript
const parsed = JSON.parse(raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```\s*$/, "").trim());
if (Array.isArray(parsed)) {
  result = { keywords: parsed };
} else {
  result = { keywords: parsed.keywords, atsPassRate: parsed.atsPassRate };
}
```

## Persistence

- Both scan results saved to `HistoryEntry` for later viewing
- During refinement (feedback loop): after scan is re-run on the refined CV and `keywordScanAfter` is updated

## Display

- Only shown on Results page when BOTH `keywordScanBefore` and `keywordScanAfter` exist
- Rendered by `KeywordScanCard` component (see [keyword-scan-card-ui.md](./keyword-scan-card-ui.md))

## Data Model

```typescript
interface KeywordScanResult {
  keywords: KeywordItem[];
  atsPassRate?: number; // 0-100
}

interface KeywordItem {
  keyword: string;
  category: "hard-skill" | "tool" | "certification" | "methodology" | "language";
  present: boolean;
}
```
