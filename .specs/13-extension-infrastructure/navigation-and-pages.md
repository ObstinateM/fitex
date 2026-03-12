# Navigation and Pages

## Page Types

`App.tsx` manages navigation via a `Page` union type:

```typescript
type Page = "onboarding" | "selector" | "results" | "settings" | "history" | "stories" | "import-stories";
```

## Initial Page Resolution

On mount, the app checks the `is_onboarded` flag in `chrome.storage.local`:

- If `true`: navigates to `"selector"`
- If `false` (or not set): stays on `"onboarding"`

While the check is in progress, a loading state is shown: a centered spinner (`animate-spin` rounded circle) filling the full viewport height.

## Page Components

| Page | Component | File |
|---|---|---|
| `"onboarding"` | `Onboarding` | `pages/Onboarding.tsx` |
| `"selector"` | `Selector` | `pages/Selector.tsx` |
| `"results"` | `Results` | `pages/Results.tsx` |
| `"settings"` | `SettingsModal` | `components/SettingsModal.tsx` |
| `"history"` | `History` | `pages/History.tsx` |
| `"stories"` | `Stories` | `pages/Stories.tsx` |
| `"import-stories"` | `ImportStories` | `pages/ImportStories.tsx` |

## Navigation Flows

### Onboarding -> Selector

When onboarding completes (user has set API key, uploaded template, configured compiler and model), the `onComplete` callback fires and sets the page to `"selector"`.

### Selector -> Results

After generation completes, `handleGenerated` is called with the `GenerationResult`, the selected elements, and the guidance string. The result is stored in state, and the page is set to `"results"`. The generation is also auto-saved to history.

### Results -> Selector (back)

When the user clicks the back button (labeled "Adjust & Regenerate"), the page returns to `"selector"`. The previously selected elements and guidance are restored so the user can adjust and re-run.

### Results -> History (back from history view)

When viewing a result from history, the back button label changes to "Back to History". Clicking it sets the page back to `"history"` and clears the `fromHistory` flag.

### History -> Results (view)

Clicking "view" on a history entry reconstructs a `GenerationResult` from the `HistoryEntry` (converting `pdfBase64` back to a `Blob`) and navigates to `"results"` with `fromHistory = true`.

### History -> Selector (re-run)

Clicking "re-run" on a history entry restores the stored elements and guidance (or synthesizes an element from the job description snippet for backward compatibility) and navigates to `"selector"`.

### Any main page -> Settings

The gear icon triggers `openSettings()`, which remembers the current page as `returnPage` (only if the current page is `"selector"`, `"results"`, or `"history"`) and sets the page to `"settings"`.

### Settings -> Return page

Closing settings (via `onClose`) returns to the stored `returnPage`.

### Settings -> Stories

The "manage stories" button in settings calls `onOpenStories`, which sets the page to `"stories"`.

### Settings -> Import Stories

The "import stories" button in settings calls `onOpenImportStories`, which sets the page to `"import-stories"`.

### Stories -> Settings

The back button in Stories navigates back to `"settings"`.

### Import Stories -> Settings

The back button (or auto-return after import) navigates back to `"settings"`.

## Bottom Tab Bar

The tab bar is shown only when the current page is `"selector"` or `"history"`:

```typescript
const showTabBar = page === "selector" || page === "history";
```

Two tabs:

| Tab | Icon | Target Page | Active Condition |
|---|---|---|---|
| "Generate" | Pen/edit icon | `"selector"` | `page !== "history"` |
| "History" | Clock icon | `"history"` | `page === "history"` |

The active tab is highlighted in blue (`text-blue-600`); the inactive tab is gray (`text-gray-400`).

The tab bar is fixed to the bottom of the viewport (`fixed bottom-0 left-0 right-0 z-40`) with a top border and white background.

## Settings Gear Icon

Visibility condition:

```typescript
const showSettings = page !== "onboarding" && page !== "settings" && page !== "stories" && page !== "import-stories";
```

So it is visible on: `"selector"`, `"results"`, `"history"`.

Position: `fixed top-3 right-3 z-40` -- always in the top-right corner, floating above page content.

## State Passed Between Pages

### Selector -> Results

The `handleGenerated` callback passes:
- `GenerationResult` (pdfBlob, modifiedTex, answers, latexErrors, jobDescription, keywordScanBefore, keywordScanAfter, salaryEstimate)
- `SelectedElement[]` (the selected page elements)
- `string` (the guidance text)

All three are stored in `AppInner` state for restoration on back-navigation.

### Results -> Selector (back navigation)

The `previousElements` and `previousGuidance` props are passed to `Selector`, which initializes its local state from them. This restores the user's previous selections and guidance.

### History -> Results (view)

A `GenerationResult` is reconstructed from the `HistoryEntry`:
- `pdfBase64` is converted back to a `Blob` via `base64ToBlob`
- All other fields are copied directly
- `fromHistory` is set to `true` to change the back button behavior

### History -> Selector (re-run)

The stored `elements` and `guidance` from the `HistoryEntry` are set as `previousElements` and `previousGuidance`. If the entry lacks elements (backward compatibility), a synthetic element is created from the `jobDescription` snippet.
