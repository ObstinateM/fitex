# Salary Estimation

## Purpose

Estimates a market salary range and recommended ask for the job, based on the job description and candidate's CV.

## How It Works

- Runs during generation Step 3, in parallel with question answering
- Non-critical — failures silently ignored (feature gracefully degrades)
- Uses non-streaming `chatCompletion`
- Analyzes job description + candidate's ORIGINAL CV template (not tailored)
- Shows on Results page via SalaryCard component
- Saved to history for later viewing

## Sub-features

- [Salary Estimate Prompt](./salary-estimate-prompt.md) — Exact AI prompt
- [Salary Card UI](./salary-card-ui.md) — Display component
