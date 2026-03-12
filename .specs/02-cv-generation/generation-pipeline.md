# Generation Pipeline

## Overview

The full generation flow orchestrated by `Selector.tsx`. Involves multiple API calls, some parallel, with graceful degradation for non-critical features.

## Pre-Checks

Before generation starts:
1. Stops selection mode if active (sends `STOP_SELECTION` to content script)
2. Validates API key exists — error: `"Missing API key. Please re-configure in settings."`
3. Validates template exists (if job description elements present) — error: `"Missing LaTeX template. Please re-configure in settings."`

## Job Description Construction

All elements tagged as `"job-description"` are concatenated with `\n\n`:
```
element.text + (element.guidance ? "\n\n[Focus note: {guidance}]" : "")
```

## Step-by-Step Pipeline

### Step 0 — Story Relevance Filter (if stories exist)

**Condition**: User has stories AND job description is present.

1. Status: "Selecting relevant stories..."
2. Calls `filterRelevantStories(allStories, jobDescription, apiKey, model)`
   - Sends only story titles + tags (NOT full descriptions) to minimize cost
   - Returns `StorySelection[]` with IDs and relevance reasons
3. Shows **StoryConfirmation UI** — user can toggle stories on/off
4. User clicks "Confirm & Generate" or "Cancel"
   - Cancel: aborts generation entirely
   - Confirm: proceeds with selected story IDs → filters full story objects

### Step 1 — CV Tailoring + Before Keyword Scan (PARALLEL)

Both run simultaneously:

**CV Tailoring (streamed)**:
- Builds prompt: `buildCvTailoringPrompt(template.mainContent, jobDescription, guidance, context, selectedStories)`
- Calls `streamChatCompletion` — chunks accumulated into `modifiedTex`
- Supports abort via `AbortController` signal
- Post-processing: strips markdown code fences (`\`\`\`latex`, `\`\`\`tex`, trailing `\`\`\``)

**Before Keyword Scan (non-streaming)**:
- Scans the ORIGINAL `template.mainContent` against the job description
- Calls `chatCompletion` with `buildKeywordScanPrompt`
- Non-critical — errors silently ignored
- Stored as `keywordScanBefore`

### Step 1.5 — After Keyword Scan

- Status: "Scanning tailored CV keywords..."
- Scans the TAILORED `modifiedTex` against the job description
- Same prompt and parsing as before scan
- Stored as `keywordScanAfter`
- Non-critical — errors silently ignored

### Step 2 — PDF Compilation

- Status: "Compiling PDF..."
- If profile image exists, appends it to template's auxFiles
- Calls `compileLatex({ template, modifiedMainContent: modifiedTex })`
- Returns `pdfBlob` (or null on failure) + `errors[]`

### Step 3 — Question Answering + Salary Estimate (PARALLEL)

All run simultaneously:

**Questions** (if any elements tagged as "question"):
- Status: `"Answering {count} question(s)..."`
- Each question → separate `chatCompletion` call with `buildQuestionAnswerPrompt`
- All question calls run in parallel via `Promise.all`
- Returns `AnswerItem[]` with question text, answer, and elementId

**Salary Estimate** (if job description + template exist):
- Calls `chatCompletion` with `buildSalaryEstimatePrompt(jobDescription, template.mainContent)`
- Non-critical — errors silently ignored
- Stored as `salaryEstimate`

### Completion

1. Calls `onGenerated(result, elements, guidance)` callback
2. App navigates to Results page
3. Auto-saves to history (see [08-history](../08-history/auto-save.md))

## Error Handling

- Generation errors caught in try/catch
- Error shown as red status text for 5 seconds
- Cleanup always runs in `finally` block (see cooldown section below)

## 2-Second Cooldown

A cooldown mechanism prevents rapid re-clicks of the Generate button:

- **State**: managed by a `cooldown` boolean (`useState(false)`)
- **Activation**: in the `finally` block of `generate()`, after `generating` is set to `false`, `cooldown` is set to `true`, then reset to `false` after 2 seconds via `setTimeout`
- **Guard**: the `generate()` function returns early if `generating || cooldown` is true
- **Button disabled**: the Generate button's `disabled` prop includes `cooldown` — `elements.length === 0 || generating || cooldown`
- **Sequence in `finally`**:
  ```typescript
  abortRef.current = null;
  setGenerating(false);
  setCooldown(true);
  setTimeout(() => setCooldown(false), 2000);
  ```
- This means after every generation (success or failure), the user must wait 2 seconds before generating again

## Abort Support (AbortController)

- **Creation**: a new `AbortController` is created at the start of Step 1 (CV tailoring) and stored in `abortRef` (`useRef<AbortController | null>(null)`)
- **Usage**: the controller's `signal` is passed as the last argument to `streamChatCompletion`, enabling cancellation of the SSE streaming request mid-flight
- **Cleanup**: `abortRef.current` is set to `null` in the `finally` block of `generate()`, regardless of success or failure
- **Scope**: the abort signal only covers the streaming CV tailoring call (Step 1); non-streaming calls (`chatCompletion`) and the LaTeX compilation do not use it
