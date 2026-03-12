# Selection Mode

## Toggle Button

- Located in Selector page
- States: "Select Elements" (gray, inactive) / "Selecting elements..." (green, pulsing dot)
- Disabled during generation

## Activation/Deactivation

**Activate**:
1. Inject content script (if not already)
2. Send `START_SELECTION` message
3. Content script adds event listeners: `mouseover`, `mouseout`, `click` (all with `capture: true`)

**Deactivate**:
1. Send `STOP_SELECTION` message
2. Content script removes event listeners
3. Clears hover state (removes `__cv_ext_hover` class)
4. Selected elements REMAIN visually marked (green outline persists)

## Smart Element Targeting (`findBestElement`)

When the user hovers/clicks an inline element, the content script walks up the DOM to find the nearest block-level parent. This prevents selecting individual words when the user likely wants the full paragraph, list item, or div.

### Complete inline tag list

The following 12 HTML tags are treated as inline and will bubble up to their parent:

| Tag | Element type |
|-----|-------------|
| `SPAN` | Generic inline container |
| `A` | Hyperlink |
| `STRONG` | Strong importance (bold) |
| `EM` | Emphasis (italic) |
| `B` | Bold text |
| `I` | Italic text |
| `U` | Underlined text |
| `CODE` | Inline code |
| `SMALL` | Small print |
| `SUB` | Subscript |
| `SUP` | Superscript |
| `MARK` | Highlighted text |

### Bubble-up algorithm

```typescript
function findBestElement(target: HTMLElement): HTMLElement {
  let el = target;
  while (el.parentElement && INLINE_TAGS.has(el.tagName)) {
    el = el.parentElement;
  }
  return el;
}
```

1. Start at the clicked/hovered element
2. Check if its `tagName` is in the `INLINE_TAGS` set
3. If yes **and** it has a parent, move up to the parent
4. Repeat until the current element is either not an inline tag or has no parent
5. Return the resulting element

This means nested inline elements (e.g., `<p><strong><em>text</em></strong></p>`) will bubble all the way up to the `<p>`. The algorithm stops at any non-inline element, including `DIV`, `P`, `LI`, `H1`-`H6`, `TD`, `SECTION`, etc.

### Text normalization

After selecting the best element, text is extracted via `extractText`:

```typescript
function extractText(el: HTMLElement): string {
  return (el.innerText || el.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}
```

- Prefers `innerText` (which respects visual rendering) over `textContent` (which includes hidden text)
- **Whitespace compression**: all sequences of whitespace characters (spaces, tabs, newlines) are collapsed to a single space via `/\s+/g`
- Leading and trailing whitespace is trimmed

## Hover Behavior

**mouseover** (capture phase):
1. Find best element via `findBestElement`
2. Remove `__cv_ext_hover` from previously hovered element
3. If target doesn't already have `__cv_ext_selected`, add `__cv_ext_hover`
4. Update `hoveredEl` reference

**mouseout** (capture phase):
1. Remove `__cv_ext_hover` from hovered element
2. Clear `hoveredEl` reference

## Click Behavior

**click** (capture phase):
1. `preventDefault()` + `stopPropagation()` — prevents navigation
2. Find best element
3. Remove hover class

**If element is already selected** (found in `selectedEls` map):
- Remove `__cv_ext_selected` class
- Delete from map
- Send `ELEMENT_DESELECTED` message: `{ type: "ELEMENT_DESELECTED", payload: { id } }`

**If element is new**:
- Generate ID: `crypto.randomUUID()`
- Add `__cv_ext_selected` class
- Store in `selectedEls` map: `Map<string, HTMLElement>`
- Send `ELEMENT_SELECTED` message: `{ type: "ELEMENT_SELECTED", payload: { id, text } }`

## Text Extraction

```typescript
function extractText(el: HTMLElement): string {
  return (el.innerText || el.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}
```

Collapses all whitespace to single spaces for clean text.

## Clear All

Removes `__cv_ext_selected` class from all elements and clears the map. Triggered by `CLEAR_SELECTIONS` message.
