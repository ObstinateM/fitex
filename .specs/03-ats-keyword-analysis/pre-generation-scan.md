# Pre-Generation Keyword Scan

## Overview

A real-time, debounced keyword scan that runs automatically as the user selects job description elements. Gives immediate feedback on current ATS keyword coverage before generation.

## Trigger

- Fires when `elements` state changes (useEffect dependency)
- **2-second debounce** via `setTimeout` — resets on each change
- Only runs when at least one `"job-description"` element exists
- Clears scan result and loading state if no job description elements

### Debounce Implementation

The scan uses a 2-second `setTimeout` with cleanup via the useEffect return function:

```typescript
useEffect(() => {
  const jobDescElements = elements.filter((el) => el.tag === "job-description");
  if (jobDescElements.length === 0) {
    setPreScan(null);
    setPreScanLoading(false);
    return;
  }

  setPreScanLoading(true);
  const timer = setTimeout(async () => {
    // ... API call ...
  }, 2000);

  return () => clearTimeout(timer);
}, [elements]);
```

Key details:

- **2-second delay**: The `setTimeout` delays the API call by 2000ms after the last element change. This prevents firing a scan on every rapid element selection/deselection.
- **Cleanup via `clearTimeout`**: The useEffect cleanup function cancels any pending timer when `elements` changes again before the 2 seconds elapse, or when the component unmounts. This ensures only the most recent element configuration triggers a scan.
- **Immediate loading indicator**: `setPreScanLoading(true)` is set immediately (before the timeout), so the UI shows a loading skeleton as soon as the user has job description elements, providing visual feedback that a scan will run.
- **Why debouncing is necessary**: Without the debounce, each element selection or deselection would fire an API call to `gpt-4.1-nano`. When a user is rapidly selecting multiple elements on a page, this would result in many redundant, overlapping API calls. The 2-second debounce waits for the user to settle before making a single call with the final state.

## API Call

- **Model**: Always `gpt-4.1-nano` (cheapest model, regardless of user's selected model)
- **Method**: Non-streaming `chatCompletion`
- **Prompt**: `buildKeywordScanPrompt(jobDescription, template.mainContent)` — scans the ORIGINAL template

## Response Parsing

```typescript
const parsed = JSON.parse(raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```\s*$/, "").trim());
if (Array.isArray(parsed)) {
  // Legacy: just an array of keywords
  setPreScan({ keywords: parsed });
} else {
  // Expected: { keywords: [...], atsPassRate: number }
  setPreScan({ keywords: parsed.keywords, atsPassRate: parsed.atsPassRate });
}
```

## Error Handling

- Entirely non-critical — all errors silently caught
- Loading state managed independently of generation

## UI Component: PreScanCard

### Loading State
- Animated pulse skeleton with:
  - 2 placeholder bars (header area)
  - 1 progress bar placeholder
  - 6 pill-shaped placeholders

### Results State
- **Header**: "{matched}/{total} ATS keywords matched" + ATS pass rate badge
- **Progress bar**: colored by percentage (green ≥70%, yellow ≥45%, red <45%)
- **Keyword pills**: green with ✓ (present), red with ✗ (missing)
- **Footer**: "Estimated based on keyword analysis"

### Visibility
- Shown only when: scan result or loading exists AND not currently generating
