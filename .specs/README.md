# KNOWLEDGE_EXPORT - CV Assistant Extension

Complete feature documentation for recreating the application as a webapp. Each directory documents one feature group, with sub-files for each sub-feature.

## Feature Index

| # | Feature | Files | Description |
|---|---------|-------|-------------|
| 01 | [Onboarding](./01-onboarding/) | 4 | First-run setup: API key, template upload, profile photo |
| 02 | [CV Generation](./02-cv-generation/) | 4 | Core pipeline: tailoring prompt, streaming, parallel execution |
| 03 | [ATS Keyword Analysis](./03-ats-keyword-analysis/) | 5 | Pre-scan, before/after comparison, prompt, visualization |
| 04 | [Results & Refinement](./04-results-and-refinement/) | 7 | PDF preview, reduce to 1 page, feedback loop, match score |
| 05 | [Question Answering](./05-question-answering/) | 4 | AI answers, copy/fill actions, form field auto-fill |
| 06 | [Salary Estimation](./06-salary-estimation/) | 3 | Market range, recommended ask, confidence |
| 07 | [Stories](./07-stories/) | 7 | CRUD, AI enhancement, bulk import, relevance filter |
| 08 | [History](./08-history/) | 4 | Auto-save, view/re-run, 20-entry cap |
| 09 | [Settings](./09-settings/) | 2 | All configurable fields, navigation hub |
| 10 | [DOM Element Selection](./10-dom-element-selection/) | 5 | Content script, selection mode, tagging, messaging |
| 11 | [LaTeX Compilation](./11-latex-compilation/) | 4 | External service, security, error parsing |
| 12 | [Cost Estimation](./12-cost-estimation/) | 3 | Token estimation, per-model pricing |
| 13 | [Extension Infrastructure](./13-extension-infrastructure/) | 5 | Navigation, data model, browser compat, error handling |

**Total: 57 documentation files across 13 feature groups.**

## What's Documented

- Every user-facing feature and workflow
- All AI prompts (exact text, data sections, expected responses)
- Complete data model and storage schema
- API integrations (OpenAI, LaTeX compilation service)
- UI component behavior and state management
- Security measures
- Cost estimation logic with per-model pricing
- Chrome extension infrastructure (for reference during webapp migration)

## How to Use These Docs

Each feature directory has a `README.md` overview linking to sub-feature files. Start with the README of any feature to understand its purpose, then dive into sub-files for implementation details.

For recreating the app as a webapp, the key differences will be:
- **Storage**: Replace `chrome.storage.local` with a database
- **DOM Selection**: Replace content script with text input or browser extension companion
- **Form Auto-Fill**: Replace with clipboard copy or platform API integrations
- **Side Panel**: Replace with standard web layout
- **API Keys**: Move to server-side storage and proxy API calls
