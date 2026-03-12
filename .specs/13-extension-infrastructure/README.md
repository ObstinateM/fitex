# Extension Infrastructure

## Overview

This is a Chrome MV3 browser extension built with [WXT](https://wxt.dev/) + React 19 + Tailwind CSS v4. It provides a side panel UI for tailoring LaTeX CVs to job descriptions using OpenAI.

There is no backend. All state lives in `chrome.storage.local`. API calls go directly to OpenAI (for AI generation) and to `https://latex.ytotech.com/builds/sync` (for LaTeX compilation).

## Entrypoints

WXT convention: each file or folder in `entrypoints/` becomes a separate bundle.

| Entrypoint | File | Role |
|---|---|---|
| **Background** | `entrypoints/background.ts` | Service worker. Configures sidePanel behavior or sets up popup-window fallback for browsers without sidePanel support. |
| **Content script** | `entrypoints/content.ts` | Injected on demand (not at page load) via `chrome.scripting.executeScript`. Handles interactive DOM element selection with hover/selected CSS classes, sends `ELEMENT_SELECTED`/`ELEMENT_DESELECTED` messages to the side panel, supports form-field auto-fill, and listens for commands (`START_SELECTION`, `STOP_SELECTION`, `CLEAR_SELECTIONS`, `DESELECT_ELEMENT`, `FILL_FIELD`, `PING`). |
| **Side panel** | `entrypoints/sidepanel/` | The main React app. Renders in the Chrome side panel (or popup window on unsupported browsers). |
| **Popup** | `entrypoints/popup/main.tsx` | Fallback entrypoint that renders the same `App` component as the side panel, used when browsers lack sidePanel API support. |

## Path Alias

`@/` maps to the project root (configured in WXT). Use `@/lib/...` for imports from the `lib/` directory.

## Library Modules (`lib/`)

| Module | Purpose |
|---|---|
| `types.ts` | All shared TypeScript types. The discriminated union `Message` defines all content script <-> side panel message contracts. |
| `messaging.ts` | Wrappers around `chrome.runtime`/`chrome.tabs` messaging. `sendToContentScript` targets the active tab; `onMessage` returns an unlisten function. |
| `storage.ts` | Thin wrappers over `chrome.storage.local`. Provides typed get/set functions for all storage keys. |
| `openai.ts` | Direct `fetch` to OpenAI API. `streamChatCompletion` handles SSE streaming; `chatCompletion` is non-streaming. Includes `friendlyApiError` for user-facing HTTP error messages. |
| `latex.ts` | Sends compiled LaTeX to the external compilation service. Template zip is stored as `TexTemplate` with `mainContent` and `auxFiles`. Parses `!`-prefixed lines from LaTeX error logs. |
| `prompts.ts` | Prompt builders for CV tailoring, question answering, keyword scanning, salary estimation, match scoring, one-page reduction, and feedback refinement. |
| `stories.ts` | Story relevance filtering via AI. Sends story summaries + job description to determine which professional stories are relevant. |
| `importStories.ts` | Bulk story import via AI parsing of free-form text. |

## Build Commands

```bash
npm run dev        # Start dev server with hot reload (loads as unpacked extension)
npm run build      # Production build -> .output/chrome-mv3/
npm run zip        # Build and zip for distribution
npm run postinstall # wxt prepare (run after npm install)
```

No test runner is configured.

## Key Architectural Decisions

1. **No backend** -- all state is local, API keys are stored in extension storage (not synced), and all external calls go directly from the browser.
2. **On-demand content script** -- the content script is not injected at page load. It is injected via `chrome.scripting.executeScript` only when the user activates element selection, reducing permissions footprint.
3. **Popup fallback** -- browsers without `chrome.sidePanel` get a persistent popup window (420x700px) that renders the same `App` component. Both `sidepanel/main.tsx` and `popup/main.tsx` import and render `App` from the same source.
4. **SSE streaming** -- CV tailoring uses streamed responses from OpenAI for progressive output, while non-streaming calls are used for keyword scans, salary estimates, and question answers.
5. **Non-critical features degrade gracefully** -- keyword scans, salary estimation, and pre-scan are all wrapped in try/catch with silent failure, so the core CV generation and question-answering flow is never blocked by ancillary feature errors.
