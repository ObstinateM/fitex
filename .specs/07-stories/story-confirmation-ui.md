# Story Confirmation UI

## Overview

Before generation proceeds, the user reviews and confirms which stories to include. The AI pre-selects relevant stories, but the user has full control.

## Component: StoryConfirmation

Blue-themed card displayed in the Selector page during the confirmation step.

## Layout

### Header
"Stories selected for this job ({checked count})"

### AI-Selected Stories
- Checkboxes (checked by default)
- Story title in bold
- Relevance reason text below (from AI filter)

### Other Stories
- Section header: "Other stories"
- Checkboxes (unchecked by default)
- Story title only (no reason)

### Action Buttons
- **"Confirm & Generate"** (blue) - proceeds with checked story IDs
- **"Cancel"** - aborts generation entirely

## Promise-Based Flow

The confirmation uses a Promise to pause generation:

```typescript
// In Selector.tsx generate():
const confirmedIds = await new Promise<string[] | null>((resolve) => {
  setStoryConfirmation({ stories: allStories, selections, resolve });
});
setStoryConfirmation(null);

if (confirmedIds === null) {
  // User cancelled - abort generation
  return;
}

// Filter full story objects by confirmed IDs
const confirmedSet = new Set(confirmedIds);
selectedStories = allStories.filter(s => confirmedSet.has(s.id));
```

## State Management

- `checked` state: `Set<string>` initialized from AI-selected IDs
- `toggle(id)`: adds or removes ID from the set
- On confirm: resolves Promise with `Array.from(checked)`
- On cancel: resolves Promise with `null`

## Visual Grouping

Stories are split into two groups using array filtering on the AI selection results:

```typescript
const selectedIdSet = new Set(selections.map((s) => s.id));
const reasonMap = new Map(selections.map((s) => [s.id, s.reason]));

const picked = stories.filter((s) => selectedIdSet.has(s.id));
const rest = stories.filter((s) => !selectedIdSet.has(s.id));
```

### Group 1: "Selected" Stories (`picked`)

- Contains stories whose IDs appear in the AI's `StorySelection[]` results
- Rendered first in the card, with no section header (they are the primary content)
- Each story shows:
  - A **checkbox** (pre-checked, since these were AI-selected)
  - The **story title** in bold (`font-medium text-gray-900`)
  - A **relevance reason** in gray text below the title (`text-xs text-gray-500`), pulled from the `reasonMap`. This explains why the AI selected this story for the current job.

### Group 2: "Other" Stories (`rest`)

- Contains all stories that the AI did NOT select as relevant
- Rendered below the selected group, preceded by a **section header**: "Other stories" (`text-xs font-medium text-gray-500`)
- Each story shows:
  - A **checkbox** (unchecked by default, since the AI deemed them less relevant)
  - The **story title** only (`text-sm text-gray-700`), without a relevance reason
- This group is only rendered if `rest.length > 0`

### User Interaction

The user can toggle any story in either group. The `checked` state is a `Set<string>` initialized from the AI-selected IDs, so:
- Unchecking a "selected" story removes it from generation
- Checking an "other" story adds it to generation, overriding the AI's recommendation

The header dynamically shows the current count: "Stories selected for this job ({checked.size})", updating as the user toggles checkboxes.
