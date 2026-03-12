# History List

## Overview

The History page displays all saved generations with metadata badges and action buttons.

## States

### Loading
- Centered spinner while fetching from storage

### Empty
- Document icon
- "No history yet"
- "Generated CVs will appear here"

### Populated
- List of entry cards (newest first)
- "Clear all" button in header

## Entry Card Layout

### Date/Time
```typescript
new Date(entry.createdAt).toLocaleDateString(undefined, {
  month: "short", day: "numeric", year: "numeric",
  hour: "2-digit", minute: "2-digit"
})
```

### Badges (top-right)

**ATS Pass Rate** (if `keywordScanAfter.atsPassRate` exists):
- Green: ≥75%
- Yellow: ≥50%
- Red: <50%
- Format: "ATS {rate}%"

**Answer Count** (if answers > 0):
- Purple badge
- Format: "{count} answer(s)"

### Job Description
- First 200 characters, 2-line clamp (`line-clamp-2`)
- Or "No job description" if empty

### Action Buttons

| Button | Style | Action |
|--------|-------|--------|
| View | Blue filled | Opens Results page with saved data |
| Re-run | Blue outlined | Returns to Selector with saved elements/guidance |
| Delete | Gray → Red on confirm | Two-click delete |

## Delete Confirmation Pattern

Both delete actions use a double-click confirmation pattern -- a first click arms the action, and a second click executes it. This prevents accidental data loss without requiring a modal dialog.

### Delete Single Entry (`deletingId` state)

State variable: `deletingId: string | null` -- tracks which entry is armed for deletion.

1. **First click**: `handleDelete(id)` checks `deletingId !== id`. Since it doesn't match, it sets `deletingId = id` and returns early. The button label changes from "Delete" (gray border) to "Confirm?" (red border, red background).
2. **Second click**: `handleDelete(id)` checks `deletingId !== id`. Since it matches this time, it calls `deleteHistoryEntry(id)`, removes the entry from the local `entries` array, and resets `deletingId` to `null`.
3. **Blur escape**: an `onBlur` handler on the button resets `deletingId` to `null`, so if the user clicks elsewhere the confirmation is cancelled and the button reverts to "Delete".

### Clear All (`confirmClear` state)

State variable: `confirmClear: boolean` -- tracks whether the clear-all action is armed.

1. **First click**: `handleClearAll()` checks `!confirmClear`. Since it's false, sets `confirmClear = true` and returns early. Button label changes from "Clear all" to "Confirm clear all?".
2. **Second click**: `handleClearAll()` checks `!confirmClear`. Since it's now true, calls `clearHistory()` which removes the entire `cv_history` key from storage, resets the local `entries` to an empty array, and sets `confirmClear = false`.

Note: Unlike the single delete button, the Clear All button does not have a blur handler to reset the confirmation state.

## Date Formatting

Each entry's `createdAt` timestamp is formatted using `toLocaleDateString` with both date and time options:

```typescript
new Date(entry.createdAt).toLocaleDateString(undefined, {
  month: "short",   // e.g., "Mar"
  day: "numeric",   // e.g., "11"
  year: "numeric",  // e.g., "2026"
  hour: "2-digit",  // e.g., "02" or "14"
  minute: "2-digit" // e.g., "30"
})
```

- The first argument `undefined` uses the browser's default locale
- Despite the method name `toLocaleDateString`, passing `hour` and `minute` options causes it to include time as well
- Example output (en-US locale): "Mar 11, 2026, 02:30 PM"
