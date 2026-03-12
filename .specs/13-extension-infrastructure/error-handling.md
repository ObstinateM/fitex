# Error Handling

## React Error Boundary

The entire app is wrapped in an `ErrorBoundary` class component defined in `App.tsx`.

### Implementation

```typescript
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <p className="mb-2 text-sm font-medium text-red-600">Something went wrong</p>
          <p className="mb-4 text-xs text-gray-500">{this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })} ...>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Behavior

- Catches any unhandled error during React rendering via `getDerivedStateFromError`
- Displays: "Something went wrong" heading, the error message in gray, and a "Try Again" button
- "Try Again" clears the error state (`{ error: null }`), which re-renders the children and effectively resets the app

### Usage

```typescript
export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
```

## Generation Errors

In `Selector.tsx`, the `generate()` function wraps the entire generation pipeline in a try/catch:

```typescript
try {
  // ... generation pipeline ...
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Generation failed";
  setStatus(`Error: ${message}`);
  setTimeout(() => setStatus(""), 5000);
}
```

- Errors are shown as red status text (`text-red-600`) below the element list
- The error message auto-clears after 5 seconds
- After the error, the UI returns to the ready state (generating flag cleared, 2-second cooldown applied)

The same pattern is used in `Results.tsx` for the "Reduce to 1 page" and "Apply Refinement" actions:
- Error is caught, displayed as status text, and cleared after 5 seconds
- Each has its own independent cooldown timer (2 seconds)

## Non-Critical Feature Failures (Silent Ignore)

Several features are intentionally non-critical and use silent try/catch to avoid disrupting the main workflow:

### Pre-scan keyword analysis (Selector.tsx)

The debounced pre-scan that runs 2 seconds after job description elements change:

```typescript
try {
  // ... keyword scan via gpt-4.1-nano ...
} catch {
  // Silently skip -- pre-scan is non-critical
}
```

### Before-scan keyword analysis (during generation)

```typescript
const beforeScanPromise = chatCompletion(apiKey, model, [...])
  .then((raw) => {
    try { /* parse */ } catch { /* silently ignore */ }
  })
  .catch(() => { /* silently ignore */ });
```

Both the parsing failure and the API call failure are silently caught.

### After-scan keyword analysis (during generation)

```typescript
try {
  // ... after-tailoring keyword scan ...
} catch { /* silently ignore */ }
```

### Salary estimation (during generation)

```typescript
chatCompletion(apiKey, model, [...])
  .then((raw) => {
    try { /* parse */ } catch { /* silently ignore */ }
  })
  .catch(() => { /* silently ignore */ });
```

### Match score analysis (Results.tsx)

```typescript
try {
  // ... match score API call + parse ...
} catch {
  setMatchScore(null);
  setShowMatch(false);
}
```

On failure, the match score UI is hidden rather than showing an error.

### Keyword re-scan after refinement (Results.tsx)

```typescript
try {
  // ... re-scan keywords on refined CV ...
} catch { /* silently ignore */ }
```

## API Error Messages

The `friendlyApiError` function in `lib/openai.ts` maps HTTP status codes to user-facing messages:

| HTTP Status | User-Facing Message |
|---|---|
| 401 | "Invalid or expired API key. Please check your key in settings." |
| 429 | "Rate limit exceeded. Please wait a moment and try again." |
| 500, 502, 503 | "OpenAI service is temporarily unavailable. Please try again later." |
| Any other | "OpenAI request failed (HTTP {status}). Please try again." |

These messages surface through the generation error handler and are displayed as the red status text described above.

## Storage Errors

### History save on generation (App.tsx)

```typescript
try {
  // ... save to history ...
} catch {
  // Storage quota exceeded or other error -- silently skip history save
}
```

Generation results are still shown to the user even if history persistence fails.

### History save after refinement (Results.tsx)

```typescript
try {
  // ... save refined version to history ...
} catch { /* quota exceeded -- skip */ }
```

Same pattern: the refined result is displayed regardless of whether it was saved to history.

## Content Script Errors

### Injection failure (Selector.tsx)

```typescript
try {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content-scripts/content.js"],
  });
  return true;
} catch {
  return false;
}
```

If injection fails, the user is informed via status message: "Cannot inject on this page. Try a regular webpage." (cleared after 3 seconds).

### Message send failures (content.ts)

All `chrome.runtime.sendMessage` calls in the content script chain `.catch(() => {})` to silently swallow errors (e.g., when the side panel is closed):

```typescript
chrome.runtime.sendMessage({
  type: "ELEMENT_SELECTED",
  payload: { id, text: extractText(target) },
} satisfies Message).catch(() => {});
```

## LaTeX Compilation Errors

LaTeX compilation errors are not caught/hidden. They are returned as an array of strings from the compilation service and displayed on the Results page:

- An expandable section labeled "LaTeX Errors ({count})" appears when errors exist
- Clicking the toggle reveals a `<pre>` block with the error text in a red-tinted background
- If compilation fails entirely (no PDF produced), a red banner is shown: "PDF compilation failed. Check the errors below."

## Missing Configuration Errors

Before generation starts, the code checks for required configuration:

- **Missing API key**: `setStatus("Missing API key. Please re-configure in settings.")`
- **Missing template** (when job description is present): `setStatus("Missing LaTeX template. Please re-configure in settings.")`

These are shown as red status text and do not auto-clear (the generation is aborted early).

## Status Message Auto-Clear Pattern

Status messages throughout the app follow a consistent auto-clear pattern using `setTimeout` to remove messages after a brief display period. This prevents stale error or info messages from lingering in the UI.

### Auto-Clear Durations

| Context | Duration | Example |
|---------|----------|---------|
| Content script injection failure (Selector.tsx) | 3 seconds | `"Cannot inject on this page. Try a regular webpage."` |
| Generation pipeline error (Selector.tsx) | 5 seconds | `"Error: {message}"` |
| Reduce-to-one-page result (Results.tsx) | 2-3 seconds | `"Already 1 page!"` or failure messages |
| Refinement failure (Results.tsx) | 3-5 seconds | `"Missing API key or template."` or error messages |
| Recompilation failure (Results.tsx) | 3 seconds | `"Recompilation failed - kept previous version."` |

### Implementation Pattern

All auto-clear uses the same approach:

```typescript
setStatus("Error message here");
setTimeout(() => setStatus(""), durationMs);
```

The status is set to an empty string after the timeout, causing the conditional render (`{status && <p>...}`) to hide the message. There is no explicit cleanup of the timeout via `clearTimeout` in most cases, since the setTimeout simply sets state to empty, which is harmless even if the component has re-rendered.

### Expand/Collapse UI Pattern

The Results page uses several collapsible sections that toggle visibility on click:

- **LaTeX Errors**: `showErrors` state toggles a `<pre>` block with error text
- **Modified LaTeX Source**: `showTex` state toggles a `<pre>` block with the TeX source
- **CV-Job Match Score**: `showMatch` state toggles the match score card (triggered by analysis, not just toggle)

Each uses a triangle indicator (`&#9654;`) that rotates 90 degrees when expanded via the CSS class `rotate-90`.

## Error Handling Summary

| Error Category | Strategy | User Impact |
|---|---|---|
| React render crash | ErrorBoundary with retry | Full-screen error + "Try Again" button |
| Generation pipeline | try/catch, 5s auto-clear | Red status text, can retry |
| Keyword scans | Silent catch | Feature simply not shown |
| Salary estimation | Silent catch | Feature simply not shown |
| Match score | Silent catch, hide UI | Feature simply not shown |
| API HTTP errors | Friendly messages | Descriptive error in status text |
| History save | Silent catch | Generation still shown, history not persisted |
| Content script injection | Catch + inform user | Status message with guidance |
| Content script messaging | `.catch(() => {})` | No visible impact |
| LaTeX errors | Displayed in expandable section | User sees specific LaTeX errors |
| Missing config | Status text, generation aborted | User directed to settings |
