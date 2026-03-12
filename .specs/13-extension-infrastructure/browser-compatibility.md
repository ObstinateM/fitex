# Browser Compatibility

## Dual-Mode Architecture

The extension supports two rendering modes depending on whether the browser provides the `chrome.sidePanel` API. Both modes render the identical `App` component from `entrypoints/sidepanel/App.tsx`.

## Primary: Chrome Side Panel API

Used when `chrome.sidePanel` is available (Chrome 114+).

### Configuration (in `entrypoints/background.ts`)

```typescript
chrome.sidePanel.setOptions({ path: "sidepanel.html" });
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
```

### Behavior

- Clicking the extension's toolbar icon opens the side panel
- The side panel renders `entrypoints/sidepanel/main.tsx`, which mounts the `App` component
- The panel persists alongside the current page, allowing simultaneous interaction with page content

### Entrypoint

`entrypoints/sidepanel/main.tsx`:
```typescript
import App from "./App";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

## Fallback: Persistent Popup Window

Used when `chrome.sidePanel` is not available (older Chrome versions, other Chromium browsers).

### Configuration (in `entrypoints/background.ts`)

```typescript
chrome.action.setPopup({ popup: "" }); // Clears any default popup
```

This prevents the default popup behavior so the `onClicked` listener can be used instead.

### Behavior

1. On toolbar icon click: creates a popup window via `chrome.windows.create`
   - URL: `chrome.runtime.getURL("/popup.html")`
   - Type: `"popup"`
   - Size: 420px wide x 700px tall
2. Tracks `panelWindowId` to prevent duplicate windows
   - If a window already exists, focuses it instead of creating a new one
   - If focusing fails (window was closed externally), clears the ID and creates a new window
3. Cleans up `panelWindowId` via `chrome.windows.onRemoved` listener

### Window Management Logic

```typescript
let panelWindowId: number | undefined;

chrome.action.onClicked.addListener(async () => {
  if (panelWindowId !== undefined) {
    try {
      await chrome.windows.update(panelWindowId, { focused: true });
      return;
    } catch {
      panelWindowId = undefined;
    }
  }

  const win = await chrome.windows.create({
    url: chrome.runtime.getURL("/popup.html"),
    type: "popup",
    width: 420,
    height: 700,
  });
  panelWindowId = win.id;
});

chrome.windows.onRemoved.addListener((id) => {
  if (id === panelWindowId) panelWindowId = undefined;
});
```

### Entrypoint

`entrypoints/popup/main.tsx`:
```typescript
import App from "../sidepanel/App";
import "../sidepanel/styles/tailwind.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Note that the popup entrypoint imports `App` from the sidepanel directory and also reuses the sidepanel's Tailwind CSS stylesheet. This ensures both modes are visually and functionally identical.

### Popup Window Dimensions

The popup window is sized at **420px wide by 700px tall**, matching the typical side panel width and providing enough vertical space for the full CV Assistant workflow without scrolling in most cases.

### Persistent Popup Window Tracking

The service worker maintains a `panelWindowId` variable (scoped inside the `else` block) to track the currently open popup window:

- **On toolbar click**: Checks if `panelWindowId` is defined. If yes, attempts to focus the existing window via `chrome.windows.update(panelWindowId, { focused: true })`. If focusing fails (e.g., the window was closed by the OS or user without triggering the `onRemoved` listener), the catch block clears `panelWindowId` and a new window is created.
- **Auto-focus on re-click**: If the popup window is already open and valid, clicking the toolbar icon simply brings it to the front rather than opening a duplicate. This prevents the user from accidentally spawning multiple instances.
- **Window close listener cleanup**: A `chrome.windows.onRemoved` listener checks whether the closed window's ID matches `panelWindowId`. If it does, `panelWindowId` is reset to `undefined`, so the next toolbar click creates a fresh window.

### Popup Entrypoint Details

The popup entrypoint consists of two files:

1. **`entrypoints/popup/index.html`** — Minimal HTML shell with a `<div id="root">` mount point and a `<script>` tag loading `main.tsx`.
2. **`entrypoints/popup/main.tsx`** — Imports `App` from `../sidepanel/App` and the sidepanel's Tailwind CSS, then mounts the React app using `ReactDOM.createRoot`. Rendered inside `React.StrictMode`, identical to the sidepanel entrypoint.

Because the popup reuses the exact same `App` component and stylesheet, there is zero code duplication between the two rendering modes. All features (onboarding, selection, generation, history, settings) work identically in both.

## Detection Logic

The background service worker uses a simple feature-detection check:

```typescript
if (chrome.sidePanel) {
  // Side panel path
} else {
  // Popup window fallback path
}
```

There is no user-facing setting to switch between modes. The mode is determined entirely by browser capability at runtime.

## Comparison

| Aspect | Side Panel | Popup Window |
|---|---|---|
| API required | `chrome.sidePanel` (Chrome 114+) | `chrome.windows`, `chrome.action` |
| Window type | Docked side panel | Separate popup window |
| Size | Browser-controlled | 420x700px |
| Persistence | Persists across page navigation | Persists until closed |
| App component | Same (`App`) | Same (`App`) |
| Stylesheet | `sidepanel/styles/tailwind.css` | Same (imported from sidepanel) |
| Interaction with page | Side-by-side | Overlapping window |
