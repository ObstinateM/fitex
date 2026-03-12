# ATS Keyword Analysis

## Purpose

Analyzes the candidate's CV against a job description to identify ATS (Applicant Tracking System) keywords, check which are present, and estimate an ATS pass rate. Provides a before/after comparison showing how tailoring improved keyword coverage.

## Three-Layer System

1. **Pre-generation scan** — Live, debounced scan using `gpt-4.1-nano` (cheapest model). Shows current keyword coverage before the user generates.
2. **"Before" scan** — Runs during generation on the ORIGINAL template. Captures the baseline.
3. **"After" scan** — Runs during generation on the TAILORED CV. Shows improvement.

The before/after comparison is the primary output, visualized with a delta indicator.

## Sub-features

- [Pre-Generation Scan](./pre-generation-scan.md)
- [Before/After Scan](./before-after-scan.md)
- [Keyword Scan Prompt](./keyword-scan-prompt.md) — Exact AI prompt used by all three scans
- [Keyword Scan Card UI](./keyword-scan-card-ui.md) — The results visualization
