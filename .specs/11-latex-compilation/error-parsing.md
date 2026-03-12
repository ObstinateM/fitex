# LaTeX Error Parsing

## Overview

When PDF compilation fails, the service returns a text log. The `parseLatexErrors` function extracts human-readable error messages from this log.

## Algorithm

```typescript
function parseLatexErrors(log: string): string[] {
  const errors: string[] = [];
  const lines = log.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("!")) {
      let errorMsg = line;
      if (i + 1 < lines.length) {
        errorMsg += "\n" + lines[i + 1];  // Include next line for context
      }
      errors.push(errorMsg);
    }
  }
  return errors;
}
```

### Rules
1. Split log by newlines
2. Lines starting with `!` are LaTeX error indicators
3. Each error includes the `!` line + the next line (which usually contains the location or context)
4. Multiple errors can be extracted from a single log

### Fallback

If no `!` lines found but compilation failed:
- Returns the raw text response
- Or `"Compilation failed (HTTP {status})"` if text is empty

## Display

- Shown in expandable "LaTeX Errors ({count})" section on Results page
- Red-themed toggle button
- Pre-formatted monospace text (`<pre>` tag)
- Max height: 192px with scroll overflow
- Errors joined by double newlines for readability
