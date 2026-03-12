# Response Parsing -- Markdown Fence Stripping

## What

AI-generated LaTeX and JSON responses are cleaned by stripping markdown code fences before further processing. This applies to every AI response that returns raw content (LaTeX source or JSON data).

## Why

OpenAI models frequently wrap code output in markdown code fences (e.g., ` ```latex ... ``` ` or ` ```json ... ``` `), even when the prompt asks for raw content. If these fences are left in place:
- LaTeX compilation would fail because ` ``` ` is not valid LaTeX syntax
- JSON parsing would fail because the fences are not valid JSON

## Regex Patterns

### LaTeX fence stripping

Used after streaming CV tailoring, feedback refinement, and page reduction responses:

```javascript
modifiedTex = modifiedTex
  .replace(/^```(?:latex|tex)?\n?/, "")
  .replace(/\n?```\s*$/, "")
  .trim();
```

- **Opening fence**: `/^```(?:latex|tex)?\n?/` -- matches ` ``` `, ` ```latex `, or ` ```tex ` at the start of the string, optionally followed by a newline
- **Closing fence**: `/\n?```\s*$/` -- matches ` ``` ` at the end of the string, optionally preceded by a newline and followed by trailing whitespace
- **`.trim()`** removes any remaining leading/trailing whitespace

### JSON fence stripping

Used after keyword scan, salary estimate, and story import responses:

```javascript
const parsed = JSON.parse(
  raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```\s*$/, "").trim()
);
```

- **Opening fence**: `/^```(?:json)?\n?/` -- matches ` ``` ` or ` ```json ` at the start
- **Closing fence**: `/\n?```\s*$/` -- same as LaTeX pattern
- Result is passed directly to `JSON.parse()`

## Locations in Code

The fence stripping pattern appears in multiple places:

### `Selector.tsx`
- **Line 74**: Pre-scan keyword analysis (JSON fences)
- **Line 298**: Before-scan keyword analysis (JSON fences)
- **Line 322**: CV tailoring stream result (LaTeX fences)
- **Line 330**: After-scan keyword analysis (JSON fences)
- **Line 377**: Salary estimate response (JSON fences)

### `Results.tsx`
- **Line 95**: Feedback refinement stream result (LaTeX fences)
- **Line 117**: Re-scan keywords after refinement (JSON fences)
- **Line 219**: Reduce-to-one-page stream result (LaTeX fences)

## Design Notes

- The stripping is applied unconditionally -- if no fences are present, the regexes match nothing and the content passes through unchanged
- The non-capturing group `(?:latex|tex)?` / `(?:json)?` allows for an optional language identifier after the triple backticks
- Both opening and closing patterns handle the presence or absence of adjacent newlines
