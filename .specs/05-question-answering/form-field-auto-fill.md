# Form Field Auto-Fill

## Overview

When the user clicks "Fill" on an answer, the content script finds the nearest fillable form field to the selected element and fills it with the answer text. This works even with React-controlled inputs.

## Finding the Form Field (`findFormField`)

The algorithm uses 6 strategies, tried in order. It returns the first match found. Each strategy progressively searches further from the selected DOM element.

### Strategy 1: Element itself
If the selected element directly matches the fillable selector, use it. This covers cases where the user clicked directly on an input or textarea.

### Strategy 2: Label `for` attribute matching
If the element is a `<label>` tag, read its `for` attribute and look up the target element by `document.getElementById(forId)`. If found and it matches the fillable selector, return it. This handles the standard HTML pattern of `<label for="field-id">Question text</label><input id="field-id">`.

### Strategy 3: Fillable child
Run `el.querySelector(FILLABLE_SELECTOR)` within the selected element. This handles wrapper elements that contain the input (e.g., `<div>Question<input></div>`).

### Strategy 4: Next siblings (up to 3)
Walk through up to 3 `nextElementSibling` elements. For each sibling, first check if the sibling itself matches, then check its descendants via `querySelector`. This handles layouts where the question label and input are adjacent siblings.

### Strategy 5: Ancestor siblings (up to 4 levels up, 2 siblings each)
Walk up the DOM tree through up to 4 `parentElement` levels. At each ancestor level, check up to 2 `nextElementSibling` elements (and their descendants). This handles complex form layouts where the input is in a separate container at a higher DOM level.

### Strategy 6: `aria-labelledby` reverse lookup
If the selected element has an `id`, search the document for `[aria-labelledby="{id}"]` using `CSS.escape` for safe selector construction. This handles accessible form patterns where the input references its label via `aria-labelledby` rather than the label using `for`.

### Fillable Selector
```css
input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]),
textarea,
[contenteditable="true"]
```

This selector matches text-entry fields while excluding non-text inputs (hidden, submit, button, checkbox, radio). It also includes `contenteditable="true"` divs, which are used as rich text editors in many web applications (e.g., Google Docs, Notion, Slack).

## Filling the Field (`fillField`)

### Contenteditable Elements
For `[contenteditable="true"]` divs:
```javascript
field.textContent = value;
field.dispatchEvent(new Event("input", { bubbles: true }));
field.dispatchEvent(new Event("change", { bubbles: true }));
```
These elements are not standard form inputs, so `textContent` is used directly.

### Input / Textarea Elements (Native React value setter bypass)
Uses the **native property setter** to bypass React's synthetic event handlers:
```javascript
const proto = field instanceof HTMLTextAreaElement
  ? HTMLTextAreaElement.prototype
  : HTMLInputElement.prototype;
const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

if (nativeSetter) {
  nativeSetter.call(field, value);
} else {
  field.value = value;  // fallback
}

field.dispatchEvent(new Event("input", { bubbles: true }));
field.dispatchEvent(new Event("change", { bubbles: true }));
field.dispatchEvent(new Event("blur", { bubbles: true }));
```

**Why native setter?** React (and similar frameworks) override the `value` property setter on input elements using `Object.defineProperty`. When you do `field.value = "text"`, React's intercepted setter runs, but it doesn't trigger React's internal state reconciliation. By retrieving the original native setter from `HTMLInputElement.prototype` (or `HTMLTextAreaElement.prototype`) via `Object.getOwnPropertyDescriptor`, and calling it directly with `.call(field, value)`, the value is set at the DOM level. The subsequent dispatched `input`, `change`, and `blur` events then trigger React's synthetic event system to recognize the change. The `blur` event (not dispatched for contenteditable) ensures frameworks that validate on blur also pick up the value.

## Visual Feedback (`flashField`)

After successfully filling a field, the `flashField` function provides a momentary visual confirmation:
```javascript
function flashField(field: HTMLElement) {
  const prev = field.style.outline;
  field.style.outline = "2px solid #3b82f6";
  setTimeout(() => { field.style.outline = prev; }, 1000);
}
```

- Saves the field's current outline style
- Applies a 2px solid blue (`#3b82f6`) outline
- Restores the original outline after **1 second**
- This gives the user clear feedback about which field was filled, especially useful with the "Fill All" bulk action

## Message Protocol

```
Side Panel → Content Script:
  { type: "FILL_FIELD", payload: { id: elementId, value: answerText } }

Content Script → Side Panel:
  { type: "FILL_RESULT", payload: { id, success: true } }
  { type: "FILL_RESULT", payload: { id, success: false, error: "Element no longer on page" } }
  { type: "FILL_RESULT", payload: { id, success: false, error: "No form field found near element" } }
```

## Side Panel Error Handling

The side panel does **not** display any UI feedback for failed fills. The `fillField` helper returns a boolean:
- `true` → success (content script found and filled the field)
- `false` → failure (element gone, no field found, or no response)

For the "Fill All" action, failures are silently skipped - the loop continues to the next answer regardless of individual fill results. There is no toast, alert, or error message shown to the user on fill failure.

## Webapp Adaptation Notes

- This feature is Chrome extension-specific (content script injection)
- In a webapp, auto-fill could be replaced with:
  - Clipboard copy (already available)
  - Direct integration with application platforms via APIs
  - Browser extension companion for form filling
- The React-compatible filling technique is valuable knowledge for any browser automation
