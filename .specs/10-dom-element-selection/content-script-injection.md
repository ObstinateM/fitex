# Content Script Injection

## Registration

```typescript
defineContentScript({
  matches: ["<all_urls>"],
  registration: "runtime",  // NOT injected at page load
  main() { ... }
})
```

The `runtime` registration means the script is only injected when explicitly triggered via `chrome.scripting.executeScript`.

## Injection Flow (in Selector.tsx)

```
1. getActiveTabId() → chrome.tabs.query({ active: true, currentWindow: true })
2. Check if already injected:
   - Send PING message to content script
   - If PONG received → already injected, return true
3. If not injected:
   - chrome.scripting.executeScript({ target: { tabId }, files: ["content-scripts/content.js"] })
   - Return true on success, false on failure
4. On failure:
   - Status message: "Cannot inject on this page. Try a regular webpage."
   - Clears after 3 seconds
```

## Style Injection

Styles are injected once into the page (guarded against duplicates):

```css
/* ID: "__cv_ext_styles" */
.__cv_ext_hover {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
  cursor: crosshair !important;
}
.__cv_ext_selected {
  outline: 2px solid #22c55e !important;
  outline-offset: 2px !important;
  background-color: rgba(34, 197, 94, 0.08) !important;
}
```

Guard: `if (!document.getElementById(STYLE_ID))` prevents duplicate style tags on re-injection.

## Pages Where Injection Fails

- `chrome://` pages
- `chrome-extension://` pages
- Chrome Web Store pages
- Other restricted URLs
- These result in `chrome.scripting.executeScript` throwing an error
