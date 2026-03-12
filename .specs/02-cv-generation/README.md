# CV Generation

## Purpose

The core feature of the application. Takes a LaTeX CV template, a job description, optional guidance/context, and optional professional stories, then produces a tailored CV as a compiled PDF.

## High-Level Flow

```
User Input → Story Filter → CV Tailoring (streamed) → Keyword Scans → PDF Compilation → Question Answering + Salary Estimate → Results
```

All orchestrated from the Selector page, with results displayed on the Results page.

## Key Characteristics

- CV tailoring uses **SSE streaming** for real-time output
- **Parallel execution** where possible (keyword scan + tailoring, questions + salary)
- **Non-critical features** (salary, keyword scans) fail silently
- Results auto-saved to history
- 2-second cooldown between generations

## Sub-features

- [Generation Pipeline](./generation-pipeline.md) - Full step-by-step flow
- [CV Tailoring Prompt](./cv-tailoring-prompt.md) - The exact AI prompt
- [Streaming](./streaming.md) - SSE streaming implementation
