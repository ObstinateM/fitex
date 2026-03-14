# Fitex — Feature TODO

## 01 — Onboarding

- [X] **Template Upload** — Single `.tex` or `.zip` upload with safety limits (10MB compressed, 50MB extracted, 100 files max), path traversal & binary detection.
  Touches: `webapp`
  Specs: [README](.specs/01-onboarding/README.md) · [template-upload](.specs/01-onboarding/template-upload.md)

- [X] **Profile Photo Upload** — Optional image upload (JPG/PNG/GIF/WebP) stored as base64 AuxFile, referenced in LaTeX via `\includegraphics`.
  Touches: `webapp`
  Specs: [profile-photo-upload](.specs/01-onboarding/profile-photo-upload.md)

---

## 02 — CV Generation

- [ ] **Generation Pipeline** — Full orchestration: story filter → CV tailoring (streamed) → keyword scans → PDF compilation → Q&A + salary. AbortController for cancellation, 2s cooldown.
  Touches: `webapp` · `api` · `extension`
  Specs: [README](.specs/02-cv-generation/README.md) · [generation-pipeline](.specs/02-cv-generation/generation-pipeline.md)

- [ ] **Streaming** — Streamed AI responses for CV tailoring step.
  Touches: `webapp` · `api`
  Specs: [streaming](.specs/02-cv-generation/streaming.md)

---

## 03 — ATS Keyword Analysis

- [ ] **Pre-generation Scan** — Debounced (2s) automatic scan as user selects job description elements. Non-critical, silent fail.
  Touches: `webapp` · `api`
  Specs: [pre-generation-scan](.specs/03-ats-keyword-analysis/pre-generation-scan.md)

- [ ] **Before/After Scan** — Before scan runs parallel with CV tailoring on original template; after scan runs post-tailoring.
  Touches: `webapp` · `api`
  Specs: [before-after-scan](.specs/03-ats-keyword-analysis/before-after-scan.md)

- [ ] **Keyword Scan Card UI** — Merged keyword list with new matches (emerald), present (green), missing (red). ATS pass rate badges with delta indicator, progress bar overlay.
  Touches: `webapp`
  Specs: [keyword-scan-card-ui](.specs/03-ats-keyword-analysis/keyword-scan-card-ui.md)

---

## 04 — Results & Refinement

- [ ] **PDF Preview** — Embedded PDF in iframe (`#toolbar=0`), download & open-in-new-tab actions. Red banner on compilation failure.
  Touches: `webapp`
  Specs: [pdf-preview](.specs/04-results-and-refinement/pdf-preview.md)

- [ ] **Reduce to One Page** — Iterative AI trimming to fit PDF to 1 page. Page counting via `/Count` regex or decompressed object streams. 2s cooldown.
  Touches: `webapp` · `api`
  Specs: [reduce-to-one-page](.specs/04-results-and-refinement/reduce-to-one-page.md)

- [ ] **Feedback Refinement** — Textarea for natural language feedback. Streams refined LaTeX, re-compiles, re-scans keywords, saves as new history entry.
  Touches: `webapp` · `api`
  Specs: [feedback-refinement](.specs/04-results-and-refinement/feedback-refinement.md)

- [ ] **Match Score** — On-demand CV-job fit score (0-100) with strengths/gaps pills. Non-critical, hidden on failure.
  Touches: `webapp` · `api`
  Specs: [match-score](.specs/04-results-and-refinement/match-score.md)

- [ ] **LaTeX Error Display** — Expandable section showing compilation errors (lines starting with `!`). Red background, monospace, max 192px.
  Touches: `webapp`
  Specs: [latex-error-display](.specs/04-results-and-refinement/latex-error-display.md)

- [ ] **Modified TeX Source** — Expandable section showing raw tailored LaTeX source for debugging.
  Touches: `webapp`
  Specs: [modified-tex-source](.specs/04-results-and-refinement/modified-tex-source.md)

---

## 05 — Question Answering

- [ ] **Answer Display & Actions** — AnswerCard with question (purple) and answer (gray). Copy button with "Copied!" feedback. Fill button sends `FILL_FIELD` message.
  Touches: `webapp` · `extension`
  Specs: [answer-display-and-actions](.specs/05-question-answering/answer-display-and-actions.md)

- [ ] **Form Field Auto-Fill** — 6-strategy field-finding algorithm. Native setter bypasses React. 2px blue outline flash for 1s visual feedback.
  Touches: `extension`
  Specs: [form-field-auto-fill](.specs/05-question-answering/form-field-auto-fill.md)

---

## 06 — Salary Estimation

- [ ] **Salary Card UI** — Market range, target ask, confidence badge (green/yellow/red), 1-2 sentence justification. Locale-aware currency via `Intl.NumberFormat`.
  Touches: `webapp`
  Specs: [salary-card-ui](.specs/06-salary-estimation/salary-card-ui.md)

---

## 07 — Stories

- [ ] **Story Management (CRUD)** — Inline add form, expandable story list, edit mode, two-click delete. Empty state guidance. 20-char summary, count footer.
  Touches: `webapp`
  Specs: [story-management](.specs/07-stories/story-management.md)

- [ ] **Story Enhancement** — AI polish button in add/edit forms. Returns polished narrative + tags. Form values replaced but not auto-saved.
  Touches: `webapp` · `api`
  Specs: [story-enhancement](.specs/07-stories/story-enhancement.md)

- [ ] **Bulk Import** — 3-phase flow: raw text input → AI parsing (200-char min descriptions) → review with editable cards + duplicate warnings → import.
  Touches: `webapp` · `api`
  Specs: [bulk-import](.specs/07-stories/bulk-import.md)

- [ ] **Duplicate Detection** — Title substring match (>50%) and tag Jaccard coefficient (>60%). First match per story flagged with warning.
  Touches: `webapp`
  Specs: [duplicate-detection](.specs/07-stories/duplicate-detection.md)

- [ ] **Story Relevance Filter** — Pre-generation AI filtering using story summaries only (title + tags). Returns StorySelection[] with relevance reasons. Validates against hallucinated IDs.
  Touches: `webapp` · `api`
  Specs: [story-relevance-filter](.specs/07-stories/story-relevance-filter.md)

- [ ] **Story Confirmation UI** — Blue card with AI-selected stories (checkboxes, reasons) + "Other stories" section. Promise-based flow pauses generation for user confirmation.
  Touches: `webapp`
  Specs: [story-confirmation-ui](.specs/07-stories/story-confirmation-ui.md)

---

## 08 — History

- [ ] **Auto-Save** — Saves successful generations after navigation to Results. Job description truncated to 200 chars. PDF blob → base64 via chunked `String.fromCharCode`.
  Touches: `webapp`
  Specs: [auto-save](.specs/08-history/auto-save.md)

- [ ] **History List** — 20 entries with date/time, ATS pass rate badge, answer count badge, job description (line-clamp-2). View/Re-run/Delete actions. "Clear all" button.
  Touches: `webapp`
  Specs: [history-list](.specs/08-history/history-list.md)

- [ ] **View & Re-run** — View reconstructs GenerationResult from HistoryEntry (base64 → Blob). Re-run restores elements and guidance. Backward compatibility for legacy entries.
  Touches: `webapp`
  Specs: [view-and-rerun](.specs/08-history/view-and-rerun.md)

---

## 09 — Settings

- [ ] **Settings Page** — Full-page modal with sticky header. Explicit "Save Settings" click required. "Saved!" confirmation for 2s. Remembers return page.
  Touches: `webapp`
  Specs: [README](.specs/09-settings/README.md)

- [ ] **Settings Fields** — Context textarea (persistent guidance), template re-upload, profile photo, manage stories nav, import stories nav.
  Touches: `webapp`
  Specs: [settings-fields](.specs/09-settings/settings-fields.md)

---

## 10 — DOM Element Selection

- [ ] **Content Script Injection** — Runtime registration via `chrome.scripting.executeScript` (not page-load). PING check confirms injection. Styles injected once with guard.
  Touches: `extension`
  Specs: [content-script-injection](.specs/10-dom-element-selection/content-script-injection.md)

- [ ] **Selection Mode** — Toggle button activates/deactivates. Hover: blue outline. Click: green outline + bg. Smart `findBestElement` bubble-up for 12 inline tags. Text normalization.
  Touches: `extension`
  Specs: [selection-mode](.specs/10-dom-element-selection/selection-mode.md)

- [ ] **Element Tagging** — Two tag types: "job-description" (blue) and "question" (purple). Per-element guidance textareas. Text truncated to 120 chars in list.
  Touches: `webapp` · `extension`
  Specs: [element-tagging](.specs/10-dom-element-selection/element-tagging.md)

- [ ] **Messaging Protocol** — Discriminated union Message type: START/STOP_SELECTION, CLEAR/DESELECT, FILL_FIELD, PING and corresponding events. Side panel ↔ content script messaging.
  Touches: `extension`
  Specs: [messaging-protocol](.specs/10-dom-element-selection/messaging-protocol.md)

---

## 11 — LaTeX Compilation

- [ ] **Compilation Service** — External service `latex.ytotech.com/builds/sync`. Supports pdflatex/xelatex/lualatex. Template files + profile image sent as resources. Returns PDF blob or log text.
  Touches: `api`
  Specs: [compilation-service](.specs/11-latex-compilation/compilation-service.md)

- [ ] **Error Parsing** — Parses LaTeX logs: lines starting with `!` are errors, includes next line for context. Returns array of error strings.
  Touches: `webapp`
  Specs: [error-parsing](.specs/11-latex-compilation/error-parsing.md)

- [ ] **Security** — Blocks 6 dangerous LaTeX patterns (`\write18`, `\immediate\write`, etc.). ZIP bomb protection. Path traversal validation rejects `..` and absolute paths.
  Touches: `webapp`
  Specs: [security](.specs/11-latex-compilation/security.md)

---

## 13 — Extension Infrastructure

- [ ] **Data Model** — Complete TypeScript types: SelectedElement, TexTemplate, AuxFile, GenerationResult, HistoryEntry, Story, Message union. Typed storage functions.
  Touches: `extension`
  Specs: [data-model](.specs/13-extension-infrastructure/data-model.md)

- [ ] **Navigation & Pages** — 7 pages: onboarding → selector → results → settings → stories/import-stories → history. Tab bar on selector/history. Settings gear on selector/results/history.
  Touches: `extension`
  Specs: [navigation-and-pages](.specs/13-extension-infrastructure/navigation-and-pages.md)

- [ ] **Browser Compatibility** — Dual-mode: Chrome 114+ uses `chrome.sidePanel`; older browsers use popup window (420×700px). Feature detection at runtime.
  Touches: `extension`
  Specs: [browser-compatibility](.specs/13-extension-infrastructure/browser-compatibility.md)

- [ ] **Error Handling** — React ErrorBoundary at top level. Generation errors as red status text (5s auto-clear). Non-critical features fail silently. API error mapping (401/429/5xx → friendly messages).
  Touches: `extension`
  Specs: [error-handling](.specs/13-extension-infrastructure/error-handling.md)

- [ ] **Utility Functions** — `truncate(text, maxLen)` with Unicode ellipsis.
  Touches: `extension`
  Specs: [utility-functions](.specs/13-extension-infrastructure/utility-functions.md)

---

## Pricing & Credits

- [ ] **Credit-based Pricing** — Free: 3 credits. Starter: €9/15 credits. Pro Pack: €19/40 credits. Unlimited Month: €39/30 days. 1 credit = 1 generation. Post-generation actions free. Referral: 2 credits/referral.
  Touches: `webapp` · `api`
  Specs: [PRICING](.specs/PRICING.md)
