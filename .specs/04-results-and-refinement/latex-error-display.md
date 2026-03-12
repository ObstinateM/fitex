# LaTeX Error Display

## Overview

Expandable section showing LaTeX compilation errors when PDF generation fails or produces warnings.

## UI

- Red-themed toggle button: "LaTeX Errors ({count})"
- Triangle expand indicator
- Only shown when `result.latexErrors.length > 0`

### Expanded Content
- `<pre>` block with monospace formatting
- Max height: 192px with scroll overflow
- Red background tint
- Errors joined by double newlines

## Error Parsing

Errors are parsed from the LaTeX compilation service's log output by `parseLatexErrors`:

1. Split log by newlines
2. Lines starting with `!` are treated as errors
3. Each error includes the `!` line + the next line for context
4. If no `!` lines found but compilation failed: raw text or `"Compilation failed (HTTP {status})"`
