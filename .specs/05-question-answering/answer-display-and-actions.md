# Answer Display and Actions

## AnswerCard Component

Each question-answer pair is rendered in a card.

### Layout
- **Question**: Purple text, prefixed with "Q: "
- **Answer**: Gray text, whitespace preserved (`white-space: pre-wrap`)
- **Action buttons**: row at the bottom

### Copy Button
- Managed by a `copied` boolean state (`useState(false)`)
- On click, calls `navigator.clipboard.writeText(item.answer)`
- On success: sets `copied` to `true`, then resets to `false` after 2 seconds via `setTimeout`
- Button label toggles reactively: renders `"Copied!"` when `copied` is true, `"Copy"` otherwise
- **Error handling**: the `catch` block is empty - clipboard write failures (e.g., document not focused, permissions denied) are silently swallowed with no user-visible feedback; the button simply stays as "Copy"

### Fill Button
- Only shown if the answer has an `elementId` AND `onFill` callback exists
- Sends a message to the content script to auto-fill the form field
- Status tracking with labels:

| State | Label | Color |
|-------|-------|-------|
| idle | "Fill" | Purple |
| filling | "Filling..." | Purple (disabled) |
| success | "Filled!" | Green |
| error | "Failed" | Red |

- Resets to idle after 2 seconds

### Fill Mechanism
```typescript
sendToContentScript({
  type: "FILL_FIELD",
  payload: { id: elementId, value: answer }
})
```
Waits for `FILL_RESULT` response with `{ id, success, error? }`.

## Fill All Button

- Shown above the answer list when there are fillable answers (answers with `elementId`)
- Iterates sequentially through all fillable answers
- Label: "Fill All" → "Filling..."
- Calls `fillField(elementId, answer)` for each answer in order

## Data Model

```typescript
interface AnswerItem {
  question: string;
  answer: string;
  elementId?: string;  // Present when the question came from a selected page element
}
```
