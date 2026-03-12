# Token Estimation

## Approximation Rule

All token estimates use: **tokens ≈ string.length / 4**

This is a rough approximation of OpenAI's tokenization (BPE averages ~4 characters per token for English text).

## Per-Component Breakdown

### 1. Template Tokens
```
Math.ceil(template.mainContent.length / 4)
```

### 2. Job Description Tokens
Sum across all job-description elements:
```
Math.ceil((el.text.length + (el.guidance?.length ?? 0)) / 4)
```

### 3. Guidance Tokens
```
Math.ceil(guidance.length / 4)
```

### 4. System Overhead
Fixed: **500 tokens** (accounts for prompt instructions, XML tags, etc.)

### 5. Story Relevance Filter (if stories exist)
- **Input**: story summaries (title + tags for each) + job description + 300 overhead
  ```
  storySummaryTokens = sum of Math.ceil((s.title.length + s.tags.join(", ").length) / 4)
  filterInput = storySummaryTokens + jobDescTokens + 300
  ```
- **Output**: `Math.min(stories.length × 30, 500)` (capped at 500)

### 6. Selected Story Content
Estimates ~50% of stories will be selected:
```
avgSelectedCount = Math.ceil(stories.length × 0.5)
storyContentTokens = sum of first N stories:
  Math.ceil((s.title.length + s.description.length + s.tags.join(", ").length) / 4)
```

### 7. CV Tailoring
- **Input**: templateTokens + jobDescTokens + guidanceTokens + storyContentTokens + systemOverhead
- **Output**: templateTokens (assumes output ≈ same size as input template)

### 8. Question Answering (per question)
- **Input per question**: templateTokens + jobDescTokens + storyContentTokens + 300
- **Output per question**: 500 tokens
- Multiplied by question count

### 9. Salary Estimation
- **Input**: jobDescTokens + templateTokens + 400
- **Output**: 200

### 10. Pre-Scan Keyword Scan (gpt-4.1-nano)
- **Input**: jobDescTokens + templateTokens + 400
- **Output**: 300
- Uses gpt-4.1-nano pricing regardless of selected model

### 11. Before/After Keyword Scans (selected model)
- **Input per scan**: jobDescTokens + templateTokens + 400
- **Output per scan**: 300
- **Count**: 2 (before + after)

## Reactivity

Recalculates via `useEffect` whenever `elements` or `guidance` state changes.

### Cancelled Promise Flag Pattern

The estimation effect uses a `cancelled` flag to prevent stale state updates:

```typescript
useEffect(() => {
  if (elements.length === 0) {
    setCostEstimate(null);
    return;
  }
  let cancelled = false;
  async function estimate() {
    const [template, model, stories] = await Promise.all([getTemplate(), getModel(), getStories()]);
    if (cancelled) return;
    // ... token calculation ...
    setCostEstimate({ tokens: totalInput + totalOutput + preScanInput + preScanOutput, cost });
  }
  estimate();
  return () => { cancelled = true; };
}, [elements, guidance]);
```

Key aspects of this pattern:

- **`cancelled` is a local mutable variable** declared inside the effect, not React state. This avoids triggering additional renders.
- **Early exit after async operations**: After the `await Promise.all(...)` call to read storage values, the function checks `if (cancelled) return` before proceeding with calculations or calling `setCostEstimate`. This prevents setting state with data computed from outdated `elements`/`guidance` values.
- **Cleanup sets `cancelled = true`**: The useEffect cleanup function (returned arrow function) runs when `elements` or `guidance` changes again, or when the component unmounts. Setting `cancelled = true` ensures any in-flight `estimate()` call will bail out before updating state.
- **Why this is necessary**: Without the cancelled flag, rapid element changes could cause a race condition. For example: the user adds element A (triggering estimate #1), then quickly adds element B (triggering estimate #2). If estimate #1's storage reads resolve after estimate #2's, the UI would briefly flash incorrect token counts. The cancelled flag ensures only the most recent estimate's result is applied.
- **Clearing on empty**: If `elements.length === 0`, the cost estimate is immediately cleared to `null` and the effect returns early without setting up an async calculation or cleanup.
