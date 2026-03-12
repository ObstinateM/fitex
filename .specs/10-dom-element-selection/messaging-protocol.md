# Messaging Protocol

## Full Message Type Definition

```typescript
type Message =
  | { type: "START_SELECTION" }
  | { type: "STOP_SELECTION" }
  | { type: "CLEAR_SELECTIONS" }
  | { type: "DESELECT_ELEMENT"; payload: { id: string } }
  | { type: "PING" }
  | { type: "PONG" }
  | { type: "ELEMENT_SELECTED"; payload: { id: string; text: string } }
  | { type: "ELEMENT_DESELECTED"; payload: { id: string } }
  | { type: "FILL_FIELD"; payload: { id: string; value: string } }
  | { type: "FILL_RESULT"; payload: { id: string; success: boolean; error?: string } };
```

## Message Flow

### Side Panel → Content Script

| Message | Purpose |
|---------|---------|
| `START_SELECTION` | Activate selection mode (add event listeners) |
| `STOP_SELECTION` | Deactivate selection mode (remove event listeners) |
| `CLEAR_SELECTIONS` | Remove all visual selections |
| `DESELECT_ELEMENT` | Remove selection from specific element by ID |
| `FILL_FIELD` | Fill a form field near the element with a value |
| `PING` | Check if content script is injected |

### Content Script → Side Panel

| Message | Purpose |
|---------|---------|
| `ELEMENT_SELECTED` | User clicked an element (provides ID + extracted text) |
| `ELEMENT_DESELECTED` | User clicked a selected element to deselect it |
| `FILL_RESULT` | Result of a fill attempt (success/failure + error message) |
| `PONG` | Response to PING (confirms injection) |

## Transport Mechanism

### Side Panel → Content Script
```typescript
// lib/messaging.ts
async function sendToContentScript(message: Message): Promise<Message | undefined> {
  const tabId = await getActiveTabId();
  if (tabId === undefined) return undefined;
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    return undefined;
  }
}
```

Uses `chrome.tabs.sendMessage(tabId, message)` — targets the active tab specifically.

### Content Script → Side Panel
```typescript
chrome.runtime.sendMessage(message).catch(() => {});
```

Uses `chrome.runtime.sendMessage` — broadcasts to all extension pages.

### Side Panel Listener
```typescript
// lib/messaging.ts
function onMessage(callback): () => void {
  const listener = (message, sender, sendResponse) => {
    const result = callback(message, sender);
    if (result instanceof Promise) {
      result.then(r => sendResponse(r ?? undefined));
      return true; // keep channel open for async
    }
    if (result) sendResponse(result);
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}
```

Returns an `unlisten` function for cleanup in React useEffect.

### Content Script Listener

Uses `chrome.runtime.onMessage.addListener` with a switch statement on `message.type`. For `FILL_FIELD` and `PING`, returns `true` to keep the channel open for async `sendResponse`.

### DESELECT_ELEMENT Implementation

The `DESELECT_ELEMENT` message enables the side panel to programmatically remove a selection from the content script's tracking, keeping both sides in sync when the user removes an element from the side panel's list (rather than clicking it again on the page).

**Sender (Selector.tsx):**

```typescript
async function handleRemove(id: string) {
  setElements((prev) => prev.filter((el) => el.id !== id));
  await sendToContentScript({ type: "DESELECT_ELEMENT", payload: { id } });
}
```

The side panel first removes the element from its own React state, then sends the message to the content script.

**Receiver (content.ts):**

```typescript
case "DESELECT_ELEMENT": {
  const el = selectedEls.get(message.payload.id);
  if (el) {
    el.classList.remove("__cv_ext_selected");
    selectedEls.delete(message.payload.id);
  }
  break;
}
```

The content script looks up the DOM element by ID in its `selectedEls` Map. If found, it removes the green selection outline CSS class and deletes the entry from the Map. If the element is not found (e.g., the page navigated away), the message is silently ignored. This is a fire-and-forget message with no response — it does not return `true` for async `sendResponse`.

## Helper: `getActiveTabId`

```typescript
async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}
```
