# Story Management

## Overview

CRUD operations for professional stories. Accessed from Settings → "Manage Stories".

## Stories Page

### Header
- Back arrow → returns to Settings
- Title: "Stories"
- "+ Add" button (toggles to "Cancel")

### Add Story Form

Inline form revealed by clicking "+ Add":

- **Title** input (required)
- **Description** textarea (4 rows) - "Describe what you did, how you did it, and why it mattered..."
- **Tags** input - comma-separated, e.g., "Python, Leadership, AWS"
- **"Add Story"** button (disabled if title empty)
- **"Enhance"** button - AI polish (see [story-enhancement.md](./story-enhancement.md))

On add:
1. Creates `Story` object with `crypto.randomUUID()` and `Date.now()` timestamps
2. Saves via `addStory()` (prepends to array in storage)
3. Prepends to local state
4. Clears form and hides it

### Story List

Expandable cards:

**Collapsed state**:
- Expand arrow (chevron, rotates on expand)
- Title (truncated)
- Tag pills (purple)

**Expanded state**:
- Full description (whitespace preserved)
- Or "No description" in italic gray if empty
- Action buttons: Edit, Delete

### Edit Mode

Inline editing (replaces expanded content):
- Title input
- Description textarea (4 rows)
- Tags input (comma-separated)
- Buttons: Save, Enhance, Cancel

Save calls `updateStory(id, updates)` which merges updates and sets `updatedAt = Date.now()`.

### Delete

Two-click confirmation:
1. First click: button changes to "Confirm Delete" (red)
2. Second click: executes `deleteStory(id)`

### Empty State

Book icon + "No stories yet" + "Add your professional stories to help the AI tailor your CV."

### Footer

"{count} story/stories" text centered at bottom.

## Storage Functions

```typescript
getStories(): Promise<Story[]>                    // Default: []
addStory(story: Story): Promise<void>             // Prepends to array
updateStory(id, updates): Promise<void>           // Merge + update timestamp
deleteStory(id: string): Promise<void>            // Filter by ID
addStories(newStories: Story[]): Promise<void>    // Prepend array (bulk import)
```

## Tag Parsing

Tags are parsed from comma-separated input:
```typescript
input.split(",").map(t => t.trim()).filter(Boolean)
```
