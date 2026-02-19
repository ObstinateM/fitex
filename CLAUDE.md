# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with hot reload (loads as unpacked extension)
npm run build      # Production build → .output/chrome-mv3/
npm run zip        # Build and zip for distribution
npm run postinstall # wxt prepare (run after npm install)
```

No test runner is configured.

## Architecture

This is a Chrome MV3 browser extension built with [WXT](https://wxt.dev/) + React 19 + Tailwind CSS v4. It provides a side panel UI for tailoring LaTeX CVs to job descriptions using OpenAI.

### Entrypoints (`entrypoints/`)

WXT convention: each file/folder here becomes a separate bundle.

- **`background.ts`** — Service worker. Only sets `openPanelOnActionClick` so the side panel opens when the toolbar icon is clicked.
- **`content.ts`** — Injected on demand (not at page load) via `chrome.scripting.executeScript`. Handles interactive DOM element selection: adds hover/selected CSS classes (`__cv_ext_hover`, `__cv_ext_selected`), sends `ELEMENT_SELECTED`/`ELEMENT_DESELECTED` messages to the side panel, and listens for `START_SELECTION`/`STOP_SELECTION`/`CLEAR_SELECTIONS`/`PING` commands.
- **`sidepanel/`** — The React app rendered in the Chrome side panel.

### Side Panel App Flow (`entrypoints/sidepanel/`)

Three-page flow managed by `App.tsx` with a `Page` type (`"onboarding" | "selector" | "results"`):

1. **Onboarding** (`pages/Onboarding.tsx`) — First-run setup: collects OpenAI API key, uploads `.zip` LaTeX template, sets compiler and model. Writes to `chrome.storage.local` via `lib/storage.ts`.
2. **Selector** (`pages/Selector.tsx`) — Main workflow: toggles content script selection mode, collects selected page elements (tagged as `"job-description"` or `"question"`), accepts optional guidance text, then runs generation:
   - Step 1: Stream CV tailoring via OpenAI (strips markdown fences from response).
   - Step 2: Compile modified LaTeX via `https://latex.ytotech.com/builds/sync`.
   - Step 3: Answer application questions in parallel via OpenAI.
3. **Results** (`pages/Results.tsx`) — Shows the compiled PDF preview (`PdfViewer`) and question answers (`AnswerCard`).

### Library (`lib/`)

- **`types.ts`** — All shared TypeScript types. The discriminated union `Message` defines all content script ↔ side panel message contracts.
- **`messaging.ts`** — Wrappers around `chrome.runtime`/`chrome.tabs` messaging. `sendToContentScript` targets the active tab; `onMessage` returns an unlisten function.
- **`storage.ts`** — Thin wrappers over `chrome.storage.local`. Keys: `openai_api_key`, `tex_template`, `latex_compiler`, `openai_model`, `is_onboarded`, `user_context`.
- **`openai.ts`** — Direct `fetch` to OpenAI API. `streamChatCompletion` handles SSE streaming; `chatCompletion` is non-streaming.
- **`latex.ts`** — Sends compiled LaTeX to `https://latex.ytotech.com/builds/sync` (external service). Template zip is stored as `TexTemplate` with `mainContent` (the `.tex` entry file) and `auxFiles` (supporting files). Parses `!`-prefixed lines from LaTeX error logs.
- **`prompts.ts`** — Two prompt builders: `buildCvTailoringPrompt` and `buildQuestionAnswerPrompt`.

### Path Alias

`@/` maps to the project root (configured in WXT). Use `@/lib/...` for imports from the `lib/` directory.

### Storage Schema

All state lives in `chrome.storage.local`. There is no backend. The OpenAI API key is stored in local extension storage (not synced).

### LaTeX Template Format

Templates are uploaded as `.zip` files. The zip must contain a main `.tex` file; auxiliary files (`.cls`, `.sty`, images, etc.) are stored as `AuxFile[]` with relative paths. The `TexTemplate` object is JSON-serialized into storage.
