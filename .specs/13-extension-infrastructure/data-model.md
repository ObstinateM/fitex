# Data Model

## Storage Schema

All state lives in `chrome.storage.local`. There is no backend, no sync storage, and no external database. The storage module (`lib/storage.ts`) provides typed getter/setter functions for each key.

### Storage Keys

| Key | Type | Default | Description |
|---|---|---|---|
| `openai_api_key` | `string` | `undefined` | OpenAI API key (stored locally, never synced) |
| `tex_template` | `TexTemplate` | `undefined` | LaTeX CV template (main `.tex` content + auxiliary files) |
| `latex_compiler` | `LatexCompiler` | `"pdflatex"` | Selected LaTeX compiler |
| `openai_model` | `OpenAIModel` | `"gpt-5.2"` | Selected AI model |
| `is_onboarded` | `boolean` | `false` | Whether onboarding has been completed |
| `user_context` | `string` | `""` | Persistent guidance text sent with AI prompts |
| `profile_image` | `AuxFile` | `null` | Profile photo (stored as AuxFile with base64 encoding) |
| `cv_history` | `HistoryEntry[]` | `[]` | Generation history (max 20 entries, newest first) |
| `user_stories` | `Story[]` | `[]` | Professional stories for AI context |

### Internal Storage Constants

```typescript
const KEYS = {
  apiKey: "openai_api_key",
  template: "tex_template",
  compiler: "latex_compiler",
  model: "openai_model",
  onboarded: "is_onboarded",
  context: "user_context",
  profileImage: "profile_image",
  history: "cv_history",
  stories: "user_stories",
} as const;
```

### History Limits

History is capped at 20 entries (`MAX_HISTORY = 20`). When a new entry is added, it is prepended to the array and the array is sliced to the max length. Oldest entries are silently dropped.

## Complete TypeScript Types

All types are defined in `lib/types.ts`.

### Element Selection

```typescript
type ElementTag = "job-description" | "question";

interface SelectedElement {
  id: string;          // crypto.randomUUID() assigned when element is selected
  text: string;        // Extracted inner text of the DOM element
  tag: ElementTag;     // User-assigned tag: job description or question
  guidance?: string;   // Optional per-element focus note
}
```

### LaTeX Template

```typescript
interface TexTemplate {
  mainContent: string;   // The main .tex file content
  auxFiles: AuxFile[];   // Supporting files (.cls, .sty, images, etc.)
}

interface AuxFile {
  path: string;          // Relative path within the zip (e.g., "resume.cls")
  content: string;       // UTF-8 text for .cls/.sty/.tex; base64 for binary files
  encoding?: "base64";   // Present only for binary files (images, fonts, etc.)
}
```

### Configuration Enums

```typescript
type LatexCompiler = "pdflatex" | "xelatex" | "lualatex";

type OpenAIModel = "gpt-5.2" | "gpt-4.1" | "gpt-4.1-mini" | "gpt-4.1-nano" | "o4-mini";
```

### Generation Results

```typescript
interface AnswerItem {
  question: string;      // The question text from the selected element
  answer: string;        // AI-generated answer
  elementId?: string;    // ID of the source element (used for form auto-fill)
}

interface KeywordItem {
  keyword: string;
  category: "hard-skill" | "tool" | "certification" | "methodology" | "language";
  present: boolean;      // Whether the keyword was found in the CV
}

interface KeywordScanResult {
  keywords: KeywordItem[];
  atsPassRate?: number;  // 0-100 estimated ATS pass rate
}

interface SalaryEstimate {
  currency: string;
  marketLow: number;
  marketHigh: number;
  recommendedAsk: number;
  justification: string;
  confidence: "low" | "medium" | "high";
}

interface GenerationResult {
  pdfBlob: Blob | null;                    // Compiled PDF (null if compilation failed)
  modifiedTex: string;                     // AI-tailored LaTeX source
  answers: AnswerItem[];                   // Answers to selected questions
  latexErrors: string[];                   // Parsed LaTeX error messages
  jobDescription: string;                  // Combined job description text
  keywordScanBefore?: KeywordScanResult;   // Keywords in original CV vs job desc
  keywordScanAfter?: KeywordScanResult;    // Keywords in tailored CV vs job desc
  salaryEstimate?: SalaryEstimate;         // Salary market estimate
}
```

### History

```typescript
interface HistoryEntry {
  id: string;                              // crypto.randomUUID()
  createdAt: number;                       // Date.now() timestamp
  jobDescription: string;                  // Truncated to first 200 chars
  pdfBase64: string;                       // PDF as base64 (empty string if no PDF)
  modifiedTex: string;                     // Tailored LaTeX source
  answers: AnswerItem[];                   // Question answers
  latexErrors: string[];                   // LaTeX compilation errors
  elements?: SelectedElement[];            // Original selected elements (optional for backward compat)
  guidance?: string;                       // Guidance text used during generation
  keywordScanBefore?: KeywordScanResult;   // Pre-tailoring keyword scan
  keywordScanAfter?: KeywordScanResult;    // Post-tailoring keyword scan
  salaryEstimate?: SalaryEstimate;         // Salary estimate
}
```

### Stories

```typescript
interface Story {
  id: string;            // crypto.randomUUID()
  title: string;         // Short story title
  description: string;   // Full story description
  tags: string[];        // Categorization tags
  createdAt: number;     // Date.now() timestamp
  updatedAt: number;     // Date.now() timestamp (updated on edit)
}

interface StorySelection {
  id: string;            // Story ID
  reason: string;        // AI-generated reason for selecting this story
}
```

### Message Types (Content Script <-> Side Panel)

The `Message` discriminated union defines all communication between the content script and the side panel:

```typescript
type Message =
  | { type: "START_SELECTION" }                                    // Side panel -> Content: begin selection mode
  | { type: "STOP_SELECTION" }                                     // Side panel -> Content: end selection mode
  | { type: "CLEAR_SELECTIONS" }                                   // Side panel -> Content: remove all selections
  | { type: "DESELECT_ELEMENT"; payload: { id: string } }         // Side panel -> Content: deselect specific element
  | { type: "PING" }                                               // Side panel -> Content: check if script is injected
  | { type: "PONG" }                                               // Content -> Side panel: response to PING
  | { type: "ELEMENT_SELECTED"; payload: { id: string; text: string } }   // Content -> Side panel: element was selected
  | { type: "ELEMENT_DESELECTED"; payload: { id: string } }       // Content -> Side panel: element was deselected
  | { type: "FILL_FIELD"; payload: { id: string; value: string } }        // Side panel -> Content: fill form field
  | { type: "FILL_RESULT"; payload: { id: string; success: boolean; error?: string } }; // Content -> Side panel: fill result
```

### Message Flow Direction

| Message | Direction | Purpose |
|---|---|---|
| `START_SELECTION` | Side panel -> Content | Activate hover/click selection mode |
| `STOP_SELECTION` | Side panel -> Content | Deactivate selection mode |
| `CLEAR_SELECTIONS` | Side panel -> Content | Remove all selected outlines |
| `DESELECT_ELEMENT` | Side panel -> Content | Remove selection from specific element |
| `PING` / `PONG` | Side panel <-> Content | Check if content script is injected |
| `ELEMENT_SELECTED` | Content -> Side panel | Notify that user clicked to select an element |
| `ELEMENT_DESELECTED` | Content -> Side panel | Notify that user clicked to deselect an element |
| `FILL_FIELD` | Side panel -> Content | Request to auto-fill a form field with an answer |
| `FILL_RESULT` | Content -> Side panel | Report success/failure of form fill |

## Storage API Functions

The `lib/storage.ts` module exposes the following functions:

| Function | Returns | Description |
|---|---|---|
| `getApiKey()` | `Promise<string \| undefined>` | Get stored API key |
| `setApiKey(key)` | `Promise<void>` | Store API key |
| `getTemplate()` | `Promise<TexTemplate \| undefined>` | Get stored template |
| `setTemplate(template)` | `Promise<void>` | Store template |
| `getCompiler()` | `Promise<LatexCompiler>` | Get compiler (default: `"pdflatex"`) |
| `setCompiler(compiler)` | `Promise<void>` | Store compiler |
| `getModel()` | `Promise<OpenAIModel>` | Get model (default: `"gpt-5.2"`) |
| `setModel(model)` | `Promise<void>` | Store model |
| `getOnboarded()` | `Promise<boolean>` | Get onboarded flag (default: `false`) |
| `setOnboarded(value)` | `Promise<void>` | Store onboarded flag |
| `getContext()` | `Promise<string>` | Get user context (default: `""`) |
| `setContext(context)` | `Promise<void>` | Store user context |
| `getProfileImage()` | `Promise<AuxFile \| null>` | Get profile image (default: `null`) |
| `setProfileImage(img)` | `Promise<void>` | Store profile image |
| `clearProfileImage()` | `Promise<void>` | Remove profile image |
| `getHistory()` | `Promise<HistoryEntry[]>` | Get history (default: `[]`) |
| `addHistoryEntry(entry)` | `Promise<void>` | Prepend entry, cap at 20 |
| `deleteHistoryEntry(id)` | `Promise<void>` | Remove entry by ID |
| `clearHistory()` | `Promise<void>` | Remove all history |
| `getStories()` | `Promise<Story[]>` | Get stories (default: `[]`) |
| `addStory(story)` | `Promise<void>` | Prepend a single story |
| `addStories(stories)` | `Promise<void>` | Prepend multiple stories (bulk import) |
| `updateStory(id, updates)` | `Promise<void>` | Partial update of a story (auto-sets `updatedAt`) |
| `deleteStory(id)` | `Promise<void>` | Remove story by ID |
