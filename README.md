# Fitex

A Chrome extension that tailors your LaTeX CV to any job description using AI. Select content from a job posting, generate a custom-compiled PDF, and get answers to application questions — all from the browser side panel.

## Features

- **Point-and-click selection** — highlight any text on a job page (description, questions) without copy-pasting
- **AI CV tailoring** — streams a modified version of your LaTeX source via OpenAI
- **Live PDF compilation** — compiles the tailored LaTeX on the fly and previews the PDF inline
- **Parallel question answering** — answers application questions simultaneously while the CV compiles
- **Per-element guidance** — attach a focus note to any selected element (job description or question) to steer the AI for that specific piece of content, in addition to a global guidance field
- **Token & cost estimator** — shows a live estimate of token count and OpenAI cost before you hit Generate, updated as you select elements and type guidance
- **CV–job match score** — on-demand analysis in the Results panel that scores the tailored CV against the job description (0–100) and lists strengths and gaps
- **Iterative refinement** — after reviewing results, type feedback ("shorten the summary", "emphasize Python more") and regenerate from the already-tailored LaTeX without starting over
- **History with re-run** — browse previous generations and restore any entry's full context (elements, guidance) back into the selector to branch from it
- **Fully local** — no backend; your API key and template stay in `chrome.storage.local`

## Setup

### Prerequisites

- [OpenAI API key](https://platform.openai.com/api-keys)
- A LaTeX CV as a `.zip` file (must contain a main `.tex` entry file; supporting files like `.cls`, `.sty`, images are included as auxiliary files)

### Install from release

1. Download the latest `fitex-x.x.x-chrome.zip` from the [Releases](../../releases) page
2. Unzip it
3. Open `chrome://extensions`, enable **Developer mode**
4. Click **Load unpacked** and select the unzipped folder

### First run

The extension opens a side panel when you click the toolbar icon. On first launch:

1. **Step 1** — Enter your OpenAI API key (validated against the API before proceeding)
2. **Step 2** — Upload your LaTeX template `.zip` and optionally a profile photo

Settings (model, compiler, template, context) can be changed anytime via the gear icon.

## Usage

1. Open a job posting in Chrome
2. Click the Fitex toolbar icon to open the side panel
3. Click **Select Elements** and click on sections of the page (job description, required skills, application questions, etc.)
4. Tag each element as **Job Description** or **Question**
5. Optionally add a focus note to individual elements and/or a global guidance note
6. Check the token/cost estimate shown below the Generate button
7. Click **Generate** — Fitex will:
   - Tailor your CV source to the job description (streamed)
   - Compile the modified LaTeX to PDF
   - Answer any tagged questions in parallel
8. In the Results panel:
   - Download or preview the PDF
   - Click **CV–Job Match Score** for an instant fit analysis
   - Use **Refine with feedback** to iterate on the CV without restarting
   - Use **Reduce to 1 page** if the PDF runs over
9. Past generations are saved to **History** — use **Re-run** on any entry to restore its full context into the selector

## Development

```bash
npm install
npm run dev        # Load as unpacked extension with hot reload
npm run build      # Production build → .output/chrome-mv3/
npm run zip        # Build and zip → .output/fitex-x.x.x-chrome.zip
```

Load the extension from `.output/chrome-mv3-dev/` (dev) or `.output/chrome-mv3/` (production) via `chrome://extensions` → Load unpacked.

## Stack

- [WXT](https://wxt.dev/) — browser extension framework (Chrome MV3)
- React 19 + TypeScript
- Tailwind CSS v4
- OpenAI API (streaming chat completions)
- [latex.ytotech.com](https://latex.ytotech.com) — remote LaTeX compilation

## Releases

Releases are created automatically by GitHub Actions on every merge to `main` that bumps the version in `package.json`. The release includes the compiled zip and a changelog generated from commit messages.

To publish a new version:

1. Update `"version"` in `package.json`
2. Merge to `main`
