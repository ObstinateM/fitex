# Element Tagging

## Overview

Selected elements arrive in the side panel and can be tagged as either "job-description" or "question". Each element also supports optional per-element guidance text.

## Default Tag

All new elements default to `"job-description"`.

## Two Tag Types

### job-description (Blue badge)
- Text used as job description context for CV tailoring
- Per-element guidance placeholder: "Any specific focus for this element? (optional)"
- Focus border color: blue
- Multiple job-description elements are concatenated with `\n\n` for the prompt

### question (Purple badge)
- Text treated as an application question to be answered
- Per-element guidance placeholder: "How should this question be answered? (optional)"
- Focus border color: purple
- Each question gets its own separate API call

## Per-Element Guidance

Each element has a textarea for optional guidance text, rendered inside the `ElementItem` component below the tag selector and text preview.

### UI

- **Component**: `ElementItem.tsx` renders a `<textarea>` with 2 rows, no resize, bound to `element.guidance`
- **Placeholder text** is tag-dependent:
  - `"job-description"`: "Any specific focus for this element? (optional)"
  - `"question"`: "How should this question be answered? (optional)"
- **Border color** on focus is tag-dependent: blue for job-description, purple for question
- **Callback**: `onGuidanceChange(id, guidance)` propagates changes up to Selector state via `handleElementGuidanceChange`, which updates the `guidance` field on the matching `SelectedElement`

### How guidance flows into prompts

- **For job-description elements**: When building the job description string for the CV tailoring prompt, each element's text is concatenated. If guidance is present, it is appended as `[Focus note: {guidance}]` after the element text:
  ```typescript
  el.guidance ? `${el.text}\n\n[Focus note: ${el.guidance}]` : el.text
  ```
  This pattern is used in both the generation flow (`Selector.tsx` line 254) and the pre-scan keyword analysis (line 69).

- **For question elements**: The element's `guidance` field is passed as the `questionGuidance` parameter to `buildQuestionAnswerPrompt`. This is intentionally separate from the global guidance text -- the global guidance controls CV tailoring instructions, while per-question guidance controls how individual questions are answered. The prompt builder includes it as a `[question_guidance]` section.

## Element Item UI

Each selected element card shows:
1. **Tag selector** (dropdown): "Job Description" / "Question" - colored badge
2. **Text preview**: truncated to 120 characters
3. **Remove button** (X icon): removes from list + sends `DESELECT_ELEMENT` to content script
4. **Guidance textarea** (2 rows): optional per-element notes

## Element List

- Shows "No elements selected yet. Click elements on the page to select them." when empty
- Elements rendered in selection order

## Data Model

```typescript
type ElementTag = "job-description" | "question";

interface SelectedElement {
  id: string;         // UUID matching the content script's selectedEls map
  text: string;       // Extracted text from the DOM element
  tag: ElementTag;    // User-assigned tag
  guidance?: string;  // Optional per-element guidance
}
```

## Text Truncation

Element text displayed via `truncate(text, 120)`:
```typescript
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "...";
}
```
