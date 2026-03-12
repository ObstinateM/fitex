# Utility Functions

## Overview

Shared utility functions live in the `utils/` directory at the project root and are imported via the `@/utils/` path alias.

## `truncate(text, maxLength)`

**File**: `utils/text.ts`

Truncates a string to a maximum length, appending an ellipsis character if truncation occurs.

### Signature

```typescript
export function truncate(text: string, maxLength: number): string
```

### Behavior

- If `text.length <= maxLength`, returns the original string unchanged
- Otherwise, returns the first `maxLength - 1` characters followed by a Unicode ellipsis (`\u2026`, i.e., `...` as a single character)
- The result is always at most `maxLength` characters long (the ellipsis counts as one character)

### Implementation

```typescript
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "\u2026";
}
```

### Usage

Used in `ElementItem` component (`entrypoints/sidepanel/components/ElementItem.tsx`) to truncate selected element text for display:

```typescript
import { truncate } from "@/utils/text";

// In the component render:
{truncate(element.text, 120)}
```

This prevents long DOM text selections from overflowing the element list UI. The 120-character limit provides enough context for the user to identify the selected element while keeping the list compact.
