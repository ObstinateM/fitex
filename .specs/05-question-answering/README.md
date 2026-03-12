# Question Answering

## Purpose

Automatically answers job application questions based on the candidate's CV, professional stories, and the job description. Answers can be copied or auto-filled into form fields on the page.

## How It Works

1. User selects page elements containing application questions
2. Tags them as `"question"` (vs `"job-description"`)
3. Optionally adds per-question guidance: "How should this question be answered?"
4. During generation (Step 3), each question gets its own API call
5. Answers displayed in AnswerCard components on Results page
6. Each answer can be copied or auto-filled into the original form field

## Key Design Decision

**Question answers do NOT receive the global guidance text** - only per-question `questionGuidance`. This prevents CV-specific instructions (e.g., "emphasize Python experience") from leaking into question answers where they don't belong.

## Sub-features

- [Question Answer Prompt](./question-answer-prompt.md) - Exact AI prompt
- [Answer Display and Actions](./answer-display-and-actions.md) - Copy, fill, fill-all
- [Form Field Auto-Fill](./form-field-auto-fill.md) - How the content script finds and fills form fields
